import {
  Configuration,
  ChatCompletionResponseMessage,
  OpenAIApi,
} from "openai";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { copyRecursiveSync } from "../utlities/generate-utilities";
import * as utlities from "../utlities/utilities";
import * as Yaml from "js-yaml";
import * as fs from "fs";
import { npmroot } from "../../src/helpers/helpers";
export const pwd = process.cwd();
import { TSAMTemplate } from "../roverTypes/rover.types";
dotenv.config({ path: `${npmroot}/@rover-tools/cli/.env` });
async function createChatCompletion(messages: string) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openAI = new OpenAIApi(configuration);

  const completion = await openAI.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [{ role: "user", content: messages }],
  });
  const content: ChatCompletionResponseMessage = <
    ChatCompletionResponseMessage
  >completion.data.choices[0].message;
  return content.content;
}

async function getLambdaDetails(JSONTemplate: TSAMTemplate) {
  const lambdaDetails: Record<string, Record<string, string>> = {};
  const SAMResources = JSONTemplate["Resources"];
  for (const logicalID of Object.keys(SAMResources)) {
    if (SAMResources[logicalID]["Type"] === "AWS::Serverless::Function") {
      lambdaDetails[logicalID] = {};
      lambdaDetails[logicalID]["FunctionName"] = <string>(
        SAMResources[logicalID]["Properties"]["FunctionName"]
      );
      lambdaDetails[logicalID]["path"] = <string>(
        SAMResources[logicalID]["Properties"]["Handler"]
      );
      lambdaDetails[logicalID]["language"] = <string>(
        SAMResources[logicalID]["Properties"]["Runtime"]
      );
      lambdaDetails[logicalID]["Description"] = <string>(
        SAMResources[logicalID]["Properties"]["Description"]
      );
      lambdaDetails[logicalID]["Logic"] =
        await createChatCompletion(`lambda logic for ${lambdaDetails[logicalID]["Description"]} , ${lambdaDetails[logicalID]["path"]}
      as Handler, and  ${lambdaDetails[logicalID]["language"]} as Runtime, Just the code, no explanation`);
    }
  }
  return lambdaDetails;
}

async function generateSAM(
  lambdaDetails: Record<string, Record<string, string>>,
  template: string,
  appName: string
) {
  fs.mkdirSync(`${pwd}/${appName}`);
  fs.writeFileSync(`${pwd}/${appName}/template.yaml`, template);
  for (const logicalID of Object.keys(lambdaDetails)) {
    const path = lambdaDetails[logicalID]["path"].replace(".handler", "");
    const paths = path.split("/");
    let dirpath = `${pwd}/${appName}`;
    for (const filename of paths) {
      dirpath = `${dirpath}/${filename}`;
      if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
      }
    }
    const path2 = `${pwd}/${appName}/${path}`;
    copyRecursiveSync(
      `${npmroot}/@rover-tools/cli/node_modules/@rover-tools/engine/assets/hello-world_node`,
      path2
    );
    fs.writeFileSync(`${path2}/app.js`, lambdaDetails[logicalID]["Logic"]);
  }
  return true;
}
export async function generateCustomSAM(appName: string, description: string) {
  try {
    let text = await createChatCompletion(
      `serverless aws sam yaml template for ${description} . Just the template, no explanation`
    );
    text = text.replace("```yaml", "").replace("```", "");
    const replacedText = utlities.replaceTempTag(text);
    const JSONTemplate = <TSAMTemplate>Yaml.load(replacedText);
    const lambdaDetails = await getLambdaDetails(JSONTemplate);
    await generateSAM(lambdaDetails, text, appName);
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
