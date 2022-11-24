import * as config  from "./config"
import * as rover_resources  from "../resources/resources"
import * as logics  from "../resources/logics"
import * as modules  from "../resources/modules"
import * as components  from "../resources/components"
import { AnyArray, AnyObject } from "immer/dist/internal";
const exec = require("child_process").execSync;
const crypto = require('crypto');
const yaml = require("yaml");
let fs = require("fs");
export let  pwd =process.cwd()+"/"
let doc = new yaml.Document();
const sub  = new RegExp(/(!Sub|!Transform|!Split|!Join|!Select|!FindInMap|!GetAtt|!GetAZs|!ImportValue|!Ref)\s[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*\n/g);
let pythonpattern=new RegExp(/python[1-9]*\.[1-9]*/g)
let jspattern=new RegExp(/nodejs[1-9]*\.[a-zA-Z]*/g)
let yamlpattern=new RegExp(/(\.yaml$)/g)
let Yaml = require("js-yaml");
const TOML = require('@iarna/toml')
export let npmrootTest= function(){ 
    let packages:AnyArray=exec(" npm -g  ls").toString().trim().split(/\r?\n/)
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
    path=(pwd+"/"+path).replace(/\/\/*/g,"/")
     fs.writeFileSync(path,data);
}
export  function installDependies(path:string,packages:AnyArray,dependency:string){ 
    
    if (dependency=="npm") {
        packages.map(ele=>{
            exec("npm --prefix "+pwd+path+" install "+ele+" --save")
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
export  function addResourceTemplate(resources:AnyObject, name:AnyArray,temp:AnyObject){ 
    let template
    if (Object.keys(temp).length==0) {
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
       exec("cd "+pwd+input.app_name+" && npm init -y && npm  pkg set scripts.test='npm test' ")
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
export function generateLambdafiles(logic:boolean,app_data:AnyObject,resources:AnyObject,stacktype:string,stackname:string,j:string) {
    let code
    
    if(logic){
        
        if (resources["resources"][j].hasOwnProperty("logicpath")) {
            code =logics.LambdaLogics[app_data.language][resources["resources"][j]["logicpath"]]
            
        }else{
            if(resources["type"]=="components"|| stacktype=="" ){
                code =logics.LambdaLogics[app_data.language][resources["resources"][j]["name"]]
            }else{
                code =logics.LambdaLogics[app_data.language][stacktype+"_"+resources["resources"][j]["name"]]
            }

        }
        
        if (code!==undefined){
            let path
            if (stackname=="") {
                path=app_data.app_name+"/"+resources["resources"][j]["name"]+"/"
                if (resources["resources"][j].hasOwnProperty("package")) {
                    installDependies(path,resources["resources"][j]["package"],app_data.dependency)
                }
                path=path+"app"+app_data.extension
                
            }else{
                path=app_data.app_name+"/"+stackname+"/"+resources["resources"][j]["name"]+"/"
                if (resources["resources"][j].hasOwnProperty("package")) {
                    installDependies(path,resources["resources"][j]["package"],app_data.dependency)
                }
                path=path+"app"+app_data.extension
            }
        writeFile(path,code)
        }
    }     
}
export function cliModuletoConfig(input: AnyObject, modify: boolean) {
    if (!modify) {
         initializeSAM(input)
    }
    let app_types:AnyObject={}
    if( Object.keys(input["Stacks"]).length>0){
        Object.keys(input["Stacks"]).forEach(ele => {
            let stackdata:AnyObject={}
            if (input["Stacks"][ele] == "CRUDModule") {
                stackdata = modules.StackType[input["Stacks"][ele]](ele, input["StackParams"][ele])
            }
            else{
                stackdata = JSON.parse(JSON.stringify(modules.StackType[input["Stacks"][ele]]))   
            }
            Object.keys(stackdata).forEach(ele1 => {
                app_types[ele]=stackdata[ele1]
                app_types[ele]["type"]="module"
            })
        })
    }
    if( Object.keys(input["CustomStacks"]).length>0){
        Object.keys(input["CustomStacks"]).forEach(ele =>{
            let resources: AnyArray = []
            let customstackarray: AnyArray=input["CustomStacks"][ele]
            customstackarray.map(ele=>{
                let componentarray:AnyArray= JSON.parse(JSON.stringify(components.Components[ele]))
                    componentarray.map(ele => {
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
export function createStackResources(resources: AnyObject, app_data: AnyObject, StackType:string, stack_names:string, comp: AnyObject) {
    
        let res:AnyObject={}
        let resourceobject:AnyObject=resources["resources"]
        resourceobject.forEach(function(element:AnyObject) {
            element.config["Description"]=`Rover-tools created ${element.name}  named ${element.type} resource`
            if(config.samabstract.includes(element.type)){
                element.config["Tags"]={}
                element.config["Tags"]["createdBy"]="rover"
                element.config["Tags"]["applicationName"]=app_data.app_name
            }else{
                element.config["Tags"]=[]
                element.config["Tags"].push({"Key":"createdBy","Value":"rover"})
                element.config["Tags"].push({"Key":"applicationName","Value":app_data.app_name})
            }
     
        });
    
    for(let j in  resources["resources"]){ 
        if(stack_names==undefined){
                let randomstr:string=(crypto.randomBytes(1).toString("base64url").replace(/\d/g, 'd')).toLowerCase();
                resources["resources"][j]["name"]=resources["resources"][j]["name"]+randomstr
        }
        let configs=resources["resources"][j]["config"]
        let logic=resources["resources"][j]["logic"]
        
        if(config.AWSResources[resources["resources"][j]["type"]].hasOwnProperty("name")){
            let name=(resources["resources"][j]["name"]).replace(" ","")
            name=name.replace(/[^a-z0-9]/gi, '');
            configs[config.AWSResources[resources["resources"][j]["type"]]["name"]]=name
        }
        if(resources["resources"][j]["type"]=="lambda"){ 
            let path:string=""
            let path2:string=""
            let lambda_stack_names=stack_names
            if (stack_names==undefined) {
                if (comp.demo_desti!==undefined) {
                    path=pwd+comp.demo_desti+"/"+"lambda_demo"+"/ "
                path2=pwd+app_data.app_name+"/"+resources["resources"][j]["name"]+"/"
                    
                }
                if (comp.desti!==undefined) {
                    path=pwd+comp.demo_desti+"/"+"lambda_demo"+"/ "
                    path2=pwd+comp.desti+"/"+resources["resources"][j]["name"]+"/"
                    lambda_stack_names=(comp.desti.split("/")[1]).replace("_Stack","")
                }
            }else{
                path=pwd+app_data.app_name+"/"+"lambda_demo"+"/ "
                path2=pwd+app_data.app_name+"/"+stack_names+"/"+resources["resources"][j]["name"]+"/"
            }
            copyLambdaLogic(path,path2)
            generateLambdafiles(logic,app_data,resources,StackType,lambda_stack_names,j)
            testsetup(path2,app_data.dependency,app_data.app_name)
            configs["CodeUri"]=resources["resources"][j]["name"]+"/"
            configs["Runtime"]=app_data.language
        }else if(resources["resources"][j]["type"]=="apigateway"){
            let path
            let configpath
            let filepath
           
            
            if (stack_names==undefined) {
                
                if (comp.desti!==undefined) {
                    path=pwd+comp.desti+"/"+resources["resources"][j]["name"]
                    configpath=resources["resources"][j]["name"]+"/swagger.yaml"
                    filepath=comp.desti+"/"+resources["resources"][j]["name"]+"/swagger.yaml"
                }
            }else{
                path=pwd+app_data.app_name+"/"+stack_names+"/"+resources["resources"][j]["name"]
                configpath=resources["resources"][j]["name"]+"/swagger.yaml"
                filepath=app_data.app_name+"/"+stack_names+"/"+resources["resources"][j]["name"]+"/swagger.yaml"
            }
            if (fs.existsSync(path)) throw new Error(path +" file already exists");
            exec("mkdir "+path)
            configs["path"]=configpath
            configs["filepath"]=filepath
        }
        let resources1=rover_resources.resourceGeneration(resources["resources"][j]["type"],configs)
        res[resources["resources"][j]["name"]] = resources1
    }
    return res
}
export  function createStack(app_data:AnyObject,app_types:AnyObject,filename:string){
    console.log(filename)
    let stack_names:AnyArray = Object.keys(app_types)
    let resource=app_types
    let StackType = app_data.StackType
    let stackes:AnyObject = {}
    let data = {}
    for( let i=0;i< stack_names.length;i++){ 
        let stacks= rover_resources.resourceGeneration("stack",{"TemplateURL":stack_names[i]+"/template.yaml"})
        stackes[stack_names[i]]=stacks
        exec("mkdir "+pwd+app_data.app_name+"/"+stack_names[i])
            let resources=resource[stack_names[i]] 
            let comp={}
            let res=createStackResources(resources,app_data,StackType[i],stack_names[i],comp)
        let template1 = addResourceTemplate(res, Object.keys(res), {})
            if (resources.hasOwnProperty("parameter")) {

                template1["Parameters"]=resources.parameter
                
            }
            let doc = new yaml.Document();
            doc.contents = template1;
            let temp=replaceYAML(doc.toString())
            writeFile(app_data.app_name+"/"+stack_names[i]+"/template.yaml",temp)   
    }
    if (filename!=="") {
        let datas:string = fs.readFileSync(pwd + "/" + filename.trim(), { encoding: "utf-8" });
        data=Yaml.load(replaceTempTag(datas))
        if(!data.hasOwnProperty("Resources"))throw new Error("Improper SAM template file in "+filename);
    
    }
    
    let template= addResourceTemplate(stackes,stack_names,data)
    let doc = new yaml.Document();
    doc.contents = template;
    writeFile(app_data.app_name+"/template.yaml",doc.toString())
}
export  function getAppdata(input:AnyObject) { 
    let app_data:AnyObject={}
    app_data["app_name"]=input.app_name
    app_data["language"]= config.LanguageSupport[input.language]["version"]
    app_data["dependency"]=config.LanguageSupport[input.language]["dependency"]
    app_data["extension"]=config.LanguageSupport[input.language]["extension"]
    if (input["Stacks"]!==undefined){
        app_data["StackType"] = Object.values(input["Stacks"])
    }
    
    return app_data
}
export function  generateSAM(input:AnyObject){
    let app_data = getAppdata(input)
    let app_types=cliModuletoConfig(input,false)
    createStack(app_data,app_types,"")
    exec(config.ForceRemove + input.app_name + config.LambdaDemo)
    generateRoverConfig(input.app_name,input,"rover_create_project")
}
export function addComponents(input:AnyObject){

    let Data = fs.readFileSync(pwd+"/"+input.file_name.trim(), { encoding: "utf-8" });
    Data=Yaml.load(replaceTempTag(Data))
    if(Data.hasOwnProperty("Resources")){
        let res:AnyObject={}
        let app_data=getAppdata(input)
        let input2=JSON.parse(JSON.stringify(input))
        input2.app_name=input.app_name+"_test"
        initializeSAM(input2)
        if (input.nested) {
            Object.keys(input.nestedComponents).forEach(ele=>{
                let comp:AnyObject={}
                res["resources"]=getComponents(input.nestedComponents[ele]["components"])

                Data = Yaml.load(replaceTempTag(fs.readFileSync(pwd+"/"+input.app_name+"/"+input.nestedComponents[ele]["path"].trim(), { encoding: "utf-8" })));
                let path:AnyArray =(input.app_name+"/"+input.nestedComponents[ele]["path"]).split("/")
                path.pop()
                comp["desti"]=path.join("/");

                comp["demo_desti"]=input2.app_name
                let res1=createStackResources(res,app_data,"","",comp)
                res1= addResourceTemplate(res1,Object.keys(res1),Data)
                let doc = new yaml.Document();
                doc.contents = res1;
                let temp=replaceYAML(doc.toString())
                writeFile(input.app_name+"/"+input.nestedComponents[ele]["path"].trim(),temp)  
            })
            
        }else{
            let comp:AnyObject={}
            res["resources"]=getComponents(input.components)
            
            comp["demo_desti"]=input2.app_name
            let res1=createStackResources(res,app_data,"","",comp)
            res1= addResourceTemplate(res1,Object.keys(res1),Data)
            let doc = new yaml.Document();
            doc.contents = res1;
            let temp=replaceYAML(doc.toString())
            writeFile(input.file_name.trim(),temp) 
        }
        removeFolder(input2.app_name)
        generateRoverConfig(input.app_name,input ,"rover_add_component")
    }else{
        console.log("wrong template structure");
    }
    
}
export  function addModules(input:AnyObject) {
    try {
        let input2=JSON.parse(JSON.stringify(input))
    input2.app_name=input.app_name+"_test"
    initializeSAM(input2)
    exec("rm -rf " + pwd + input.app_name + "/" + "lambda_demo")
    moveFolder(pwd + input2.app_name + "/" + "lambda_demo" + " ", pwd + input.app_name + "/" + "lambda_demo")
    exec("rm -rf " + pwd + input2.app_name)

    let app_types = cliModuletoConfig(input,true)
    let app_data = getAppdata(input)
    createStack(app_data,app_types,input.file_name)
        exec("rm -rf " + pwd + input.app_name + "/" + "lambda_demo")
        generateRoverConfig(input.app_name,input ,"rover_add_module")
    } catch (error) {
        throw new Error((error as Error).message);   
    }
}
export function getComponents(component:AnyObject){
    let resources:AnyArray=[]
    let componentstype:string
    Object.entries(component).map(ele=>{
        let componentstype:string=ele[1]
        let componentstypeobj: AnyObject = JSON.parse(JSON.stringify(components.Components[componentstype]))
        
            componentstypeobj.map(function(ele:AnyObject){
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
    let val:AnyObject ={}
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
export function NumtoAlpabet (params:number) {
    let res=""
    let modstr=""
    if(params>26) modstr=NumtoAlpabet(params%26)
    do {
    if(params>26){
        res=res+"z"
        params=Math.floor(params/26)
        res=res+NumtoAlpabet(params)
    }else{
        res=(params+9).toString(36)
    }
    }while(params>26)
    res=res+modstr
    return res.toUpperCase()

    
}
export function makeid(length:number) {
    let result           = '';
    let characters       = 'abcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        if (i==0) result=result.toUpperCase()
    }
    return result;
}

export let langValue=async function () {
  
  let pwd =(process.cwd()+"/").trim()
  if(!fs.existsSync(pwd+".aws-sam/build.toml"))exec("sam build")
  let data=fs.readFileSync(pwd+".aws-sam/build.toml", { encoding: "utf-8" })
  data=TOML.parse(data)
  let langarray:AnyArray=[]
  let jsresult:AnyArray=[]
  let pyresult:AnyArray=[]
  Object.keys(data).forEach(ele=>{
    Object.keys(data[ele]).forEach(obj=>{
      if(data[ele][obj].hasOwnProperty("runtime"))langarray.push(data[ele][obj]["runtime"])})
    }
    )
  langarray.forEach(ele=>{
      if (ele.match(jspattern)!==null)jsresult.push(...ele.match(jspattern))
      if (ele.match(pythonpattern)!==null)pyresult.push(...ele.match(pythonpattern))
  
  })
  if(jsresult.length>pyresult.length) return "js"
  else if(pyresult.length>jsresult.length) return "python"
  else return "js"
  
}

export let samValidate=async function(filename:string){
    try {
      let path:string
    if (filename !== "") {
        filename = pwd + filename
        path=filename+"/"
    }
    
    else {
      filename = exec("pwd").toString().replace("\n", "")
      path=""
    }
    let files:AnyArray=fs.readdirSync(filename)
    let yamlfiles:AnyArray=[]
    let response:AnyArray=[]
    files.map(ele => { if (ele.match(yamlpattern) !== null) yamlfiles.push(path+ele) })
    yamlfiles.map(ele=>{
      let data=fs.readFileSync(ele,{ encoding: "utf-8" })
      data=Yaml.load(replaceTempTag(data))
      if(data.hasOwnProperty("AWSTemplateFormatVersion")
      &&data.hasOwnProperty("Transform")
      &&data.hasOwnProperty("Description")
      &&data.hasOwnProperty("Resources")){response.push(true)
    }
    })
    if (!response.includes(true)) {
      throw new Error("SAM Template error \n")
    }
    } catch (error) {
        let errormessage=(error as Error).message
    throw new Error("Not a SAM file or "+errormessage)
  }
  
}

export let generateRoverConfig = function (filename:string, data:AnyObject, type:string) { 
    let response: AnyObject = {}
    if (filename === "") filename = (pwd.split("/"))[pwd.split("/").length - 1]
    let originalfilename=filename
    filename = filename + "/roverconfig.json"
    if (fs.existsSync(pwd + filename)) {
        let filedata = fs.readFileSync(pwd + filename, { encoding: "utf-8" })
        let dataobject = JSON.parse(filedata)
        let types=Object.keys(dataobject)
        let typesarray=[types.includes("rover_add_module"),types.includes("rover_add_component"),types.includes("rover_create_project"),types.includes("rover_deploy_cli"),types.includes("rover_generate_pipeline"),types.includes("rover_deploy_repo")]
        if (!typesarray.includes(true)) {
            console.log(`improper rover config file (to fix ,delete roverconfig.json in ${pwd+filename} )`)
            return 0
        }
        if (!dataobject.hasOwnProperty(type))  dataobject[type] = []
        if( dataobject.app_name==data.app_name)delete data.app_name
        if( dataobject.language==data.language)delete data.language
        dataobject[type].push(data)
        data=dataobject
    } else { 
        if(!fs.existsSync(pwd + originalfilename)) throw new Error(`Wrong file path ${pwd+originalfilename} `);
        response["app_name"]=data.app_name
        response["language"]=data.language
        delete data.app_name
        delete data.language
        response[type] = []
        response[type].push(data)
        data=response
    }
    writeFile(filename,JSON.stringify(data))
}