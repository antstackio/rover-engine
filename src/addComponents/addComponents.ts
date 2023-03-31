import * as config from "../utlities/config";
import * as rover_resources from "../resources/resources";
import * as components from "../resources/components/components";
import * as utlities from "../utlities/utilities";
import * as child from "child_process";
import * as yaml from "yaml";
import * as fs from "fs";
import * as helpers from "../helpers/helpers";
import * as Yaml from "js-yaml";
import {
  IroveraddComponentInput,
  IroveraddComponentInputNestedType,
  IroveraddComponentInputType,
  IaddComponentAppData,
  IaddComponentComp,
} from "./addComponents.types";
import {
  TSAMTemplate,
  TSAMTemplateResources,
  TroverResourcesArray,
  IaddComponentResource,
  IroverResources,
  IroverConfigTag,
} from "../roverTypes/rover.types";
const exec = child.execSync;
const pwd = utlities.pwd;

export function addComponents(input: IroveraddComponentInput): void {
  const Data: TSAMTemplate = getYamlData(input.file_name);
  if (!Object.prototype.hasOwnProperty.call(Data, "Resources")) {
    console.log("wrong template structure");
  }
  const app_data = getAppdata(input);
  const inputJSON = JSON.parse(JSON.stringify(input));
  inputJSON.app_name = input.app_name + "_test";
  utlities.initializeSAM(inputJSON);
  if (input.nested) {
    const inputs: IroveraddComponentInputNestedType = <
      IroveraddComponentInputNestedType
    >input;
    addComponentsNested(inputs, Data, inputJSON, app_data);
  } else {
    const inputs: IroveraddComponentInputType = <IroveraddComponentInputType>(
      input
    );
    addComponentsnonNested(inputs, Data, app_data, inputJSON);
  }
  utlities.removeFolder(inputJSON.app_name);
  helpers.generateRoverConfig(input.app_name, input, "rover_add_component");
}

function getYamlData(file_name: string): TSAMTemplate {
  const Datas = fs.readFileSync(pwd + "/" + file_name.trim(), {
    encoding: "utf-8",
  });
  const Data = <TSAMTemplate>Yaml.load(utlities.replaceTempTag(Datas));
  return Data;
}

function addComponentsNested(
  input: IroveraddComponentInputNestedType,
  Data: TSAMTemplate,
  inputJSON: IroveraddComponentInputNestedType,
  app_data: IaddComponentAppData
): void {
  Object.keys(input.nestedComponents).forEach((ele) => {
    const res: IaddComponentResource = {
      resources: getComponents(input.nestedComponents[ele]["components"]),
    };
    Data = <TSAMTemplate>(
      Yaml.load(
        utlities.replaceTempTag(
          fs.readFileSync(
            pwd +
              "/" +
              input.app_name +
              "/" +
              input.nestedComponents[ele]["path"].trim(),
            { encoding: "utf-8" }
          )
        )
      )
    );
    const path: Array<string> = (
      input.app_name +
      "/" +
      input.nestedComponents[ele]["path"]
    ).split("/");
    path.pop();
    const comp: IaddComponentComp = {
      desti: path.join("/"),
      demo_desti: inputJSON.app_name,
    };

    const res1 = createStackResources(res, app_data, "", "", comp);
    const res3 = utlities.addResourceTemplate(res1, Object.keys(res1), Data);
    const doc = new yaml.Document();
    doc.contents = res3;
    const temp = utlities.replaceYAML(doc.toString());
    utlities.writeFile(
      input.app_name + "/" + input.nestedComponents[ele]["path"].trim(),
      temp
    );
  });
}

function addComponentsnonNested(
  input: IroveraddComponentInputType,
  Data: TSAMTemplate,
  app_data: IaddComponentAppData,
  inputJSON: IroveraddComponentInputType
): void {
  const res: IaddComponentResource = {
    resources: getComponents(input.components),
  };
  const comp: IaddComponentComp = {
    demo_desti: inputJSON.app_name,
  };

  const res1 = createStackResources(res, app_data, "", "", comp);
  const res2 = utlities.addResourceTemplate(res1, Object.keys(res1), Data);
  const doc = new yaml.Document();
  doc.contents = res2;
  const temp = utlities.replaceYAML(doc.toString());
  utlities.writeFile(input.file_name.trim(), temp);
}

function getAppdata(input: IroveraddComponentInput): IaddComponentAppData {
  const app_data: IaddComponentAppData = {
    app_name: input.app_name,
    language: config.LanguageSupport[input.language]["version"],
    dependency: config.LanguageSupport[input.language]["dependency"],
    extension: config.LanguageSupport[input.language]["extension"],
  };
  return app_data;
}

function getComponents(component: Array<string>): TroverResourcesArray {
  const resources: TroverResourcesArray = [];
  Object.entries(component).map((ele) => {
    const componentstype: string = ele[1];
    const componentstypeobj: TroverResourcesArray = JSON.parse(
      JSON.stringify(components.Components[componentstype])
    );
    componentstypeobj.map(function (ele: IroverResources) {
      resources.push(ele);
    });
  });
  return resources;
}

function createStackResources(
  resources: IaddComponentResource,
  app_data: IaddComponentAppData,
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
    if (config.samAbstract.includes(element.type)) {
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
    const randomString: string = helpers.makeId(4);
    resources["resources"][j]["name"] =
      resources["resources"][j]["name"] + randomString;
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
          path = `${pwd}${comp.demo_desti}/lambda_demo/ `;
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
        } else {
          path =
            pwd + app_data.app_name + "/" + resources["resources"][j]["name"];
          configpath =
            app_data.app_name +
            "/" +
            resources["resources"][j]["name"] +
            "/swagger.yaml";
          filepath =
            app_data.app_name +
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
