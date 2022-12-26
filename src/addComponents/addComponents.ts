import * as config from "../utlities/config";
import * as rover_resources from "../resources/resources";
import * as components from "../resources/components";
import * as utlities from "../utlities/utilities";
import { AnyArray, AnyObject } from "immer/dist/internal";
import * as child from "child_process";
import * as yaml from "yaml";
import * as fs from "fs";
import * as Yaml from "js-yaml";
import { IroverConfigTagArrayValue } from "./addComponents.types";
const j: IroverConfigTagArrayValue = { Key: "hi", Value: "jh" };
console.log(j);
const exec = child.execSync;
const pwd = utlities.pwd;

export function addComponents(input: AnyObject) {
  const Datas = fs.readFileSync(pwd + "/" + input.file_name.trim(), {
    encoding: "utf-8",
  });
  let Data = <AnyObject>Yaml.load(utlities.replaceTempTag(Datas));
  if (Object.prototype.hasOwnProperty.call(Data, "Resources")) {
    const res: AnyObject = {};
    const app_data = getAppdata(input);
    const input2 = JSON.parse(JSON.stringify(input));
    input2.app_name = input.app_name + "_test";
    utlities.initializeSAM(input2);
    if (input.nested) {
      Object.keys(input.nestedComponents).forEach((ele) => {
        const comp: AnyObject = {};
        res["resources"] = getComponents(
          input.nestedComponents[ele]["components"]
        );
        Data = <AnyObject>(
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
        const path: AnyArray = (
          input.app_name +
          "/" +
          input.nestedComponents[ele]["path"]
        ).split("/");
        path.pop();
        comp["desti"] = path.join("/");

        comp["demo_desti"] = input2.app_name;
        let res1 = createStackResources(res, app_data, "", "", comp);
        res1 = utlities.addResourceTemplate(res1, Object.keys(res1), Data);
        const doc = new yaml.Document();
        doc.contents = res1;
        const temp = utlities.replaceYAML(doc.toString());
        utlities.writeFile(
          input.app_name + "/" + input.nestedComponents[ele]["path"].trim(),
          temp
        );
      });
    } else {
      const comp: AnyObject = {};
      res["resources"] = getComponents(input.components);

      comp["demo_desti"] = input2.app_name;
      let res1 = createStackResources(res, app_data, "", "", comp);
      res1 = utlities.addResourceTemplate(res1, Object.keys(res1), Data);
      const doc = new yaml.Document();
      doc.contents = res1;
      const temp = utlities.replaceYAML(doc.toString());
      utlities.writeFile(input.file_name.trim(), temp);
    }
    utlities.removeFolder(input2.app_name);
    utlities.generateRoverConfig(input.app_name, input, "rover_add_component");
  } else {
    console.log("wrong template structure");
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

export function getComponents(component: AnyObject) {
  const resources: AnyArray = [];
  Object.entries(component).map((ele) => {
    const componentstype: string = ele[1];
    const componentstypeobj: AnyObject = JSON.parse(
      JSON.stringify(components.Components[componentstype])
    );

    componentstypeobj.map(function (ele: AnyObject) {
      resources.push(ele);
    });
  });
  return resources;
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
