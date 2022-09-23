const exec = require("child_process").execSync;
const {spawn} = require("child_process");
const process = require('process');
var fs = require("fs");
import { AnyObject } from "immer/dist/internal";
import * as rover_utilities  from "../utlities/utilities"

export function setupRepo(repoconfig:AnyObject){
    repoconfig.app_name=exec("pwd").toString().replace("\n","");
    let filenamearray=( repoconfig.app_name).split("/")
    repoconfig.name = filenamearray[filenamearray.length-1].replace("\n","");
    let appname=repoconfig.app_name
    //exec("gh repo create "+appname+ " --"+repoconfig.repoType+" --clone"
    let repoconfigres:String=JSON.stringify(repoconfig)
    if(!fs.existsSync(appname+"/.github")) exec("mkdir "+appname+"/.github") 
    if(!fs.existsSync(appname+"/.github/workflows"))exec("mkdir "+appname+"/.github/workflows") 
    //console.log("python3 "+rover_utilities.npmroot+"/@rover-tools/cli/node_modules/@rover-tools/engine/pipeline/pipelinegenerator.py "+ appname+"/.github/workflows/main.yml "+appname+"/region.txt "+appname+"/accesskey.txt "+appname+"/secret.txt "+"'"+repoconfig+"'")    
    exec("python3 -m pip install pyyaml")     
    exec("python3 "+rover_utilities.npmroot+"/@rover-tools/cli/node_modules/@rover-tools/engine/pipeline/pipelinegenerator.py "+ appname+"/.github/workflows/main.yml "+appname+"/region.txt "+appname+"/accesskey.txt "+appname+"/secret.txt "+"'"+repoconfigres+"'")         
    process.chdir(appname);
   
}
//setupRepo("testres","public")