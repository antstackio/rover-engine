import * as config from "../utlities/config";
import * as utlities from "../utlities/utilities";
import * as modules from "../resources/modules";
import * as components from "../resources/components";
import * as child from "child_process";
import * as yaml from "yaml";
import * as fs from "fs";
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
  ISAMTemplateResource,
  IroverAppType,
  IroverConfigTag,
  IroverConfigFileObject,
  IaddComponentResource,
} from "../roverTypes/rover.types";

import { IcurdComponentObject } from "../generateSAM/generatesam.types";

export function generateSAM(input: IroverInput): void {
  const app_data: IroverAppData = getAppdata(input);
  const app_types: TroverAppTypeObject = cliModuletoConfig(input, false);
  const appname: string = input.app_name;
  createStack(app_data, app_types);
  exec(config.ForceRemove + input.app_name + config.LambdaDemo);
  utlities.generateRoverConfig(
    input.app_name,
    <IroverConfigFileObject>input,
    "rover_create_project"
  );
  exec("cd " + utlities.pwd + appname + " && npm run format:write");
}

export function getAppdata(input: IroverInput): IroverAppData {
  const appDataArray: Array<string> = [];
  Object.keys(input.stack_details).forEach((ele) => {
    appDataArray.push(input.stack_details[ele].type);
  });
  const appData: IroverAppData = {
    app_name: input.app_name,
    language: config.LanguageSupport[input.language]["version"],
    dependency: config.LanguageSupport[input.language]["dependency"],
    extension: config.LanguageSupport[input.language]["extension"],
    StackType: appDataArray,
  };
  return appData;
}

export function cliModuletoConfig(
  input: IroverInput,
  modify: boolean
): TroverAppTypeObject {
  if (!modify) {
    utlities.initializeSAM(input);
  }
  const app_types: TroverAppTypeObject = {};
  Object.keys(input["stack_details"]).forEach((ele) => {
    let stackdata: TroverAppTypeObject = {};
    if (input["stack_details"][ele]["type"] == "CRUDModule") {
      const fundata = (<
        (
          apiname: string,
          config: Record<string, IcurdComponentObject>
        ) => Record<string, IaddComponentResource>
      >modules.Modules[input["stack_details"][ele]["type"]]["resource"])(
        ele,
        <Record<string, IcurdComponentObject>>(
          input["stack_details"][ele]["params"]
        )
      );
      stackdata = <TroverAppTypeObject>fundata;
    } else if (input["stack_details"][ele]["type"] == "Custom") {
      const resources: TroverResourcesArray = [];
      const customstackarray: Array<string> =
        input.stack_details[ele]["componentlist"];
      customstackarray.map((ele) => {
        const componentarray: TroverResourcesArray = JSON.parse(
          JSON.stringify(components.Components[ele])
        );
        componentarray.map((ele) => {
          resources.push(ele);
        });
      });
      app_types[ele] = {
        resources: resources,
        type: "components",
      };
    } else {
      stackdata = JSON.parse(
        JSON.stringify(
          modules.Modules[input["stack_details"][ele]["type"]]["resource"]
        )
      );
    }
    Object.keys(stackdata).forEach((ele1) => {
      app_types[ele] = stackdata[ele1];
      app_types[ele]["type"] = "module";
    });
  });

  return app_types;
}

export function createStack(
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
    stackes[stack_names[i]] = <ISAMTemplateResource>stacks;

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

export function createStackResources(
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

  for (const j in resources["resources"]) {
    if (stack_names == "") {
      const randomstr: string = utlities.makeid(4);
      resources["resources"][j]["name"] =
        resources["resources"][j]["name"] + randomstr;
    }
    const configs = resources["resources"][j]["config"];
    const logic = resources["resources"][j]["logic"];

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
      const lambda_stack_names = stack_names;
      path = pwd + app_data.app_name + "/" + "lambda_demo" + "/ ";
      path2 =
        pwd +
        app_data.app_name +
        "/" +
        stack_names +
        "/" +
        resources["resources"][j]["name"] +
        "/";

      utlities.copyLambdaLogic(path, path2);
      utlities.generateLambdafiles(
        logic,
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
      const path =
        pwd +
        app_data.app_name +
        "/" +
        stack_names +
        "/" +
        resources["resources"][j]["name"];
      const configpath = resources["resources"][j]["name"] + "/swagger.yaml";
      const filepath =
        app_data.app_name +
        "/" +
        stack_names +
        "/" +
        resources["resources"][j]["name"] +
        "/swagger.yaml";

      if (fs.existsSync(path)) throw new Error(path + " file already exists");
      exec("mkdir " + path);
      configs["path"] = configpath;
      configs["filepath"] = filepath;
    }
    const resources1 = <ISAMTemplateResource>(
      rover_resources.resourceGeneration(
        resources["resources"][j]["type"],
        configs
      )
    );
    res[resources["resources"][j]["name"]] = <ISAMTemplateResource>resources1;
  }

  return res;
}
