import * as config  from "./config"
import * as rover_resources  from "../resources/resources"
import * as logics  from "../resources/logics"
import * as modules  from "../resources/modules"
import * as components  from "../resources/components"
import { AnyArray, AnyObject } from "immer/dist/internal";
const exec = require("child_process").execSync;
const yaml = require("yaml");
let fs = require("fs");
export let  pwd =process.cwd()+"/"
let doc = new yaml.Document();
const sub  = new RegExp(/(!Sub|!Transform|!Split|!Join|!Select|!FindInMap|!GetAtt|!GetAZs|!ImportValue|!Ref)\s[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*\n/g);

let Yaml = require("js-yaml");

export let npmrootTest= function(){ 
    let packages=exec(" npm -g  ls").toString().trim().split(/\r?\n/)
    packages.shift()
    packages=packages.filter(ele=>{
        ele=ele.match("@rover-tools/cli")
        if(ele!==null){
            return ele
        }
    })
    return packages.length>0
}
export  function checkFile(path:string, type:string){
    let response:AnyObject={}
    response["checkFile"]=false
    let patharray=path.split("/")
    if(type=="no"){
        if (fs.existsSync(path)) {
            throw new Error(patharray[patharray.length-1]+" file already exists")
        }
    }
    if(type=="yes"){
        if (!fs.existsSync(path)) {
            throw new Error(patharray[patharray.length-1]+" file doesn't exists")   
           }
    }
}
export  function writeFile(path:string, data:string){ 
     fs.writeFileSync(pwd+"/"+path,data);
}
export  function installDependies(path:string,packages:AnyArray,dependency:string){ 
    
    if (dependency=="npm") {
        packages.map(ele=>{
            exec("npm --prefix "+pwd+path+" install "+ele+" --save")
            console.log("npm --prefix "+pwd+path+" install "+ele+"")
        })
        
    }
    
}
export function testsetup(path:string,dependency:string,appname:string) {
    if (dependency=="npm") {
        exec("npm --prefix "+path+"/ install jest --save")
        exec("npm --prefix "+pwd+appname+"/ install jest --save")
        exec("npm --prefix "+pwd+appname+"/ pkg set scripts.test='npm test' ")
        exec("mv "+path+"tests/unit/test-handler.js "+path+"tests/unit/test.test.js")
    }
}
export  function addResourceTemplate(resources, name,temp){ 
    let template
    if (temp==undefined) {
        template=rover_resources.skeleton()
    }else{
        template=temp
    }
   
        for(let  i in name){ 
            template["Resources"][name[i]]=resources[name[i]]
        }
        return template   
}
export function replaceYAML(doc:string){
    let yamlArray:AnyObject = {
       
        "OFF": "'OFF'",

    }
    Object.keys(yamlArray).forEach((key)=> {
        doc=doc.replace(key, yamlArray[key])
    });
    return doc
}
export function initializeSAM(input:AnyObject){   
    let app_name=input.app_name
    removeFolder(input.app_name)
    let language= config.LanguageSupport[input.language]["version"]
    let dependency=config.LanguageSupport[input.language]["dependency"]
    exec(config.SAMInitBase+config.SAMLanguage+language+config.SAMDependency+dependency+config.SAMAppName+app_name+config.SAMAppTemplate)
    let source=pwd+input.app_name+"/hello-world"
    if (dependency=="npm")
    {
        exec("npm init -y -w "+pwd+input.app_name)
        exec("npm --prefix "+pwd+input.app_name+" pkg set scripts.test='npm test' ")
    }  
    if(!fs.existsSync(source))source=pwd+input.app_name+"/hello_world"
    moveFolder(source+" ",pwd+input.app_name+"/"+"lambda_demo")
}
export function copyLambdaLogic(source:string,desti:string){
    exec("cp -r "+source+desti)
}
export function moveFolder(source:string,desti:string) {
    exec("mv "+source+desti)
}
export function removeFolder (path:string) {
    exec(config.ForceRemove+path)
}
export function generateLambdafiles(logic,app_data,resources,stacktype,stackname,j) {
    let code
    
    if(logic){
        
        if (resources["resources"][j].hasOwnProperty("logicpath")) {
            code =logics.LambdaLogics[app_data.language][resources["resources"][j]["logicpath"]]
            
        }else{
            if(resources["type"]=="components"|| stacktype==undefined ){
                code =logics.LambdaLogics[app_data.language][resources["resources"][j]["name"]]
            }else{
                code =logics.LambdaLogics[app_data.language][stacktype+"_"+resources["resources"][j]["name"]]
            }

        }
        
        if (code!==undefined){
            let path
            if (stackname==undefined) {
                path=app_data.app_name+"/"+resources["resources"][j]["name"]+"/"
                if (resources["resources"][j].hasOwnProperty("package")) {
                    installDependies(path,resources["resources"][j]["package"],app_data.dependency)
                }
                path=path+"app"+app_data.extension
                
            }else{
                path=app_data.app_name+"/"+stackname+"_Stack"+"/"+resources["resources"][j]["name"]+"/"
                if (resources["resources"][j].hasOwnProperty("package")) {
                    installDependies(path,resources["resources"][j]["package"],app_data.dependency)
                }
                path=path+"app"+app_data.extension
            }
        writeFile(path,code)
        }
    }     
}
export function cliModuletoConfig(input:AnyObject){
   initializeSAM(input)
    let app_types:AnyObject={}
    if( Object.keys(input["Stacks"]).length>0){
        Object.keys(input["Stacks"]).forEach(ele =>{
            let stackdata:AnyObject={}
            if(input["Stacks"][ele]=="CRUD"){
                stackdata=modules.StackType[input["Stacks"][ele]](ele,input["StackParams"][ele])
                    
            }else if(input["Stacks"][ele]=="RDS"){
                stackdata=modules.StackType[input["Stacks"][ele]](ele,{})
            }
            else{
                stackdata=JSON.parse(JSON.stringify(modules.StackType[input["Stacks"][ele]]))
            }
                Object.keys(stackdata).forEach(ele1=>{
                app_types[ele+ele1]=stackdata[ele1]
                app_types[ele+ele1]["type"]="module"
            })
            
            
        })
    }
    if( Object.keys(input["CustomStacks"]).length>0){
        Object.keys(input["CustomStacks"]).forEach(ele =>{
            let resources:AnyArray=[]
            input["CustomStacks"][ele].map(ele=>{
                JSON.parse(JSON.stringify(components.Components[ele])).map(ele=>{
                    resources.push(ele)
                })
                }
            )
            app_types[ele]={}
            app_types[ele]["resources"]=resources
            app_types[ele]["type"]="components"
        })
    }
    return app_types
}
export function createStackResources(resources,app_data,StackType,stack_names,comp){
        let res={}
    for(let j in  resources["resources"]){ 
        let configs=resources["resources"][j]["config"]
        let logic=resources["resources"][j]["logic"]
        
        if(config.AWSResources[resources["resources"][j]["type"]].hasOwnProperty("name")){
            let name=(resources["resources"][j]["name"]).replace(" ","")
            name=name.replace(/[^a-z0-9]/gi, '');

            configs[config.AWSResources[resources["resources"][j]["type"]]["name"]]=name
        }
        if(resources["resources"][j]["type"]=="lambda"){ 
            let path
            let path2
            if (stack_names==undefined) {
                if (comp.demo_desti!==undefined) {
                    path=pwd+comp.demo_desti+"/"+"lambda_demo"+"/ "
                path2=pwd+app_data.app_name+"/"+resources["resources"][j]["name"]+"/"
                    
                }
                if (comp.desti!==undefined) {
                    path=pwd+comp.demo_desti+"/"+"lambda_demo"+"/ "
                    path2=pwd+comp.desti+"/"+resources["resources"][j]["name"]+"/"
                }
            }else{
                path=pwd+app_data.app_name+"/"+"lambda_demo"+"/ "
                path2=pwd+app_data.app_name+"/"+stack_names+"_Stack"+"/"+resources["resources"][j]["name"]+"/"
            }
            copyLambdaLogic(path,path2)
            generateLambdafiles(logic,app_data,resources,StackType,stack_names,j)
            testsetup(path2,app_data.dependency,app_data.app_name)
            configs["CodeUri"]=resources["resources"][j]["name"]+"/"
            configs["Runtime"]=app_data.language
        }else if(resources["resources"][j]["type"]=="apigateway"){
            exec("mkdir "+pwd+app_data.app_name+"/"+stack_names+"_Stack"+"/"+resources["resources"][j]["name"]+"_apigateway")
            configs["path"]=resources["resources"][j]["name"]+"_apigateway"+"/swagger.yaml"
            configs["filepath"]=app_data.app_name+"/"+stack_names+"_Stack"+"/"+resources["resources"][j]["name"]+"_apigateway"+"/swagger.yaml"
        }
        let resources1=rover_resources.resourceGeneration(resources["resources"][j]["type"],configs)
        res[resources["resources"][j]["name"]] = resources1
    }
    return res
}
export  function createStack(app_data,app_types){
    let stack_names = Object.keys(app_types)
    let resource=app_types
    let StackType = app_data.StackType
    let stackes={}
    for( let i=0;i< stack_names.length;i++){ 
        let stacks= rover_resources.resourceGeneration("stack",{"TemplateURL":stack_names[i]+"_Stack"+"/template.yaml"})
        stackes[stack_names[i]]=stacks
        exec("mkdir "+pwd+app_data.app_name+"/"+stack_names[i]+"_Stack")
            let resources=resource[stack_names[i]] 
            let comp={}
            let res=createStackResources(resources,app_data,StackType[i],stack_names[i],comp)
            let template1= addResourceTemplate(res,Object.keys(res),undefined)
            if (resources.hasOwnProperty("parameter")) {

                template1["Parameters"]=resources.parameter
                
            }
            let doc = new yaml.Document();
            doc.contents = template1;
            let temp=replaceYAML(doc.toString())
            writeFile(app_data.app_name+"/"+stack_names[i]+"_Stack"+"/template.yaml",temp)   
    }
    let template= addResourceTemplate(stackes,stack_names,undefined)
    let doc = new yaml.Document();
    doc.contents = template;
    writeFile(app_data.app_name+"/template.yaml",doc.toString())
}
export  function getAppdata(input) { 
    let app_data={}
    app_data["app_name"]=input.app_name
    app_data["language"]= config.LanguageSupport[input.language]["version"]
    app_data["dependency"]=config.LanguageSupport[input.language]["dependency"]
    app_data["extension"]=config.LanguageSupport[input.language]["extension"]
    if (input["Stacks"]!==undefined){
        app_data["StackType"] = Object.values(input["Stacks"])
    }
    
    return app_data
}
export function  generationSAM(input){
    
    let app_data= getAppdata(input)
    let app_types=cliModuletoConfig(input)
    createStack(app_data,app_types)
    exec(config.ForceRemove+input.app_name+config.LambdaDemo)
}
export function addComponents(input){
    let Data = fs.readFileSync(pwd+"/"+input.file_name.trim(), { encoding: "utf-8" });
    Data=Yaml.load(replaceTempTag(Data))
    if(Data.hasOwnProperty("Resources")){

        let res={}
        let app_data=getAppdata(input)
        let input2=JSON.parse(JSON.stringify(input))
        input2.app_name=input.app_name+"_test"
        initializeSAM(input2)
        if (input.nested) {
            Object.keys(input.nestedComponents).forEach(ele=>{
                let comp={}
                res["resources"]=getComponents(input.nestedComponents[ele]["type"])

                Data = Yaml.load(replaceTempTag(fs.readFileSync(pwd+"/"+input.app_name+"/"+input.nestedComponents[ele]["path"].trim(), { encoding: "utf-8" })));
                let path:AnyArray =(input.app_name+"/"+input.nestedComponents[ele]["path"]).split("/")
                path.pop()
                comp["desti"]=path.join("/");

                comp["demo_desti"]=input2.app_name
                let res1=createStackResources(res,app_data,undefined,undefined,comp)
                res1= addResourceTemplate(res1,Object.keys(res1),Data)
                let doc = new yaml.Document();
                doc.contents = res1;
                let temp=replaceYAML(doc.toString())
                writeFile(input.app_name+"/"+input.nestedComponents[ele]["path"].trim(),temp)  
            })
            
        }else{
            let comp={}
            res["resources"]=getComponents(input.components)
            
            comp["demo_desti"]=input2.app_name
            let res1=createStackResources(res,app_data,undefined,undefined,comp)
            res1= addResourceTemplate(res1,Object.keys(res1),Data)
            let doc = new yaml.Document();
            doc.contents = res1;
            let temp=replaceYAML(doc.toString())
            writeFile(input.file_name.trim(),temp) 
        }
        removeFolder(input2.app_name)
    }else{
        console.log("wrong template structure");
    }
    
}
export function getComponents(component){
    let resources:AnyArray=[]
    let componentstype:string
    Object.entries(component).map(ele=>{
        let componentstype:any=ele[1]
        JSON.parse(JSON.stringify(components.Components[componentstype])).map(ele=>{
            resources.push(ele)
        })    
    }
)
    return resources
}
export function checkNested(template:string) {
    let Data = Yaml.load(replaceTempTag(fs.readFileSync(pwd+"/"+template.trim(), { encoding: "utf-8" })));
    let CompStacks:AnyObject={}
    let checkNested=false
    let result:AnyObject={}
    let  resources=Object.keys(Data["Resources"])
    resources.forEach(ele=>{
        if(Data["Resources"][ele]["Type"]===config.stacktype){
            checkNested=true
            CompStacks[ele]=Data["Resources"][ele]["Properties"]["TemplateURL"]
        }
    })
    result["checkNested"]=checkNested
    result["CompStacks"]=CompStacks
    return result

}

function generateRoverAWSResource(cfjson:AnyObject,base:AnyArray){
    let result:AnyObject={}
    let optinal=Object.keys(cfjson["Properties"])
    if(base!==undefined){
        if (base.length>0) {
            base.map(ele=>{
                optinal = optinal.filter(e => e !== ele);
            })   
        }
    }
    let basejson={
        "name":"",
        "type":cfjson["Type"],
        "attributes":["Type","Properties","DependsOn"],
        "Properties":{
            "Base":base,
            "Optional":optinal,
        }
    }
    result[cfjson["Type"].split("::")[cfjson["Type"].split("::").length-1].toLowerCase()]=basejson

}
function updatevalue(input:string,data:string){
    let result=input.trim().split(" ")
    let val ={}
    let resvalue= (result.splice(1,result.length)).join(" ")
    let tag=result[0].replace("!","")
    if (tag!=="Ref") {
      tag="Fn::"+tag
    }
  
    val[tag]=resvalue
    data=data.replace(input.trim(),JSON.stringify(val))
    return data
  
}
export function replaceTempTag(yamlinput:string){
      
      let result
     
      do{
        result=sub.exec(yamlinput)
        if (result!==null) {
          yamlinput=updatevalue(result[0],yamlinput)
        }
        
      }while(result!==null)
      return yamlinput
}
  
