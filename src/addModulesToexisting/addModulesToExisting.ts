import * as utlities from "../utlities/utilities";
import * as config from "../utlities/config";
import * as helpers from "../helpers/helpers";
import * as rover_resources from "../resources/resources";
import * as yaml from "yaml";
import * as fs from "fs";
import * as Yaml from "js-yaml";
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
} from "./addModulesToExisting.types";

const pwd = utlities.pwd;

export function addModulesToExistingStack(input: IroveraddModule): void {
  try {
    const inputJSON = JSON.parse(JSON.stringify(input));
    inputJSON.app_name = input.app_name + "_test";
    console.log();
    const app_types = utlities.cliModuletoConfig(input, true);
    const app_data = utlities.getAppdata(input);
    const stackMap = stackMapping(Object.keys(app_types), input.stackDetails);
    const stackData = createStack(
      app_data,
      app_types,
      input.file_name,
      stackMap
    );
    createStackFolders(stackData);
    // helpers.generateRoverConfig(input.app_name, input, "rover_add_module");
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
  const stackes: TSAMTemplateResources = {};

  const responses: Record<string, IroverCreateStackResponse> = <
    Record<string, IroverCreateStackResponse>
  >{};
  for (let i = 0; i < stack_names.length; i++) {
    const response: IroverCreateStackResponse = <IroverCreateStackResponse>{};
    const stacks = rover_resources.resourceGeneration("stack", {
      TemplateURL: stack_names[i] + "/template.yaml",
    });
    stackes[stack_names[i]] = stacks;
    // exec("mkdir " + pwd + app_data.app_name + "/" + stack_names[i]);
    const resources = resource[stack_names[i]];
    const res = createStackResources(resources, app_data, stack_names[i]);
    const template = utlities.addResourceTemplate(
      <TSAMTemplateResources>res["response"],
      Object.keys(res),
      undefined
    );
    if (Object.prototype.hasOwnProperty.call(resources, "parameter")) {
      template["Parameters"] = resources.parameter;
    }
    response["template"] = <TSAMTemplate>template;
    response["fileName"] = filename;
    response["appData"] = app_data;
    //console.log("template", JSON.stringify(response));
    response["stackType"] = stackMap[stack_names[i]]["stackType"];
    response["lambdaDetails"] = <
      Record<string, Record<string, string | boolean | Array<string>>>
    >res["lambdaDetails"];
    responses[stackMap[stack_names[i]]["stackName"]] = response;
  }
  return responses;
}

function createStackResources(
  resources: IroverAppType,
  app_data: IroverAppData,
  stack_names: string
): Record<
  string,
  | TSAMTemplateResources
  | Record<string, Record<string, string | boolean | Array<string>>>
  | never
> {
  const res: TSAMTemplateResources = {};
  const resourceobject: TroverResourcesArray = resources["resources"];
  const lambdaDetails:
    | Record<string, Record<string, string | boolean | Array<string>>>
    | never = {};
  resourceobject.forEach(function (element: IroverResources) {
    element.config[
      "Description"
    ] = `Rover-tools created ${element.name}  named ${element.type} resource`;
    if (config.samabstract.includes(element.type)) {
      element.config["Tags"] = {
        createdBy: "rover",
        applicationName: app_data.app_name,
      };
    } else {
      element.config["Tags"] = [
        { Key: "createdBy", Value: "rover" },
        {
          Key: "applicationName",
          Value: app_data.app_name,
        },
      ];
    }
  });

  for (const j in resources["resources"]) {
    if (stack_names == "") {
      const randomstr: string = helpers.makeId(4);
      resources["resources"][j]["name"] =
        resources["resources"][j]["name"] + randomstr;
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
    } else if (resources["resources"][j]["type"] == "apigateway") {
      configs["path"] = `${resources["resources"][j]["name"]}/swagger.yaml`;
      configs[
        "filepath"
      ] = `${app_data.app_name}/${stack_names}/${resources["resources"][j]["name"]}/swagger.yaml`;
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
  for (const stackes of newStackNames) {
    response[stackes] = {};
    response[stackes]["stackName"] = stackDetails[stackes].stackName;
    response[stackes]["stackType"] = stackDetails[stackes].type;
  }
  console.log("stackMapping", JSON.stringify(response));
  return response;
}

function createStackFolders(inputs: Record<string, IroverCreateStackResponse>) {
  for (const input of Object.keys(inputs)) {
    // console.log("createStackFolders", input, JSON.stringify(inputs[input]));
    const path = `${inputs[input].appData.app_name}/${input}`;
    createResourceTemplate(path, inputs[input]);
    createResourceFiles(path, inputs[input]);
  }
}

function createResourceTemplate(path: string, data: IroverCreateStackResponse) {
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
  //utlities.writeFile(`${path}/template.yaml`, temp);
}
function createResourceFiles(path: string, data: IroverCreateStackResponse) {
  for (const logicalID of Object.keys(data.template.Resources)) {
    if (
      data.template.Resources[logicalID].Type ===
      config.AWSResources["lambda"]["type"]
    ) {
      // copyRecursiveSync(
      //   `${config.npmroot}/@rover-tools/cli/node_modules/@rover-tools/engine/assets/hello-world_node`,
      //   `${pwd}${path}/${logicalID}`
      // );
      data.appData.StackType;
    }
  }
}
async function copyRecursiveSync(src: string, dest: string) {
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
