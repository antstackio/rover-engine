import * as utlities from "../utlities/utilities";
import * as config from "../utlities/config";
import * as rover_resources from "../resources/resources";
import * as components from "../resources/components";
import * as modules from "../resources/modules";
import { AnyArray, AnyObject } from "immer/dist/internal";
import * as child from "child_process";
import * as yaml from "yaml";
import * as fs from "fs";
import * as Yaml from "js-yaml";
const exec = child.execSync;
const pwd = utlities.pwd;

export function addModules(input: AnyObject) {
  try {
    const input2 = JSON.parse(JSON.stringify(input));
    input2.app_name = input.app_name + "_test";
    utlities.initializeSAM(input2);
    exec("rm -rf " + pwd + input.app_name + "/" + "lambda_demo");
    utlities.moveFolder(
      pwd + input2.app_name + "/" + "lambda_demo" + " ",
      pwd + input.app_name + "/" + "lambda_demo"
    );
    exec("rm -rf " + pwd + input2.app_name);

    const app_types = cliModuletoConfig(input, true);
    const app_data = getAppdata(input);
    createStack(app_data, app_types, input.file_name);
    exec("rm -rf " + pwd + input.app_name + "/" + "lambda_demo");
    utlities.generateRoverConfig(input.app_name, input, "rover_add_module");
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export function getAppdata(input: AnyObject) {
  const app_data: AnyObject = {};
  app_data["app_name"] = input.app_name;
  app_data["language"] = config.LanguageSupport[input.language]["version"];
  app_data["dependency"] = config.LanguageSupport[input.language]["dependency"];
  app_data["extension"] = config.LanguageSupport[input.language]["extension"];
  if (input["stack_details"] !== undefined) {
    const appdata: AnyArray = [];
    Object.keys(input["stack_details"]).forEach((ele) => {
      appdata.push(input["stack_details"][ele]["type"]);
    });
    app_data["StackType"] = appdata;
  }

  return app_data;
}

export function cliModuletoConfig(input: AnyObject, modify: boolean) {
  if (!modify) {
    utlities.initializeSAM(input);
  }
  const app_types: AnyObject = {};

  if (Object.keys(input["stack_details"]).length > 0) {
    Object.keys(input["stack_details"]).forEach((ele) => {
      let stackdata: AnyObject = {};
      if (input["stack_details"][ele]["type"] == "CRUDModule") {
        stackdata = modules.Modules[input["stack_details"][ele]["type"]][
          "resource"
        ](ele, input["stack_details"][ele]["params"]);
      } else if (input["stack_details"][ele]["type"] == "Custom") {
        const resources: AnyArray = [];
        const customstackarray: AnyArray =
          input["stack_details"][ele]["componentlist"];
        customstackarray.map((ele) => {
          const componentarray: AnyArray = JSON.parse(
            JSON.stringify(components.Components[ele])
          );
          componentarray.map((ele) => {
            resources.push(ele);
          });
        });
        app_types[ele] = {};
        app_types[ele]["resources"] = resources;
        app_types[ele]["type"] = "components";
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
  }
  return app_types;
}

export function createStack(
  app_data: AnyObject,
  app_types: AnyObject,
  filename: string
) {
  const stack_names: AnyArray = Object.keys(app_types);
  const resource = app_types;
  const StackType = app_data.StackType;
  const stackes: AnyObject = {};
  let data: AnyObject = {};
  for (let i = 0; i < stack_names.length; i++) {
    const stacks = rover_resources.resourceGeneration("stack", {
      TemplateURL: stack_names[i] + "/template.yaml",
    });
    stackes[stack_names[i]] = stacks;
    exec("mkdir " + pwd + app_data.app_name + "/" + stack_names[i]);
    const resources = resource[stack_names[i]];
    const comp = {};
    const res = createStackResources(
      resources,
      app_data,
      StackType[i],
      stack_names[i],
      comp
    );
    const template1 = utlities.addResourceTemplate(res, Object.keys(res), {});
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
    data = <AnyObject>Yaml.load(utlities.replaceTempTag(datas));
    if (Object.prototype.hasOwnProperty.call(data, "AWSTemplateFormatVersion"))
      data["AWSTemplateFormatVersion"] =
        config.SkeletonConfig["template_version"];
    if (!Object.prototype.hasOwnProperty.call(data, "Resources"))
      throw new Error("Improper SAM template file in " + filename);
  }

  const template = utlities.addResourceTemplate(stackes, stack_names, data);
  const doc = new yaml.Document();
  doc.contents = template;
  utlities.writeFile(app_data.app_name + "/template.yaml", doc.toString());
}

export function createStackResources(
  resources: AnyObject,
  app_data: AnyObject,
  StackType: string,
  stack_names: string,
  comp: AnyObject
) {
  const res: AnyObject = {};
  const resourceobject: AnyObject = resources["resources"];
  resourceobject.forEach(function (element: AnyObject) {
    element.config[
      "Description"
    ] = `Rover-tools created ${element.name}  named ${element.type} resource`;
    if (config.samabstract.includes(element.type)) {
      element.config["Tags"] = {};
      element.config["Tags"]["createdBy"] = "rover";
      element.config["Tags"]["applicationName"] = app_data.app_name;
    } else {
      element.config["Tags"] = [];
      element.config["Tags"].push({ Key: "createdBy", Value: "rover" });
      element.config["Tags"].push({
        Key: "applicationName",
        Value: app_data.app_name,
      });
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
