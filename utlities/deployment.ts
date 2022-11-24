const exec = require("child_process").execSync;
const process = require('process');
let fs = require("fs");
import { AnyArray, AnyObject } from "immer/dist/internal";
import * as rover_config  from "../utlities/config"

export function setupRepo(repoconfig:AnyObject){
    try {
        let piplibraries:string=""
        try {
            piplibraries=exec("pip3 list").toString()
        } catch (error) {
            throw new Error("Python3 and pip3 required");   
        }
        if (piplibraries==="") throw new Error("yaml,sys and json python modules are required.");
        let piplibrarieslist:AnyArray=[]
        piplibraries.split(" ").forEach(ele=>{
            if (ele!=='') piplibrarieslist.push(ele.replace(/[!@#$%^&\*()_\-={}\[\]:\"<>,\\.?\n]*\d*/g, ''))

        })
        if (piplibrarieslist.includes("pyyaml")) throw new Error("install yaml library (pip3 install pyyaml)")
        if (piplibrarieslist.includes("sys")) throw new Error("install sys library (pip3 install sys)")
        repoconfig.app_name=exec("pwd").toString().replace("\n","");
        let filenamearray=( repoconfig.app_name).split("/")
        repoconfig.name = filenamearray[filenamearray.length-1].replace("\n","");
        let appname = repoconfig.app_name
        let repoconfigres: string = JSON.stringify(repoconfig)
        let pipelinepath=appname+"/pipeline.yml "
        if (repoconfig.tool == "GitHub") {
            if (!fs.existsSync(appname + "/.github")) exec("mkdir " + appname + "/.github")
            if (!fs.existsSync(appname + "/.github/workflows")) exec("mkdir " + appname + "/.github/workflows")
            pipelinepath=appname+"/.github/workflows/main.yml "
        }
        exec("python3 -m pip install pyyaml")     
        exec("python3 "+rover_config.npmroot+"/@rover-tools/cli/node_modules/@rover-tools/engine/pipeline/pipelinegenerator.py "+ pipelinepath +"'"+repoconfigres+"'")         
        process.chdir(appname);   
    } catch (error) {
        throw new Error((error as Error).message)
    }
}
