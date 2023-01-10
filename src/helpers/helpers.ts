import { TsamBuildTOML } from "../roverTypes/sam.types";
import * as config from "../utlities/config";
import * as fs from "fs";
import * as TOML from "@iarna/toml";
import * as Yaml from "js-yaml";
import * as utlities from "../utlities/utilities";
import * as child from "child_process";
import {
  TSAMTemplate,
  IroverConfigFileObject,
  TconfigFile,
} from "../roverTypes/rover.types";
const exec = child.execSync;
const pythonpattern = new RegExp(/python[1-9]*\.[1-9]*/g);
const jspattern = new RegExp(/nodejs[1-9]*\.[a-zA-Z]*/g);
const yamlpattern = new RegExp(/(\.yaml$)/g);
export const npmroot = config.npmroot;
export function checkNested(template: string) {
  const Data = <TSAMTemplate>Yaml.load(
    utlities.replaceTempTag(
      fs.readFileSync(utlities.pwd + "/" + template.trim(), {
        encoding: "utf-8",
      })
    )
  );
  const CompStacks: Record<string, string> = {};
  let isNested = false;
  const resources = Object.keys(Data["Resources"]);
  resources.forEach((ele) => {
    if (Data["Resources"][ele]["Type"] === config.stacktype) {
      isNested = true;
      CompStacks[ele] = <string>(
        Data["Resources"][ele]["Properties"]["TemplateURL"]
      );
    }
  });
  const result = { checkNested: isNested, compStacks: CompStacks };
  return result;
}

export function checkFile(path: string, type: string) {
  const response: Record<string, boolean> = {};
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
  const data: TsamBuildTOML = <TsamBuildTOML>(<unknown>TOML.parse(datas));
  const langarray: Array<string> = [];
  const jsresult: Array<string> = [];
  const pyresult: Array<string> = [];
  Object.keys(data).forEach((ele: string) => {
    Object.keys(data[ele]).forEach((obj: string) => {
      if (Object.prototype.hasOwnProperty.call(data[ele][obj], "runtime"))
        langarray.push(data[ele][obj]["runtime"]);
    });
  });
  langarray.forEach((ele) => {
    if (ele.match(jspattern) !== null) {
      const jsList = ele.match(jspattern);
      jsList?.forEach((ele) => {
        jsresult.push(ele);
      });
    }
    if (ele.match(pythonpattern) !== null) {
      const pyList = ele.match(pythonpattern);
      pyList?.forEach((ele) => {
        pyresult.push(ele);
      });
    }
  });
  if (jsresult.length > pyresult.length) return "js";
  else if (pyresult.length > jsresult.length) return "python";
  else return "js";
};

export const samValidate = async function (filename: string) {
  try {
    let path: string;
    if (filename !== "") {
      filename = utlities.pwd + filename;
      path = filename + "/";
    } else {
      filename = exec("pwd").toString().replace("\n", "");
      path = "";
    }
    const files: Array<string> = fs.readdirSync(filename);
    const yamlfiles: Array<string> = [];
    const response: Array<boolean> = [];
    files.forEach((ele) => {
      if (ele.match(yamlpattern) !== null) yamlfiles.push(path + ele);
    });
    yamlfiles.forEach((ele) => {
      const datas = fs.readFileSync(ele, { encoding: "utf-8" });
      const data = <TSAMTemplate>Yaml.load(utlities.replaceTempTag(datas));
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
  data: IroverConfigFileObject,
  type: string
) {
  const typess = <TconfigFile>(<unknown>type);
  const response: IroverConfigFileObject = <IroverConfigFileObject>{};
  if (filename === "")
    filename = utlities.pwd.split("/")[utlities.pwd.split("/").length - 1];
  const originalfilename = filename;
  filename = filename + "/roverconfig.json";
  if (fs.existsSync(utlities.pwd + filename)) {
    const filedata = fs.readFileSync(utlities.pwd + filename, {
      encoding: "utf-8",
    });
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
          utlities.pwd + filename
        } )`
      );
      return 0;
    }
    if (!Object.prototype.hasOwnProperty.call(dataobject, type))
      dataobject[typess] = [];
    if (dataobject.app_name == data.app_name) delete data.app_name;
    if (dataobject.language == data.language) delete data.language;
    dataobject[typess].push(data);
    data = dataobject;
  } else {
    if (!fs.existsSync(utlities.pwd + originalfilename))
      throw new Error(`Wrong file path ${utlities.pwd + originalfilename} `);
    response["app_name"] = data.app_name;
    response["language"] = data.language;
    delete data.app_name;
    delete data.language;
    response[typess] = [data];
    data = response;
  }
  utlities.writeFile(filename, JSON.stringify(data));
};

export const npmrootTest = function () {
  let packages: Array<string> = exec(" npm -g  ls")
    .toString()
    .trim()
    .split(/\r?\n/);
  packages.shift();
  packages = packages.filter((ele) => {
    const exp = ele.match("@rover-tools/cli");
    if (exp !== null) {
      return exp;
    }
  });
  return packages.length > 0;
};
