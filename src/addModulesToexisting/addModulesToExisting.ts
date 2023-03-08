import * as utlities from "../utlities/utilities";
import * as config from "../utlities/config";
import * as helpers from "../helpers/helpers";
import * as rover_resources from "../resources/resources";
import * as child from "child_process";
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

import { IaddComponentComp } from "../addComponents/addComponents.types";

import {
  IroveraddModule,
  IroverCreateStackResponse,
} from "./addModulesToExisting.types";
const exec = child.execSync;
const pwd = utlities.pwd;
export function addModulesToExistingStack(input: IroveraddModule): void {
  try {
    const inputJSON = JSON.parse(JSON.stringify(input));
    inputJSON.app_name = input.app_name + "_test";
    console.log()
    const app_types = utlities.cliModuletoConfig(input, true);
    const app_data = utlities.getAppdata(input);
    createStack(app_data, app_types, input.file_name);
    //exec("rm -rf " + pwd + input.app_name + "/" + "lambda_demo");
    // helpers.generateRoverConfig(input.app_name, input, "rover_add_module");
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
export function createStack(
  app_data: IroverAppData,
  app_types: TroverAppTypeObject,
  filename: string
): void {
  const stack_names: Array<string> = Object.keys(app_types);
  const resource = app_types;
  const stackes: TSAMTemplateResources = {};
  const response: IroverCreateStackResponse = <IroverCreateStackResponse>{};
  for (let i = 0; i < stack_names.length; i++) {
    const stacks = rover_resources.resourceGeneration("stack", {
      TemplateURL: stack_names[i] + "/template.yaml",
    });
    stackes[stack_names[i]] = stacks;
    // exec("mkdir " + pwd + app_data.app_name + "/" + stack_names[i]);
    const resources = resource[stack_names[i]];
    const res = createStackResources(resources, app_data, stack_names[i]);
    const template = utlities.addResourceTemplate(
      res,
      Object.keys(res),
      undefined
    );
    if (Object.prototype.hasOwnProperty.call(resources, "parameter")) {
      template["Parameters"] = resources.parameter;
    }
    response["template"] = <TSAMTemplate>template;
    response["fileName"] = filename;
    response["appData"] = app_data;
    console.log("template", JSON.stringify(response));
  }
}

function createStackResources(
  resources: IroverAppType,
  app_data: IroverAppData,
  stack_names: string
): TSAMTemplateResources {
  const res: TSAMTemplateResources = {};
  const resourceobject: TroverResourcesArray = resources["resources"];
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
      configs["haslogic"] = resources["resources"][j]["logic"];
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
  return res;
}
