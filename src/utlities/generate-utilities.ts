import * as config from "../utlities/config";
import * as rover_resources from "../resources/resources";
import * as logics from "../resources/logics";
import * as Yaml from "js-yaml";
import * as utlities from "../utlities/utilities";
import * as yaml from "yaml";
import * as fs from "fs";
import * as helpers from "../helpers/helpers";
const pwd = utlities.pwd;
import {
  IroverAppData,
  TroverAppTypeObject,
  ISAMTemplateResource,
  IroverResources,
  TroverResourcesArray,
  TSAMTemplateResources,
  IroverAppType,
  TSAMTemplate,
  IaddComponentResource,
} from "../roverTypes/rover.types";

import {
  IroverCreateStackResponse,
  TlambdaProperties,
} from "../addModulesToexisting/addModulesToExisting.types";
import { IaddComponentAppData } from "../addComponents/addComponents.types";

export function createStack(
  app_data: IroverAppData,
  app_types: TroverAppTypeObject,
  filename: string,
  stackMap: Record<string, Record<string, string>>
): Record<
  string,
  Record<string, IroverCreateStackResponse | ISAMTemplateResource>
> {
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
    response["appData"] = app_data;
    response["lambdaDetails"] = <
      Record<string, Record<string, TlambdaProperties>>
    >res["lambdaDetails"];
    if (filename !== "") response["fileName"] = filename;
    if (Object.keys(stackMap).length !== 0) {
      response["stackType"] = stackMap[stack_name]["stackType"];
      responses[stackMap[stack_name]["stackName"]] = response;
    } else {
      responses[stack_name] = response;
    }
  }
  return { responses: responses, stacks: stacks };
}
export function createStackResources(
  resources: IroverAppType | IaddComponentResource,
  app_data: IroverAppData | IaddComponentAppData,
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
export function createStackFolders(
  inputs: Record<string, IroverCreateStackResponse>,
  modify: boolean
) {
  for (const input of Object.keys(inputs)) {
    const path = `${inputs[input].appData.appName}/${input}`;
    const templateJSON: IroverCreateStackResponse = createResourceFiles(
      path,
      inputs[input]
    );
    createResourceTemplate(path, templateJSON, modify);
    copyLambdaLogic(path, inputs[input].lambdaDetails);
  }
}
export function createResourceTemplate(
  path: string,
  data: IroverCreateStackResponse,
  modify: boolean
) {
  let finalTemplate: TSAMTemplate
  if (modify) {
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
    finalTemplate = JSONTemplate;
  } else {
    finalTemplate = data.template;
  }
  const doc = new yaml.Document();
  doc.contents = finalTemplate;
  const temp = utlities.replaceYAML(doc.toString());
  utlities.writeFile(`${path}/template.yaml`, temp);
}
export function createResourceFiles(
  path: string,
  data: IroverCreateStackResponse
) {
  data.template.Resources = genrateResourceFiles(path, data.template.Resources);
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
export function copyLambdaLogic(
  path: string,
  lambdaDetails: Record<string, Record<string, TlambdaProperties>>
) {
  if (typeof lambdaDetails === "object") {
    Object.keys(lambdaDetails).forEach((element) => {
      getLambdaLogic(path, element, lambdaDetails[element]);
    });
  }
}
export function getLambdaLogic(
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

export function genrateResourceFiles(
  path: string,
  Resources: TSAMTemplateResources
) {
  for (const logicalID of Object.keys(Resources)) {
    if (Resources[logicalID].Type === config.AWSResources["lambda"]["type"]) {
      let langCode;
      if (
        (<string>Resources[logicalID].Properties["Runtime"]).includes("node")
      ) {
        langCode = "node";
      } else if (
        (<string>Resources[logicalID].Properties["Runtime"]).includes("python")
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
      Resources[logicalID].Type === config.AWSResources["apigateway"]["type"]
    ) {
      fs.mkdirSync(`${pwd}${path}/${logicalID}`);
      const doc = new yaml.Document();
      doc.contents = Resources[logicalID].Properties["swagger"];
      const swaggersYaml = utlities.replaceYAML(doc.toString());
      utlities.writeFile(`${path}/${logicalID}/swagger.yaml`, swaggersYaml);
      delete Resources[logicalID].Properties["swagger"];
      delete Resources[logicalID].Properties["filepath"];
    }
  }
  return Resources;
}
