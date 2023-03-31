import * as config from "./config";
import * as rover_resources from "../resources/resources";
import * as logics from "../resources/logics";
import * as fs from "fs";
import * as modules from "../resources/modules/modules";
import * as components from "../resources/components/components";
import { IcurdComponentObject } from "../generateSAM/generatesam.types";
import {
  TroverAppTypeObject,
  TroverResourcesArray,
  IaddComponentResource,
  IroverAppData,
  IroverAppType,
  IroverInput,
  TSAMTemplate,
  TSAMTemplateResources,
} from "../roverTypes/rover.types";
import {
  IaddComponentAppData,
  IroveraddComponentInput,
} from "../addComponents/addComponents.types";
import * as child from "child_process";
const exec = child.execSync;
/* eslint-disable no-useless-escape */
const sub = new RegExp(
  /(!Sub|!Transform|!Split|!Join|!Select|!FindInMap|!GetAtt|!GetAZs|!ImportValue|!Ref)[a-zA-Z0-9 !@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]*\n/g
);

export const pwd = process.cwd() + "/";

export function writeFile(path: string, data: string) {
  path = (pwd + "/" + path).replace(/\/\/*/g, "/");
  fs.writeFileSync(path, data);
}
export function installDependencies(
  path: string,
  packages: Array<string>,
  dependency: string
): void {
  if (dependency == "npm") {
    packages.forEach((ele) => {
      exec("npm --prefix " + pwd + path + " install " + ele + " --save");
    });
  }
}
export function setupTestEnv(
  path: string,
  dependency: string,
  appname: string
): void {
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
export function setupESLint(path: string, filename: string): void {
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
  resources: TSAMTemplateResources,
  name: Array<string>,
  temp: TSAMTemplate | undefined
): TSAMTemplate {
  let template: TSAMTemplate;
  if (temp == undefined) {
    template = rover_resources.skeleton();
  } else {
    template = temp;
  }

  for (const i in name) {
    template["Resources"][name[i]] = resources[name[i]];
  }
  return template;
}
export function replaceYAML(doc: string): string {
  const yamlArray: Record<string, string> = {
    OFF: "'OFF'",
  };
  Object.keys(yamlArray).forEach((key) => {
    doc = doc.replace(key, yamlArray[key]);
  });
  return doc;
}
export function initializeSAM(
  input: IroveraddComponentInput | IroverInput
): void {
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
export function copyLambdaLogic(source: string, desti: string): void {
  exec("cp -r " + source + desti);
}
export function moveFolder(source: string, desti: string): void {
  exec("mv " + source + desti);
}
export function removeFolder(path: string): void {
  exec(config.ForceRemove + path);
}
export function generateLambdaFiles(
  logic: boolean,
  app_data: IroverAppData | IaddComponentAppData,
  resources: IroverAppType | IaddComponentResource,
  stacktype: string,
  stackname: string,
  i: string
): void {
  let code;
  const j = <number>(<unknown>i);
  if (logic) {
    if (resources["resources"][j]["logicpath"] !== "") {
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
          installDependencies(
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
          installDependencies(
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

export function replaceTempTag(yamlinput: string): string {
  let result;
  do {
    result = sub.exec(yamlinput);
    if (result !== null) {
      yamlinput = updateValue(result[0], yamlinput);
    }
  } while (result !== null);

  return yamlinput;
}
function updateValue(input: string, data: string): string {
  const result = input.trim().split(" ");
  const val: Record<string, string> = {};
  const resvalue = result.splice(1, result.length).join(" ");
  let tag = result[0].replace("!", "");
  if (tag !== "Ref") {
    tag = `Fn::` + tag;
  }

  val[tag] = resvalue;
  data = data.replace(input.trim(), JSON.stringify(val));
  return data;
}
export function getAppdata(input: IroverInput): IroverAppData {
  const appDataArray: Array<string> = [];
  Object.keys(input.stackDetails).forEach((ele) => {
    appDataArray.push(input.stackDetails[ele].type);
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
    initializeSAM(input);
  }
  const app_types: TroverAppTypeObject = {};
  Object.keys(input["stackDetails"]).forEach((ele) => {
    let stackdata: TroverAppTypeObject = {};
    if (input["stackDetails"][ele]["type"] == "CRUDModule") {
      const fundata = (<
        (
          apiname: string,
          config: Record<string, IcurdComponentObject>
        ) => Record<string, IaddComponentResource>
      >modules.Modules[input["stackDetails"][ele]["type"]]["resource"])(
        ele,
        <Record<string, IcurdComponentObject>>(
          input["stackDetails"][ele]["params"]
        )
      );
      stackdata = <TroverAppTypeObject>fundata;
    } else if (input["stackDetails"][ele]["type"] == "Custom") {
      const resources: TroverResourcesArray = [];
      const customstackarray: Array<string> =
        input.stackDetails[ele]["componentList"];
      customstackarray.forEach((ele) => {
        const componentarray: TroverResourcesArray = JSON.parse(
          JSON.stringify(components.Components[ele])
        );
        componentarray.forEach((ele) => {
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
          modules.Modules[input["stackDetails"][ele]["type"]]["resource"]
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