

export const generatelambda=(name,config)=>{
  return {
    "name":name+"Function",
    "type":"lambda",
    "config":{
        
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
      },
    "logic":true
  }

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
    "crud_api":[
    {
      "name":"crudRoles",
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
               "Resource":[ { "Fn::Sub":"arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/UserTable"},
               { "Fn::Sub":"arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/UserTable/index/*"}
]
           }
       ]
          
      },
      "logic":false
    },
    {
    "name":"EmailAuthAPIs",
    "type":"apigateway",
    "config":{
      "StageName":"dev",
      "objects":[
        {
          "name":"Users",
          "methods":["get","put","delete"],
          "resource":"Users",
          "role":"crudRoles",
          "path":"/users",
          "resourcetype":"lambda"
        }
        ]
        
       
      },
    "logic":false
    },
    {
      "name":"Users",
      "type":"lambda",
      "config":{
          "Role":  {"Fn::GetAtt": [ "crudRoles","Arn"]},
          "Environment": {
              "Variables": {
                "UserPoolID": { "Ref" : "AuthUserPools"},
                "UserPoolClientID": { "Ref" : "AuthUserPoolsClient"},
                "userinfoTable": { "Ref" : "UserTable"}
              }
          },
          "Policies": [
            "AWSLambdaDynamoDBExecutionRole",
            {
              "DynamoDBCrudPolicy": {
                "TableName": { "Ref" : "UserTable"},
                
              }
            }
          ]
        },
      "logic":true
    },
    {
      "name":"UserTable",
      "type":"dynamoDB",
      "config":{
          "BillingMode": "PAY_PER_REQUEST",
          "AttributeDefinitions": [
            {
              "AttributeName": "email",
              "AttributeType": "S"
            }
          ],
          "KeySchema": [
            {
              "AttributeName": "email",
              "KeyType": "HASH"
            }
          ]
        },
      "logic":false
    },
    ],
   
}
export let ModuleDescription={
  "s3_lambda":"lambda with S3 as trigger",
 
}