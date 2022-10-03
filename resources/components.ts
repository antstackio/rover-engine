



import { AnyArray, AnyObject } from "immer/dist/internal"
import * as config  from "../utlities/config"

export const generatelambda=(name,config)=>{
  let lambda={}
  lambda["name"]=name+"Function"
  lambda["type"]="lambda"
  lambda["logic"]=true
  lambda["config"]={
        
    "Environment": {
        "Variables": {
          "Table": { "Ref" : name+"Table"}
        }
    },
    "Policies": [
      "AWSLambdaDynamoDBExecutionRole",
      {
        "DynamoDBCrudPolicy": {
          "TableName": { "Ref" : name+"Table"},
          
        }
      }
    ]
  }
  return lambda

}
export const generatetable= (name,config)=>{
  return {
    "name":name+"Table",
    "type":"dynamoDB",
    "config":{
        "BillingMode": "PAY_PER_REQUEST",
        "AttributeDefinitions": [
          {
            "AttributeName": "id",
            "AttributeType": "S"
          }
        ],
        "KeySchema": [
          {
            "AttributeName": "id",
            "KeyType": "HASH"
          }
        ]
      },
    "logic":false
  }
}
export const generatecrud= (apiname:string,config:AnyObject)=>{
  let objects:AnyArray=[]
  let functions:AnyArray=[]
  let tables:AnyArray=[]
  let iamresources:AnyArray=[]
  console.log(config)
  Object.keys(config).forEach(ele=>{
    let obj:AnyObject=JSON.parse(JSON.stringify(config[ele]))
    obj["name"]=ele
    obj["role"]=apiname+"Roles"
    obj["resource"]=ele+"Function"
    objects.push(obj)
    let lambdafunc:AnyObject=generatelambda(ele,{})
    lambdafunc["logicpath"]="crud";
   
    let table=generatetable(ele,{})
    functions.push(lambdafunc)
    tables.push(table)
    iamresources.push({ "Fn::Sub":"arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/"+table.name},
    { "Fn::Sub":"arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/"+table.name+"/index/*"})
    
}) 
let role:AnyObject={
  "name":apiname+"Roles",
  "type":"iamrole",
  "config":{
   "iamservice":["lambda.amazonaws.com","apigateway.amazonaws.com"],
   "managedarn":["AWSLambdaBasicExecutionRole","AmazonAPIGatewayPushToCloudWatchLogs"],
   "Path": "/",
   "Policies":[
       {  "name":"lambdainvoke",
           "Action": "lambda:InvokeFunction",
           "Resource": { "Fn::Sub":"arn:aws:lambda:*:${AWS::AccountId}:function:*"}
       },
       {  "name":"dynamodbcrud",
           "Action":  [
            "dynamodb:GetItem",
            "dynamodb:DeleteItem",
            "dynamodb:PutItem",
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:UpdateItem",
            "dynamodb:BatchWriteItem",
            "dynamodb:BatchGetItem",
            "dynamodb:DescribeTable",
            "dynamodb:ConditionCheckItem"
        ],
           "Resource":iamresources
       }
   ]
      
  },
  "logic":false
  }
let apis:AnyObject={
"name":apiname+"APIs",
"type":"apigateway",
"config":{
  "StageName":"dev",
  "objects":objects
  },
"logic":false
}
let res:AnyObject={}
res[apiname+"CRUDModule"]={}
res[apiname+"CRUDModule"]={"resources":[]}
let resarray=res[apiname+"CRUDModule"]["resources"]
resarray.push(role)
resarray.push(apis)
resarray=resarray.concat(functions);
resarray=resarray.concat(tables);
res[apiname+"CRUDModule"]["resources"]=resarray
  return res
}

let crudcomponentconfig={
  book: {
    path: '/book',
    methods: [ 'put', 'get', 'post', 'delete', 'options' ],
    resourcetype: 'lambda'
  }
}
let crudcomponent:object=generatecrud("Users",crudcomponentconfig)

export let Components={
    "s3_lambda":[
      {
        "name":"lambdas",
        "type":"lambda",
        "config":{
            "Policies": [
              "AWSLambdaDynamoDBExecutionRole"
            ]
          },
        "logic":true
    },
    {
      "name":"Bucket",
      "type":"s3bucket",
      "config":{
        "CorsConfiguration": {
          "CorsRules": [
              {
                  "AllowedHeaders": [
                      "*"
                  ],
                  "AllowedMethods": [
                      "GET",
                      "PUT",
                      "POST",
                      "DELETE"
                  ],
                  "AllowedOrigins": [
                      "*"
                  ]
              }
          ]
      }
      },
      
    }
    ],
    "crud_api":crudcomponent,
   
}
export let ModuleDescription={
  "s3_lambda":"lambda with S3 as trigger",
  "crud_api":"basic book CRUD API's "
 
}