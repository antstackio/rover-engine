import * as config from "../utlities/config";
import * as utlities from "../utlities/utilities";

import * as child from "child_process";
import * as yaml from "yaml";
import * as fs from "fs";
import * as helpers from "../helpers/helpers";
import * as rover_resources from "../resources/resources";

const exec = child.execSync;
const pwd = utlities.pwd;

import {
  IroverInput,
  IroverAppData,
  IroverResources,
  TroverAppTypeObject,
  TroverResourcesArray,
  TSAMTemplateResources,
  IroverAppType,
  IroverConfigTag,
  IroverConfigFileObject,
} from "../roverTypes/rover.types";

export function generateSAM(input: IroverInput): void {
  const app_data: IroverAppData = utlities.getAppdata(input);
  const app_types: TroverAppTypeObject = utlities.cliModuletoConfig(
    input,
    false
  );
  const appname: string = input.app_name;
  createStack(app_data, app_types);
  exec(config.ForceRemove + input.app_name + config.LambdaDemo);
  helpers.generateRoverConfig(
    input.app_name,
    <IroverConfigFileObject>input,
    "rover_create_project"
  );
  exec("cd " + utlities.pwd + appname + " && npm run format:write");
}

function createStack(
  app_data: IroverAppData,
  app_types: TroverAppTypeObject
): void {
  const stack_names: Array<string> = Object.keys(app_types);
  const resource: TroverAppTypeObject = app_types;
  const StackType = app_data.StackType;
  const stackes: TSAMTemplateResources = {};
  for (let i = 0; i < stack_names.length; i++) {
    const stacks = rover_resources.resourceGeneration("stack", {
      TemplateURL: stack_names[i] + "/template.yaml",
    });
    stackes[stack_names[i]] = stacks;

    exec("mkdir " + utlities.pwd + app_data.app_name + "/" + stack_names[i]);
    const resources = resource[stack_names[i]];
    const res = createStackResources(
      resources,
      app_data,
      StackType[i],
      stack_names[i]
    );
    const template1 = utlities.addResourceTemplate(
      res,
      Object.keys(res),
      undefined
    );
    if (Object.prototype.hasOwnProperty.call(resources, "parameter")) {
      template1["Parameters"] = resources.parameter;
    }
    const doc = new yaml.Document();
    doc.contents = template1;
    const temp = utlities.replaceYAML(doc.toString());
    utlities.writeFile(
      app_data.app_name + "/" + stack_names[i] + "/template.yaml",
      temp
    );
  }
  const template = utlities.addResourceTemplate(
    stackes,
    stack_names,
    undefined
  );
  const doc = new yaml.Document();
  doc.contents = template;
  utlities.writeFile(app_data.app_name + "/template.yaml", doc.toString());
}

function createStackResources(
  resources: IroverAppType,
  app_data: IroverAppData,
  StackType: string,
  stack_names: string
): TSAMTemplateResources {
  const res: TSAMTemplateResources = {};
  const resourceobject: TroverResourcesArray = resources["resources"];
  resourceobject.forEach(function (element: IroverResources) {
    element.config[
      "Description"
    ] = `Rover-tools created ${element.name}  named ${element.type} resource`;
    if (config.samabstract.includes(element.type)) {
      element.config["Tags"] = <IroverConfigTag>{
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

  for (const resource in resources["resources"]) {
    if (stack_names == "") {
      const randomstr: string = helpers.makeid(4);
      resources["resources"][resource]["name"] =
        resources["resources"][resource]["name"] + randomstr;
    }
    const configs = resources["resources"][resource]["config"];
    const haslogic = resources["resources"][resource]["logic"];

    if (
      config.AWSResources[resources["resources"][resource]["type"]]["name"] !==
      ""
    ) {
      let name = resources["resources"][resource]["name"].replace(" ", "");
      name = name.replace(/[^a-z0-9]/gi, "");
      configs[
        config.AWSResources[resources["resources"][resource]["type"]]["name"]
      ] = name;
    }
    if (resources["resources"][resource]["type"] == "lambda") {
      let path = "";
      let path2 = "";
      const lambda_stack_names = stack_names;
      path = pwd + app_data.app_name + "/" + "lambda_demo" + "/ ";
      path2 =
        pwd +
        app_data.app_name +
        "/" +
        stack_names +
        "/" +
        resources["resources"][resource]["name"] +
        "/";

      utlities.copyLambdaLogic(path, path2);
      utlities.generateLambdaFiles(
        haslogic,
        app_data,
        resources,
        StackType,
        lambda_stack_names,
        resource
      );
      utlities.setupTestEnv(path2, app_data.dependency, app_data.app_name);

      configs["CodeUri"] = resources["resources"][resource]["name"] + "/";
      configs["Runtime"] = app_data.language;
    } else if (resources["resources"][resource]["type"] == "apigateway") {
      const path =
        pwd +
        app_data.app_name +
        "/" +
        stack_names +
        "/" +
        resources["resources"][resource]["name"];
      const configpath =
        resources["resources"][resource]["name"] + "/swagger.yaml";
      const filepath =
        app_data.app_name +
        "/" +
        stack_names +
        "/" +
        resources["resources"][resource]["name"] +
        "/swagger.yaml";

      if (fs.existsSync(path)) throw new Error(path + " file already exists");
      exec("mkdir " + path);
      configs["path"] = configpath;
      configs["filepath"] = filepath;
    }
    const resources1 = rover_resources.resourceGeneration(
      resources["resources"][resource]["type"],
      configs
    );
    res[resources["resources"][resource]["name"]] = resources1;
  }

  return res;
}
