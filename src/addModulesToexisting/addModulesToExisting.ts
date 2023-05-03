import * as utlities from "../utlities/utilities";
import * as config from "../utlities/config";
import * as helpers from "../helpers/helpers";
import * as rover_resources from "../resources/resources";
import * as yaml from "yaml";
import * as fs from "fs";
import * as Yaml from "js-yaml";
import * as logics from "../resources/logics";
import {
  IroverAppData,
  IroverResources,
  TroverAppTypeObject,
  TroverResourcesArray,
  TSAMTemplateResources,
  IroverAppType,
  TSAMTemplate,
} from "../roverTypes/rover.types";
import { IstackDetails } from "../generateSAM/generatesam.types";
import {
  IroveraddModule,
  IroverCreateStackResponse,
  TlambdaProperties,
} from "./addModulesToExisting.types";

const pwd = utlities.pwd;

export function addModulesToExistingStack(input: IroveraddModule): void {
  try {
    const inputJSON = JSON.parse(JSON.stringify(input));
    inputJSON.appName = input.appName + "_test";
    const app_types = utlities.cliModuletoConfig(input, true);
    const app_data = utlities.getAppdata(input);
    const stackMap = stackMapping(Object.keys(app_types), input.stackDetails);
    const stackData = createStack(
      app_data,
      app_types,
      input.fileName,
      stackMap
    );
    createStackFolders(stackData);
    helpers.generateRoverConfig(input.appName, input, "rover_add_module");
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
export function createStack(
  app_data: IroverAppData,
  app_types: TroverAppTypeObject,
  filename: string,
  stackMap: Record<string, Record<string, string>>
): Record<string, IroverCreateStackResponse> {
  const stack_names: Array<string> = Object.keys(app_types);
  const resource = app_types;
  const stacks: TSAMTemplateResources = {};

  const responses: Record<string, IroverCreateStackResponse> = <
    Record<string, IroverCreateStackResponse>
  >{};
  for (const stack_name of stack_names) {
    const response: IroverCreateStackResponse = <IroverCreateStackResponse>{};
    const stack = rover_resources.resourceGeneration("stack", {
      TemplateURL: stack_name + "/template.yaml",
    });
    stacks[stack_name] = stack;
    const resources = resource[stack_name];
    const res = createStackResources(resources, app_data, stack_name);
    const template = utlities.addResourceTemplate(
      <TSAMTemplateResources>res["response"],
      Object.keys(res["response"]),
      undefined
    );
    if (Object.prototype.hasOwnProperty.call(resources, "parameter")) {
      template["Parameters"] = resources.parameter;
    }
    response["template"] = template;
    response["fileName"] = filename;
    response["appData"] = app_data;
    response["stackType"] = stackMap[stack_name]["stackType"];
    response["lambdaDetails"] = <
      Record<string, Record<string, TlambdaProperties>>
    >res["lambdaDetails"];
    responses[stackMap[stack_name]["stackName"]] = response;
  }
  return responses;
}

function createStackResources(
  resources: IroverAppType,
  app_data: IroverAppData,
  stack_names: string
): Record<
  string,
  TSAMTemplateResources | Record<string, Record<string, TlambdaProperties>>
> {
  const res: TSAMTemplateResources = {};
  const resourceObject: TroverResourcesArray = resources["resources"];
  const lambdaDetails: Record<string, Record<string, TlambdaProperties>> = {};
  resourceObject.forEach(function (element: IroverResources) {
    element.config[
      "Description"
    ] = `Rover-tools created ${element.name}  named ${element.type} resource`;
    if (config.samAbstract.includes(element.type)) {
      element.config["Tags"] = {
        createdBy: "rover",
        applicationName: app_data.appName,
      };
    } else {
      element.config["Tags"] = [
        { Key: "createdBy", Value: "rover" },
        {
          Key: "applicationName",
          Value: app_data.appName,
        },
      ];
    }
  });

  for (const j in resources["resources"]) {
    if (stack_names == "") {
      const randomString: string = helpers.makeId(4);
      resources["resources"][j]["name"] =
        resources["resources"][j]["name"] + randomString;
    }
    const configs = resources["resources"][j]["config"];
    if (
      Object.prototype.hasOwnProperty.call(
        config.AWSResources[resources["resources"][j]["type"]],
        "name"
      )
    ) {
      let name = resources["resources"][j]["name"].replace(" ", "");
      name = name.replace(/[^a-z0-9]/gi, "");
      configs[config.AWSResources[resources["resources"][j]["type"]]["name"]] =
        name;
    }
    if (resources["resources"][j]["type"] == "lambda") {
      configs["CodeUri"] = resources["resources"][j]["name"] + "/";
      configs["Runtime"] = app_data.language;
      lambdaDetails[resources["resources"][j]["name"]] = {};
      lambdaDetails[resources["resources"][j]["name"]]["logic"] =
        resources["resources"][j].logic;
      lambdaDetails[resources["resources"][j]["name"]]["logicpath"] =
        resources["resources"][j].logicpath;
      lambdaDetails[resources["resources"][j]["name"]]["package"] =
        resources["resources"][j].package;
      lambdaDetails[resources["resources"][j]["name"]]["stack_names"] =
        stack_names;
      lambdaDetails[resources["resources"][j]["name"]]["language"] =
        app_data.language;
    } else if (resources["resources"][j]["type"] == "apigateway") {
      configs["path"] = `${resources["resources"][j]["name"]}/swagger.yaml`;
      configs[
        "filepath"
      ] = `${app_data.appName}/${stack_names}/${resources["resources"][j]["name"]}/swagger.yaml`;
    }
    const resources1 = rover_resources.resourceGeneration(
      resources["resources"][j]["type"],
      configs
    );
    res[resources["resources"][j]["name"]] = resources1;
  }
  return { response: res, lambdaDetails: lambdaDetails };
}

function stackMapping(
  newStackNames: Array<string>,
  stackDetails: IstackDetails
) {
  const response: Record<string, Record<string, string>> = {};
  for (const stacks of newStackNames) {
    response[stacks] = {};
    response[stacks]["stackName"] = stackDetails[stacks].stackName;
    response[stacks]["stackType"] = stackDetails[stacks].type;
  }
  return response;
}

function createStackFolders(inputs: Record<string, IroverCreateStackResponse>) {
  for (const input of Object.keys(inputs)) {
    const path = `${inputs[input].appData.appName}/${input}`;
    const templateJSON: IroverCreateStackResponse = createResourceFiles(
      path,
      inputs[input]
    );
    createResourceTemplate(path, templateJSON);
    copyLambdaLogic(path, inputs[input].lambdaDetails);
  }
}

export function createResourceTemplate(
  path: string,
  data: IroverCreateStackResponse
) {
  const template = fs.readFileSync(`${pwd}${path}/template.yaml`, {
    encoding: "utf8",
    flag: "r",
  });
  const JSONTemplate: TSAMTemplate = <TSAMTemplate>(
    Yaml.load(utlities.replaceTempTag(template))
  );
  JSONTemplate.Resources = {
    ...JSONTemplate.Resources,
    ...data.template.Resources,
  };
  const doc = new yaml.Document();
  doc.contents = JSONTemplate;
  const temp = utlities.replaceYAML(doc.toString());
  utlities.writeFile(`${path}/template.yaml`, temp);
}
export function createResourceFiles(
  path: string,
  data: IroverCreateStackResponse
) {
  for (const logicalID of Object.keys(data.template.Resources)) {
    if (
      data.template.Resources[logicalID].Type ===
      config.AWSResources["lambda"]["type"]
    ) {
      let langCode;
      if (
        (<string>(
          data.template.Resources[logicalID].Properties["Runtime"]
        )).includes("node")
      ) {
        langCode = "node";
      } else if (
        (<string>(
          data.template.Resources[logicalID].Properties["Runtime"]
        )).includes("python")
      ) {
        langCode = "python";
      } else {
        throw new Error("RoverError:language not found");
      }
      copyRecursiveSync(
        `${config.npmroot}/@rover-tools/cli/node_modules/@rover-tools/engine/assets/hello-world_${langCode}`,
        `${pwd}${path}/${logicalID}`
      );
    } else if (
      data.template.Resources[logicalID].Type ===
      config.AWSResources["apigateway"]["type"]
    ) {
      const swaggersData: string = JSON.stringify(
        data.template.Resources[logicalID].Properties["swagger"]
      );
      fs.mkdirSync(`${pwd}${path}/${logicalID}API`);
      const doc = new yaml.Document();
      doc.contents = swaggersData;
      const swaggersYaml = utlities.replaceYAML(doc.toString());
      utlities.writeFile(`${path}/${logicalID}API/swagger.yaml`, swaggersYaml);
      delete data.template.Resources[logicalID].Properties["swagger"];
    }
  }
  return data;
}
export function copyRecursiveSync(src: string, dest: string) {
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(`${src}/${childItemName}`, `${dest}/${childItemName}`);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
function copyLambdaLogic(
  path: string,
  lambdaDetails: Record<string, Record<string, TlambdaProperties>>
) {
  if (typeof lambdaDetails === "object") {
    Object.keys(lambdaDetails).forEach((element) => {
      getLambdaLogic(path, element, lambdaDetails[element]);
    });
  }
}
function getLambdaLogic(
  path: string,
  lambdaName: string,
  lambdaDetail: Record<string, TlambdaProperties>
) {
  let response;
  if (
    Object.prototype.hasOwnProperty.call(lambdaDetail, "logicpath") &&
    Object.prototype.hasOwnProperty.call(lambdaDetail, "logic")
  ) {
    if (lambdaDetail["logic"] === true && lambdaDetail["logicpath"] != "") {
      response =
        logics.LambdaLogics[<string>lambdaDetail["language"]][
          <string>lambdaDetail["logicpath"]
        ];
    } else if (
      lambdaDetail["logic"] === true &&
      lambdaDetail["logicpath"] === ""
    ) {
      const logicID = `${(<string>lambdaDetail["stack_names"]).replace(
        (<string>lambdaDetail["stack_names"]).slice(-5),
        ""
      )}_${lambdaName}`;
      response = logics.LambdaLogics[<string>lambdaDetail["language"]][logicID];
    }
  }
  let extension;
  if ((<string>lambdaDetail["language"]).includes("node")) {
    extension = config.LanguageSupport["node"].extension;
  } else if ((<string>lambdaDetail["language"]).includes("python")) {
    extension = config.LanguageSupport["python"].extension;
  } else {
    throw new Error("RoverError:language not found");
  }
  if (response != undefined)
    utlities.writeFile(`${path}/${lambdaName}/app${extension}`, response);
  return response;
}
