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

import { IroveraddModule } from "./addModulesToExisting.types";
const exec = child.execSync;
const pwd = utlities.pwd;
export function addModules(input: IroveraddModule): void {
  try {
    const inputJSON = JSON.parse(JSON.stringify(input));
    inputJSON.app_name = input.app_name + "_test";
    utlities.initializeSAM(inputJSON);
    exec("rm -rf " + pwd + input.app_name + "/" + "lambda_demo");
    utlities.moveFolder(
      pwd + inputJSON.app_name + "/" + "lambda_demo" + " ",
      pwd + input.app_name + "/" + "lambda_demo"
    );
    exec("rm -rf " + pwd + inputJSON.app_name);

    const app_types = utlities.cliModuletoConfig(input, true);
    const app_data = utlities.getAppdata(input);
    createStack(app_data, app_types, input.file_name);
    exec("rm -rf " + pwd + input.app_name + "/" + "lambda_demo");
    helpers.generateRoverConfig(input.app_name, input, "rover_add_module");
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
function createStack(
  app_data: IroverAppData,
  app_types: TroverAppTypeObject,
  filename: string
): void {
  const stack_names: Array<string> = Object.keys(app_types);
  const resource = app_types;
  const StackType = app_data.StackType;
  const stackes: TSAMTemplateResources = {};
  let data: TSAMTemplate = <TSAMTemplate>{};
  for (let i = 0; i < stack_names.length; i++) {
    const stacks = rover_resources.resourceGeneration("stack", {
      TemplateURL: stack_names[i] + "/template.yaml",
    });
    stackes[stack_names[i]] = stacks;
    exec("mkdir " + pwd + app_data.app_name + "/" + stack_names[i]);
    const resources = resource[stack_names[i]];
    const comp: IaddComponentComp = <IaddComponentComp>{};
    const res = createStackResources(
      resources,
      app_data,
      StackType[i],
      stack_names[i],
      comp
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
  if (filename !== "") {
    const datas: string = fs.readFileSync(pwd + "/" + filename.trim(), {
      encoding: "utf-8",
    });
    data = <TSAMTemplate>Yaml.load(utlities.replaceTempTag(datas));
    if (Object.prototype.hasOwnProperty.call(data, "AWSTemplateFormatVersion"))
      data.AWSTemplateFormatVersion = config.SkeletonConfig["template_version"];
    if (!Object.prototype.hasOwnProperty.call(data, "Resources"))
      throw new Error("Improper SAM template file in " + filename);
  }

  const template = utlities.addResourceTemplate(stackes, stack_names, data);
  const doc = new yaml.Document();
  doc.contents = template;
  utlities.writeFile(app_data.app_name + "/template.yaml", doc.toString());
}

function createStackResources(
  resources: IroverAppType,
  app_data: IroverAppData,
  StackType: string,
  stack_names: string,
  comp: IaddComponentComp
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
    const haslogic = resources["resources"][j]["logic"];

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
      let path = "";
      let path2 = "";
      let lambda_stack_names = stack_names;
      if (stack_names == "") {
        if (comp.demo_desti !== undefined) {
          path = pwd + comp.demo_desti + "/" + "lambda_demo" + "/ ";
          path2 =
            pwd +
            app_data.app_name +
            "/" +
            resources["resources"][j]["name"] +
            "/";
        }
        if (comp.desti !== undefined) {
          path = pwd + comp.demo_desti + "/" + "lambda_demo" + "/ ";
          path2 =
            pwd + comp.desti + "/" + resources["resources"][j]["name"] + "/";
          lambda_stack_names = comp.desti.split("/")[1].replace("_Stack", "");
        }
      } else {
        path = pwd + app_data.app_name + "/" + "lambda_demo" + "/ ";
        path2 =
          pwd +
          app_data.app_name +
          "/" +
          stack_names +
          "/" +
          resources["resources"][j]["name"] +
          "/";
      }

      utlities.copyLambdaLogic(path, path2);
      utlities.generateLambdaFiles(
        haslogic,
        app_data,
        resources,
        StackType,
        lambda_stack_names,
        j
      );
      utlities.setupTestEnv(path2, app_data.dependency, app_data.app_name);

      configs["CodeUri"] = resources["resources"][j]["name"] + "/";
      configs["Runtime"] = app_data.language;
    } else if (resources["resources"][j]["type"] == "apigateway") {
      let path = "";
      let configpath;
      let filepath;
      if (stack_names == "") {
        if (comp.desti !== undefined) {
          path = pwd + comp.desti + "/" + resources["resources"][j]["name"];
          configpath = resources["resources"][j]["name"] + "/swagger.yaml";
          filepath =
            comp.desti +
            "/" +
            resources["resources"][j]["name"] +
            "/swagger.yaml";
        }
      } else {
        path =
          pwd +
          app_data.app_name +
          "/" +
          stack_names +
          "/" +
          resources["resources"][j]["name"];
        configpath = resources["resources"][j]["name"] + "/swagger.yaml";
        filepath =
          app_data.app_name +
          "/" +
          stack_names +
          "/" +
          resources["resources"][j]["name"] +
          "/swagger.yaml";
      }
      if (fs.existsSync(path)) throw new Error(path + " file already exists");
      exec("mkdir " + path);
      configs["path"] = configpath;
      configs["filepath"] = filepath;
    }
    const resources1 = rover_resources.resourceGeneration(
      resources["resources"][j]["type"],
      configs
    );
    res[resources["resources"][j]["name"]] = resources1;
  }
  return res;
}
