import * as child from "child_process";
const exec = child.execSync;
import * as fs from "fs";
import * as process from "process";
import { IroverDeploymentObject } from "../roverTypes/rover.types";
import * as rover_config from "../utlities/config";

export function setupRepo(repoconfig: IroverDeploymentObject): void {
  try {
    let piplibraries = "";
    try {
      piplibraries = exec("pip3 list").toString();
    } catch (error) {
      throw new Error("Python3 and pip3 required");
    }
    if (piplibraries === "")
      throw new Error("yaml,sys and json python modules are required.");
    const piplibrarieslist: Array<string> = [];
    piplibraries.split(" ").forEach((ele) => {
      if (ele !== "")
        piplibrarieslist.push(
          ele.replace(/[!@#$%^&*()_\-={}[\]:"<>,\\.?\n]*\d*/g, "")
        );
    });
    if (piplibrarieslist.includes("pyyaml"))
      throw new Error("install yaml library (pip3 install pyyaml)");
    if (piplibrarieslist.includes("sys"))
      throw new Error("install sys library (pip3 install sys)");
    repoconfig.appName = exec("pwd").toString().replace("\n", "");
    const filenamearray = repoconfig.appName.split("/");
    repoconfig.name = filenamearray[filenamearray.length - 1].replace("\n", "");
    const appname = repoconfig.appName;
    const repoconfigres: string = JSON.stringify(repoconfig);
    let pipelinepath = appname + "/pipeline.yml ";
    if (repoconfig["tool"] == "GitHub") {
      if (!fs.existsSync(appname + "/.github"))
        exec("mkdir " + appname + "/.github");
      if (!fs.existsSync(appname + "/.github/workflows"))
        exec("mkdir " + appname + "/.github/workflows");
      pipelinepath = appname + "/.github/workflows/main.yml ";
    }
    exec("python3 -m pip install pyyaml");
    exec(
      "python3 " +
        rover_config.npmroot +
        "/@rover-tools/cli/node_modules/@rover-tools/engine/src/deployment/pipeline/pipelinegenerator.py " +
        pipelinepath +
        "'" +
        repoconfigres +
        "'"
    );
    process.chdir(appname);
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
