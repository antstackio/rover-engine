import * as config from "./config";
import * as rover_resources from "../resources/resources";
import * as logics from "../resources/logics";
import * as modules from "../resources/modules";
import * as components from "../resources/components";
import { AnyArray, AnyObject } from "immer/dist/internal";
import * as child from "child_process";
const exec = child.execSync


import * as yaml from "yaml";
import * as fs from "fs";
export const pwd = process.cwd() + "/";
const sub = new RegExp(
  /(!Sub|!Transform|!Split|!Join|!Select|!FindInMap|!GetAtt|!GetAZs|!ImportValue|!Ref)\s[a-zA-Z0-9 !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*\n/g
);
const pythonpattern = new RegExp(/python[1-9]*\.[1-9]*/g);
const jspattern = new RegExp(/nodejs[1-9]*\.[a-zA-Z]*/g);
const yamlpattern = new RegExp(/(\.yaml$)/g);
const Yaml = require("js-yaml");

import * as TOML from "@iarna/toml";
export const npmrootTest = function () {
  let packages: AnyArray = exec(" npm -g  ls").toString().trim().split(/\r?\n/);
  packages.shift();
  packages = packages.filter((ele) => {
    ele = ele.match("@rover-tools/cli");
    if (ele !== null) {
      return ele;
    }
  });
  return packages.length > 0;
};
export function checkFile(path: string, type: string) {
  const response: AnyObject = {};
  response["checkFile"] = false;
  const patharray = path.split("/");
  if (type == "no") {
    if (fs.existsSync(path)) {
      throw new Error(patharray[patharray.length - 1] + " file already exists");
    }
  }
  if (type == "yes") {
    if (!fs.existsSync(path)) {
      throw new Error(patharray[patharray.length - 1] + " file doesn't exists");
    }
  }
}
export function writeFile(path: string, data: string) {
  path = (pwd + "/" + path).replace(/\/\/*/g, "/");
  fs.writeFileSync(path, data);
}
export function installDependies(
  path: string,
  packages: AnyArray,
  dependency: string
) {
  if (dependency == "npm") {
    packages.map((ele) => {
      exec("npm --prefix " + pwd + path + " install " + ele + " --save");
    });
  }
}
export function setupTestEnv(
  path: string,
  dependency: string,
  appname: string
) {
  if (dependency == "npm") {
    exec("npm --prefix " + path + "/ install jest --save");
    exec("npm --prefix " + pwd + appname + "/ install jest --save");
    exec(
      "npm --prefix " + pwd + appname + "/ pkg set scripts.test='npm test' "
    );
    exec(
      "mv " +
        path +
        "tests/unit/test-handler.js " +
        path +
        "tests/unit/test.test.js"
    );
  }
}
export function setupESLint(path: string, filename: string) {
  exec(
    "cd " +
      path +
      "&& npm i -D eslint prettier eslint-plugin-prettier eslint-config-prettier ");
  writeFile(
    filename + "/.prettierrc.json",
    JSON.stringify(config.prettierConfig)
  );
  writeFile(filename + "/.eslintrc.js", config.eslintconfig);
  exec(
    "cd " + path + "&& npm  pkg set scripts.format:check='prettier --check .'"
  );
  exec(
    "cd " + path + "&& npm  pkg set scripts.format:write='prettier --write .'"
  );
  exec("cd " + path + "&& npm  pkg set scripts.lint:check='eslint .'");
  exec("cd " + path + "&& npm  pkg set scripts.lint:fix='eslint --fix .'");
}
export function addResourceTemplate(
  resources: AnyObject,
  name: AnyArray,
  temp: AnyObject
) {
  let template;
  if (Object.keys(temp).length == 0) {
    template = rover_resources.skeleton();
  } else {
    template = temp;
  }

  for (const i in name) {
    template["Resources"][name[i]] = resources[name[i]];
  }
  return template;
}
export function replaceYAML(doc: string) {
  const yamlArray: AnyObject = {
    OFF: "'OFF'",
  };
  Object.keys(yamlArray).forEach((key) => {
    doc = doc.replace(key, yamlArray[key]);
  });
  return doc;
}
export function initializeSAM(input: AnyObject) {
  const app_name = input.app_name;
  removeFolder(input.app_name);
  const language = config.LanguageSupport[input.language]["version"];
  const dependency = config.LanguageSupport[input.language]["dependency"];
  exec(
    config.SAMInitBase +
      config.SAMLanguage +
      language +
      config.SAMDependency +
      dependency +
      config.SAMAppName +
      app_name +
      config.SAMAppTemplate
  );
  let source = pwd + input.app_name + "/hello-world";
  if (dependency == "npm") {
    exec(
      "cd " +
        pwd +
        input.app_name +
        " && npm init -y && npm  pkg set scripts.test='npm test' "
    );
    setupESLint(pwd + input.app_name, input.app_name);
  }
  if (!fs.existsSync(source)) source = pwd + input.app_name + "/hello_world";
  moveFolder(source + " ", pwd + input.app_name + "/" + "lambda_demo");
}
export function copyLambdaLogic(source: string, desti: string) {
  exec("cp -r " + source + desti);
}
export function moveFolder(source: string, desti: string) {
  exec("mv " + source + desti);
}
export function removeFolder(path: string) {
  exec(config.ForceRemove + path);
}
export function generateLambdafiles(
  logic: boolean,
  app_data: AnyObject,
  resources: AnyObject,
  stacktype: string,
  stackname: string,
  j: string
) {
  let code;
  if (logic) {
    if (
      Object.prototype.hasOwnProperty.call(
        resources["resources"][j],
        "logicpath"
      )
    ) {
      code =
        logics.LambdaLogics[app_data.language][
          resources["resources"][j]["logicpath"]
        ];
    } else {
      if (resources["type"] == "components" || stacktype == "") {
        code =
          logics.LambdaLogics[app_data.language][
            resources["resources"][j]["name"]
          ];
      } else {
        code =
          logics.LambdaLogics[app_data.language][
            stacktype + "_" + resources["resources"][j]["name"]
          ];
      }
    }

    if (code !== undefined) {
      let path;
      if (stackname == "") {
        path =
          app_data.app_name + "/" + resources["resources"][j]["name"] + "/";
        if (
          Object.prototype.hasOwnProperty.call(
            resources["resources"][j],
            "package"
          )
        ) {
          installDependies(
            path,
            resources["resources"][j]["package"],
            app_data.dependency
          );
        }
        path = path + "app" + app_data.extension;
      } else {
        path =
          app_data.app_name +
          "/" +
          stackname +
          "/" +
          resources["resources"][j]["name"] +
          "/";
        if (
          Object.prototype.hasOwnProperty.call(
            resources["resources"][j],
            "package"
          )
        ) {
          installDependies(
            path,
            resources["resources"][j]["package"],
            app_data.dependency
          );
        }
        path = path + "app" + app_data.extension;
      }
      writeFile(path, code);
    }
  }
}
export function cliModuletoConfig(input: AnyObject, modify: boolean) {
  if (!modify) {
    initializeSAM(input);
  }
  const app_types: AnyObject = {};
  
  if (Object.keys(input["stack_details"]).length > 0) {
    Object.keys(input["stack_details"]).forEach((ele) => {
      let stackdata: AnyObject = {};
      if (input["stack_details"][ele]["type"] == "CRUDModule") {
        stackdata = modules.Modules[input["stack_details"][ele]["type"]]["resource"](
          ele,
          input["stack_details"][ele]["params"]
        );
      }else if (input["stack_details"][ele]["type"] == "Custom") {
          const resources: AnyArray = [];
          const customstackarray: AnyArray = input["stack_details"][ele]["componentlist"];
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
      }
       else {
        stackdata = JSON.parse(
          JSON.stringify(modules.Modules[input["stack_details"][ele]["type"]]["resource"])
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
      const randomstr: string = makeid(4);
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

      copyLambdaLogic(path, path2);
      generateLambdafiles(
        logic,
        app_data,
        resources,
        StackType,
        lambda_stack_names,
        j
      );
      setupTestEnv(path2, app_data.dependency, app_data.app_name);

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
    const template1 = addResourceTemplate(res, Object.keys(res), {});
    if (Object.prototype.hasOwnProperty.call(resources, "parameter")) {
      template1["Parameters"] = resources.parameter;
    }
    const doc = new yaml.Document();
    doc.contents = template1;
    const temp = replaceYAML(doc.toString());
    writeFile(
      app_data.app_name + "/" + stack_names[i] + "/template.yaml",
      temp
    );
  }
  if (filename !== "") {
    const datas: string = fs.readFileSync(pwd + "/" + filename.trim(), {
      encoding: "utf-8",
    });
    data = Yaml.load(replaceTempTag(datas));
    if (Object.prototype.hasOwnProperty.call(data, "AWSTemplateFormatVersion"))
      data["AWSTemplateFormatVersion"] =
        config.SkeletonConfig["template_version"];
    if (!Object.prototype.hasOwnProperty.call(data, "Resources"))
      throw new Error("Improper SAM template file in " + filename);
  }

  const template = addResourceTemplate(stackes, stack_names, data);
  const doc = new yaml.Document();
  doc.contents = template;
  writeFile(app_data.app_name + "/template.yaml", doc.toString());
}
export function getAppdata(input: AnyObject) {
  const app_data: AnyObject = {};
  app_data["app_name"] = input.app_name;
  app_data["language"] = config.LanguageSupport[input.language]["version"];
  app_data["dependency"] = config.LanguageSupport[input.language]["dependency"];
  app_data["extension"] = config.LanguageSupport[input.language]["extension"];
  if (input["stack_details"] !== undefined) {
    let appdata:AnyArray=[]
    Object.keys(input["stack_details"]).forEach(ele=>{
      appdata.push(input["stack_details"][ele]["type"])
    })
    app_data["StackType"] = appdata
  }

  return app_data;
}
export function generateSAM(input: AnyObject) {
  const app_data = getAppdata(input);
  const app_types = cliModuletoConfig(input, false);
  const appname: string = input.app_name;
  createStack(app_data, app_types, "");
  exec(config.ForceRemove + input.app_name + config.LambdaDemo);
  generateRoverConfig(input.app_name, input, "rover_create_project");
  exec("cd " + pwd + appname + " && npm run format:write");
}
export function addComponents(input: AnyObject) {
  const Datas = fs.readFileSync(pwd + "/" + input.file_name.trim(), {
    encoding: "utf-8",
  });
  let Data = Yaml.load(replaceTempTag(Datas));
  if (Object.prototype.hasOwnProperty.call(Data, "Resources")) {
    const res: AnyObject = {};
    const app_data = getAppdata(input);
    const input2 = JSON.parse(JSON.stringify(input));
    input2.app_name = input.app_name + "_test";
    initializeSAM(input2);
    if (input.nested) {
      Object.keys(input.nestedComponents).forEach((ele) => {
        const comp: AnyObject = {};
        res["resources"] = getComponents(
          input.nestedComponents[ele]["components"]
        );
        Data = Yaml.load(
          replaceTempTag(
            fs.readFileSync(
              pwd +
                "/" +
                input.app_name +
                "/" +
                input.nestedComponents[ele]["path"].trim(),
              { encoding: "utf-8" }
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
        res1 = addResourceTemplate(res1, Object.keys(res1), Data);
        const doc = new yaml.Document();
        doc.contents = res1;
        const temp = replaceYAML(doc.toString());
        writeFile(
          input.app_name + "/" + input.nestedComponents[ele]["path"].trim(),
          temp
        );
      });
    } else {
      const comp: AnyObject = {};
      res["resources"] = getComponents(input.components);

      comp["demo_desti"] = input2.app_name;
      let res1 = createStackResources(res, app_data, "", "", comp);
      res1 = addResourceTemplate(res1, Object.keys(res1), Data);
      const doc = new yaml.Document();
      doc.contents = res1;
      const temp = replaceYAML(doc.toString());
      writeFile(input.file_name.trim(), temp);
    }
    removeFolder(input2.app_name);
    generateRoverConfig(input.app_name, input, "rover_add_component");
  } else {
    console.log("wrong template structure");
  }
}
export function addModules(input: AnyObject) {
  try {
    const input2 = JSON.parse(JSON.stringify(input));
    input2.app_name = input.app_name + "_test";
    initializeSAM(input2);
    exec("rm -rf " + pwd + input.app_name + "/" + "lambda_demo");
    moveFolder(
      pwd + input2.app_name + "/" + "lambda_demo" + " ",
      pwd + input.app_name + "/" + "lambda_demo"
    );
    exec("rm -rf " + pwd + input2.app_name);

    const app_types = cliModuletoConfig(input, true);
    const app_data = getAppdata(input);
    createStack(app_data, app_types, input.file_name);
    exec("rm -rf " + pwd + input.app_name + "/" + "lambda_demo");
    generateRoverConfig(input.app_name, input, "rover_add_module");
  } catch (error) {
    throw new Error((error as Error).message);
  }
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
export function checkNested(template: string) {
  const Data = Yaml.load(
    replaceTempTag(
      fs.readFileSync(pwd + "/" + template.trim(), { encoding: "utf-8" })
    )
  );
  const CompStacks: AnyObject = {};
  let checkNested = false;
  const result: AnyObject = {};
  const resources = Object.keys(Data["Resources"]);
  resources.forEach((ele) => {
    if (Data["Resources"][ele]["Type"] === config.stacktype) {
      checkNested = true;
      CompStacks[ele] = Data["Resources"][ele]["Properties"]["TemplateURL"];
    }
  });
  result["checkNested"] = checkNested;
  result["CompStacks"] = CompStacks;
  return result;
}

function updatevalue(input: string, data: string) {
  const result = input.trim().split(" ");
  const val: AnyObject = {};
  const resvalue = result.splice(1, result.length).join(" ");
  let tag = result[0].replace("!", "");
  if (tag !== "Ref") {
    tag = "Fn::" + tag;
  }

  val[tag] = resvalue;
  data = data.replace(input.trim(), JSON.stringify(val));
  return data;
}
export function replaceTempTag(yamlinput: string) {
  let result;
  do {
    result = sub.exec(yamlinput);
    if (result !== null) {
      yamlinput = updatevalue(result[0], yamlinput);
    }
  } while (result !== null);

  return yamlinput;
}
export function NumtoAlpabet(params: number) {
  let res = "";
  let modstr = "";
  if (params > 26) modstr = NumtoAlpabet(params % 26);
  do {
    if (params > 26) {
      res = res + "z";
      params = Math.floor(params / 26);
      res = res + NumtoAlpabet(params);
    } else {
      res = (params + 9).toString(36);
    }
  } while (params > 26);
  res = res + modstr;
  return res.toUpperCase();
}
export function makeid(length: number) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    if (i == 0) result = result.toUpperCase();
  }
  return result;
}

export const langValue = async function () {
  const pwd = (process.cwd() + "/").trim();
  if (!fs.existsSync(pwd + ".aws-sam/build.toml")) exec("sam build");
  const datas = fs.readFileSync(pwd + ".aws-sam/build.toml", {
    encoding: "utf-8",
  });
  const data: AnyObject = TOML.parse(datas);
  const langarray: AnyArray = [];
  const jsresult: AnyArray = [];
  const pyresult: AnyArray = [];
  Object.keys(data).forEach((ele) => {
    Object.keys(data[ele]).forEach((obj) => {
      if (Object.prototype.hasOwnProperty.call(data[ele][obj], "runtime"))
        langarray.push(data[ele][obj]["runtime"]);
    });
  });
  langarray.forEach((ele) => {
    if (ele.match(jspattern) !== null) jsresult.push(...ele.match(jspattern));
    if (ele.match(pythonpattern) !== null)
      pyresult.push(...ele.match(pythonpattern));
  });
  if (jsresult.length > pyresult.length) return "js";
  else if (pyresult.length > jsresult.length) return "python";
  else return "js";
};

export const samValidate = async function (filename: string) {
  try {
    let path: string;
    if (filename !== "") {
      filename = pwd + filename;
      path = filename + "/";
    } else {
      filename = exec("pwd").toString().replace("\n", "");
      path = "";
    }
    const files: AnyArray = fs.readdirSync(filename);
    const yamlfiles: AnyArray = [];
    const response: AnyArray = [];
    files.map((ele) => {
      if (ele.match(yamlpattern) !== null) yamlfiles.push(path + ele);
    });
    yamlfiles.map((ele) => {
      let data = fs.readFileSync(ele, { encoding: "utf-8" });
      data = Yaml.load(replaceTempTag(data));
      if (
        Object.prototype.hasOwnProperty.call(
          data,
          "AWSTemplateFormatVersion"
        ) &&
        Object.prototype.hasOwnProperty.call(data, "Transform") &&
        Object.prototype.hasOwnProperty.call(data, "Description") &&
        Object.prototype.hasOwnProperty.call(data, "Resources")
      ) {
        response.push(true);
      }
    });
    if (!response.includes(true)) {
      throw new Error("SAM Template error \n");
    }
  } catch (error) {
    const errormessage = (error as Error).message;
    throw new Error("Not a SAM file or " + errormessage);
  }
};

export const generateRoverConfig = function (
  filename: string,
  data: AnyObject,
  type: string
) {
  const response: AnyObject = {};
  if (filename === "") filename = pwd.split("/")[pwd.split("/").length - 1];
  const originalfilename = filename;
  filename = filename + "/roverconfig.json";
  if (fs.existsSync(pwd + filename)) {
    const filedata = fs.readFileSync(pwd + filename, { encoding: "utf-8" });
    const dataobject = JSON.parse(filedata);
    const types = Object.keys(dataobject);
    const typesarray = [
      types.includes("rover_add_module"),
      types.includes("rover_add_component"),
      types.includes("rover_create_project"),
      types.includes("rover_deploy_cli"),
      types.includes("rover_generate_pipeline"),
      types.includes("rover_deploy_repo"),
    ];
    if (!typesarray.includes(true)) {
      console.log(
        `improper rover config file (to fix ,delete roverconfig.json in ${
          pwd + filename
        } )`
      );
      return 0;
    }
    if (!Object.prototype.hasOwnProperty.call(dataobject, type))
      dataobject[type] = [];
    if (dataobject.app_name == data.app_name) delete data.app_name;
    if (dataobject.language == data.language) delete data.language;
    dataobject[type].push(data);
    data = dataobject;
  } else {
    if (!fs.existsSync(pwd + originalfilename))
      throw new Error(`Wrong file path ${pwd + originalfilename} `);
    response["app_name"] = data.app_name;
    response["language"] = data.language;
    delete data.app_name;
    delete data.language;
    response[type] = [];
    response[type].push(data);
    data = response;
  }
  writeFile(filename, JSON.stringify(data));
};
