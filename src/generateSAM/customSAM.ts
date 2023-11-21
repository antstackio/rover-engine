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
// eslint-disable-next-line no-useless-escape
const yaml_pattern = new RegExp(/```yaml[\na-zA-Z0-9_: '-\/!"${}]*```/g);
// eslint-disable-next-line no-useless-escape
const code_pattern = new RegExp(/```[\na-zA-Z0-9_: '-\/!"${}]*```/g);
import { TSAMTemplate } from "../roverTypes/rover.types";
dotenv.config({ path: `${npmroot}/@rover-tools/cli/.env` });
async function createChatCompletion(messages: string) {
  if (
    typeof process.env.OPENAI_API_KEY !== "string" ||
    process.env.OPENAI_API_KEY === ""
  ) {
    throw new Error(
      "OPENAI_API_KEY not found(set your OPENAI_API_KEY by running 'export OPENAI_API_KEY=<your key>'))"
    );
  }
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openAI = new OpenAIApi(configuration);

  const completion = await openAI.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.8,
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
      const logic_details = lambdaDetails[logicalID]["Description"];
      if (logic_details === "undefined") {
        logic_details == lambdaDetails[logicalID]["FunctionName"];
      }
      let logic_code =
        await createChatCompletion(`lambda logic for ${logic_details} , ${lambdaDetails[logicalID]["path"]}
      as Handler, and  ${lambdaDetails[logicalID]["language"]} as Runtime, Just the code, no explanation`);
      const code_array = code_pattern.exec(logic_code);
      if (code_array) {
        code_array[0] = code_array[0].replace("```", "");
        logic_code = code_array[0];
      }
      lambdaDetails[logicalID]["Logic"] = logic_code;
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
    const text = await createChatCompletion(
      `serverless aws sam yaml template for ${description} . Just the template, no explanation`
    );
    const resp = yaml_pattern.exec(text);
    if (resp) {
      resp[0] = resp[0].replace("```yaml", "").replace("```", "");
      //console.log("test", resp[0]);
      const replacedText = utlities.replaceTempTag(resp[0]);
      const JSONTemplate = <TSAMTemplate>Yaml.load(replacedText);
      const lambdaDetails = await getLambdaDetails(JSONTemplate);
      await generateSAM(lambdaDetails, resp[0], appName);
    } else {
      console.log(`AWS SAM template for ${description} \n`, text);
    }
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
