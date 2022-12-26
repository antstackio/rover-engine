import * as config from "./config";
import * as rover_resources from "../resources/resources";
import * as logics from "../resources/logics";
import { AnyArray, AnyObject } from "immer/dist/internal";
import * as child from "child_process";
import * as yaml from "yaml";
import * as fs from "fs";
import * as TOML from "@iarna/toml";
import * as Yaml from "js-yaml";
const exec = child.execSync;
const sub = new RegExp(
  /(!Sub|!Transform|!Split|!Join|!Select|!FindInMap|!GetAtt|!GetAZs|!ImportValue|!Ref)\s[a-zA-Z0-9 !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*\n/g
);
const pythonpattern = new RegExp(/python[1-9]*\.[1-9]*/g);
const jspattern = new RegExp(/nodejs[1-9]*\.[a-zA-Z]*/g);
const yamlpattern = new RegExp(/(\.yaml$)/g);

export const pwd = process.cwd() + "/";
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
      "&& npm i -D eslint prettier eslint-plugin-prettier eslint-config-prettier "
  );
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
export function checkNested(template: string) {
  const Data = <AnyObject>(
    Yaml.load(
      replaceTempTag(
        fs.readFileSync(pwd + "/" + template.trim(), { encoding: "utf-8" })
      )
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
      const datas = fs.readFileSync(ele, { encoding: "utf-8" });
      const data = <AnyObject>Yaml.load(replaceTempTag(datas));
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
