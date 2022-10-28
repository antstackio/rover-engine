import * as config  from "../utlities/config"
import { AnyObject } from "immer/dist/internal"
import * as components from "./components"
const vpcip:string = config.vpcip
const subnet1cidr=config.subnet1cidr
const subnet2cidr=config.subnet2cidr
const subnet6cidr=config.subnet6cidr
const subnet4cidr=config.subnet4cidr
const subnet3cidr=config.subnet3cidr
const subnet5cidr=config.subnet5cidr
export const generaterds= (name:string,config:AnyObject)=>{
  return {
    "RDS":{
      "parameter":{
        
            "Environment": {
                "Type": "String",
                "Description": "Provides the data base url",
                "Default": "DEV"
            },
            "DBUserName": {
                "Type": "String",
                "Description": "Provides the data base user name",
                "Default": "DEVDGB"
            },
            "DBUserPassword": {
                "Type": "String",
                "Description": "Provides the data base password",
                "Default": "DEVDGB1234"
            },
            "DBName": {
                "Type": "String",
                "Description": "Provides the data base name",
                "Default": "DEVDGB"
            },
            "VpcCIDR": {
                "Description": "Please enter the IP range (CIDR notation) for this VPC",
                "Type": "String",
                "Default": vpcip
            },
            "PublicSubnet1CIDR": {
                "Description": "Please enter the IP range (CIDR notation) for the public subnet in the first Availability Zone",
                "Type": "String",
                "Default": subnet1cidr
            },
            "PublicSubnet2CIDR": {
                "Description": "Please enter the IP range (CIDR notation) for the public subnet in the second Availability Zone",
                "Type": "String",
                "Default": subnet2cidr
            },
            "PublicSubnet3CIDR": {
                "Description": "Please enter the IP range (CIDR notation) for the public subnet in the second Availability Zone",
                "Type": "String",
                "Default": subnet3cidr
            },
            "PrivateSubnet1CIDR": {
                "Description": "Please enter the IP range (CIDR notation) for the private subnet in the first Availability Zone",
                "Type": "String",
                "Default": subnet4cidr
            },
            "PrivateSubnet2CIDR": {
                "Description": "Please enter the IP range (CIDR notation) for the private subnet in the second Availability Zone",
                "Type": "String",
                "Default": subnet5cidr
            },
            "PrivateSubnet3CIDR": {
                "Description": "Please enter the IP range (CIDR notation) for the private subnet in the second Availability Zone",
                "Type": "String",
                "Default": subnet6cidr
            }
        
    },
      "resources":[
        {
          "name": "VPC",
          "type": "vpc",
          "config": {
            "CidrBlock": {
              "Ref": "VpcCIDR"
            },
            "EnableDnsSupport": true,
            "EnableDnsHostnames": true,
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-VPC-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "InternetGateway",
          "type": "internetgateway",
          "config": {
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-Gateway-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "InternetGatewayAttachment",
          "type": "vpcgatewayattachment",
          "config": {
            "InternetGatewayId": {
              "Ref": "InternetGateway"
            },
            "VpcId": {
              "Ref": "VPC"
            }
          }
        },
        {
          "name": "PublicSubnet1",
          "type": "subnet",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "AvailabilityZone": {
              "Fn::Select": [0, {"Fn::GetAZs": ""}]
            },
            "CidrBlock": {
              "Ref": "PublicSubnet1CIDR"
            },
            "MapPublicIpOnLaunch": true,
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-public-subnet-1-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PublicSubnet2",
          "type": "subnet",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "AvailabilityZone": {
              "Fn::Select": [1, {"Fn::GetAZs": ""}]
            },
            "CidrBlock": {
              "Ref": "PublicSubnet2CIDR"
            },
            "MapPublicIpOnLaunch": true,
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-public-subnet-2-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PublicSubnet3",
          "type": "subnet",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "AvailabilityZone": {
              "Fn::Select": [2, {"Fn::GetAZs": ""}]
            },
            "CidrBlock": {
              "Ref": "PublicSubnet3CIDR"
            },
            "MapPublicIpOnLaunch": true,
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-public-subnet-3-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PrivateSubnet1",
          "type": "subnet",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "AvailabilityZone": {
              "Fn::Select": [0, {"Fn::GetAZs": ""}]
            },
            "CidrBlock": {
              "Ref": "PrivateSubnet1CIDR"
            },
            "MapPublicIpOnLaunch": false,
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-private-subnet-1-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PrivateSubnet2",
          "type": "subnet",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "AvailabilityZone": {
              "Fn::Select": [1, {"Fn::GetAZs": ""}]
            },
            "CidrBlock": {
              "Ref": "PrivateSubnet2CIDR"
            },
            "MapPublicIpOnLaunch": false,
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-private-subnet-2-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PrivateSubnet3",
          "type": "subnet",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "AvailabilityZone": {
              "Fn::Select": [2, {"Fn::GetAZs": ""}]
            },
            "CidrBlock": {
              "Ref": "PrivateSubnet3CIDR"
            },
            "MapPublicIpOnLaunch": false,
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-private-subnet-1-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PublicRouteTable1",
          "type": "routetable",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-PublicRouteTable1-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PublicRouteTable2",
          "type": "routetable",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-PublicRouteTable2-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PublicRouteTable3",
          "type": "routetable",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-PublicRouteTable3-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PublicRoute1",
          "type": "route",
          "config": {
            "RouteTableId": {
              "Ref": "PublicRouteTable1"
            },
            "DestinationCidrBlock": "0.0.0.0/0",
            "GatewayId": {
              "Ref": "InternetGateway"
            }
          }
        },
        {
          "name": "PublicRoute2",
          "type": "route",
          "config": {
            "RouteTableId": {
              "Ref": "PublicRouteTable2"
            },
            "DestinationCidrBlock": "0.0.0.0/0",
            "GatewayId": {
              "Ref": "InternetGateway"
            }
          }
        },
        {
          "name": "PublicRoute3",
          "type": "route",
          "config": {
            "RouteTableId": {
              "Ref": "PublicRouteTable3"
            },
            "DestinationCidrBlock": "0.0.0.0/0",
            "GatewayId": {
              "Ref": "InternetGateway"
            }
          }
        },
        {
          "name": "PublicSubnet1RouteTableAssociation",
          "type": "subnetroutetableassociation",
          "config": {
            "RouteTableId": {
              "Ref": "PublicRouteTable1"
            },
            "SubnetId": {
              "Ref": "PublicSubnet1"
            }
          }
        },
        {
          "name": "PublicSubnet2RouteTableAssociation",
          "type": "subnetroutetableassociation",
          "config": {
            "RouteTableId": {
              "Ref": "PublicRouteTable2"
            },
            "SubnetId": {
              "Ref": "PublicSubnet2"
            }
          }
        },
        {
          "name": "PublicSubnet3RouteTableAssociation",
          "type": "subnetroutetableassociation",
          "config": {
            "RouteTableId": {
              "Ref": "PublicRouteTable3"
            },
            "SubnetId": {
              "Ref": "PublicSubnet3"
            }
          }
        },
        {
          "name": "PrivateRouteTable1",
          "type": "routetable",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-PrivateRouteTable1-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PrivateRouteTable2",
          "type": "routetable",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-PrivateRouteTable2-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PrivateRouteTable3",
          "type": "routetable",
          "config": {
            "VpcId": {
              "Ref": "VPC"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-PrivateRouteTable3-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PrivateSubnet1RouteTableAssociation",
          "type": "subnetroutetableassociation",
          "config": {
            "RouteTableId": {
              "Ref": "PrivateRouteTable1"
            },
            "SubnetId": {
              "Ref": "PrivateSubnet1"
            }
          }
        },
        {
          "name": "PrivateSubnet2RouteTableAssociation",
          "type": "subnetroutetableassociation",
          "config": {
            "RouteTableId": {
              "Ref": "PrivateRouteTable2"
            },
            "SubnetId": {
              "Ref": "PrivateSubnet2"
            }
          }
        },
        {
          "name": "PrivateSubnet3RouteTableAssociation",
          "type": "subnetroutetableassociation",
          "config": {
            "RouteTableId": {
              "Ref": "PrivateRouteTable3"
            },
            "SubnetId": {
              "Ref": "PrivateSubnet3"
            }
          }
        },
        {
          "name": "EIP1",
          "type": "eip",
          "config": {
            "Domain": "vpc",
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-ElasticIP1-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "EIP2",
          "type": "eip",
          "config": {
            "Domain": "vpc",
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-ElasticIP2-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "EIP3",
          "type": "eip",
          "config": {
            "Domain": "vpc",
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-ElasticIP3-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "NatGateway1",
          "type": "natgateway",
          "config": {
            "AllocationId": {
              "Fn::GetAtt": ["EIP1","AllocationId"]
            },
            "SubnetId": {
              "Ref": "PublicSubnet1"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-NatGateway1-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "NatGateway2",
          "type": "natgateway",
          "config": {
            "AllocationId": {
              "Fn::GetAtt": ["EIP2","AllocationId"]
            },
            "SubnetId": {
              "Ref": "PublicSubnet2"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-NatGateway2-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "NatGateway3",
          "type": "natgateway",
          "config": {
            "AllocationId": {
              "Fn::GetAtt": ["EIP3","AllocationId"]
            },
            "SubnetId": {
              "Ref": "PublicSubnet3"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-NatGateway3-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "PrivateRoute1",
          "type": "route",
          "config": {
            "RouteTableId": {
              "Ref": "PrivateRouteTable1"
            },
            "DestinationCidrBlock": "0.0.0.0/0",
            "NatGatewayId": {
              "Ref": "NatGateway1"
            }
          }
        },
        {
          "name": "PrivateRoute2",
          "type": "route",
          "config": {
            "RouteTableId": {
              "Ref": "PrivateRouteTable2"
            },
            "DestinationCidrBlock": "0.0.0.0/0",
            "NatGatewayId": {
              "Ref": "NatGateway2"
            }
          }
        },
        {
          "name": "PrivateRoute3",
          "type": "route",
          "config": {
            "RouteTableId": {
              "Ref": "PrivateRouteTable3"
            },
            "DestinationCidrBlock": "0.0.0.0/0",
            "NatGatewayId": {
              "Ref": "NatGateway3"
            }
          }
        },
        {
          "name": "LambdaSecurityGroup",
          "type": "securitygroup",
          "config": {
            "GroupDescription": "Security group for NAT Gateway Lambda",
            "VpcId": {
              "Ref": "VPC"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-Lambda-Securitygroup-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "RDSSecurityGroup",
          "type": "securitygroup",
          "config": {
            "GroupDescription": "Allow http and https to client host",
            "VpcId": {
              "Ref": "VPC"
            },
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-RDS-Securitygroup-${Environment}"
                }
              }
            ],
            "SecurityGroupIngress": [
              {
                "IpProtocol": "tcp",
                "FromPort": 5432,
                "ToPort": 5432,
                "SourceSecurityGroupId": {
                  "Ref": "LambdaSecurityGroup"
                }
              }
            ],
            "SecurityGroupEgress": [
              {
                "IpProtocol": "tcp",
                "FromPort": 5432,
                "ToPort": 5432,
                "CidrIp": "0.0.0.0/0"
              }
            ]
          }
        },
        {
          "name": "RDSSubnetGroup",
          "type": "dbsubnetgroup",
          "config": {
            "DBSubnetGroupDescription": "Subnet group for aurora data base",
            "SubnetIds": [
              {
                "Ref": "PrivateSubnet1"
              },
              {
                "Ref": "PrivateSubnet2"
              },
              {
                "Ref": "PrivateSubnet3"
              }
            ],
            "Tags": [
              {
                "Key": "Name",
                "Value": {
                  "Fn::Sub": "HRMS-RDS-Subnetgroup-${Environment}"
                }
              }
            ]
          }
        },
        {
          "name": "RDSCluster",
          "type": "dbcluster",
          "config": {
            "DBClusterIdentifier": {
              "Ref": "DBUserName"
            },
            "MasterUsername": {
              "Ref": "DBUserName"
            },
            "MasterUserPassword": {
              "Ref": "DBUserPassword"
            },
            "DatabaseName": {
              "Ref": "DBName"
            },
            "Engine": "aurora-postgresql",
            "EngineMode": "serverless",
            "EngineVersion": "10",
            "EnableHttpEndpoint": true,
            "ScalingConfiguration": {
              "AutoPause": false,
              "MaxCapacity": 2,
              "MinCapacity": 2
            },
            "DBSubnetGroupName": {
              "Ref": "RDSSubnetGroup"
            },
            "VpcSecurityGroupIds": [
              {
                "Ref": "RDSSecurityGroup"
              }
            ]
          }
        },
        {
          "name":"user",
          "type":"lambda",
          "config":{
            "Environment":components.generateLambdaEnv( {"Secret":  "usersecret","Clustername":  "RDSCluster","Region":  '"AWS::Region"',"Accountid":   "AWS::AccountId"}),
              "Policies": [
                "AWSLambdaBasicExecutionRole",
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Sid": "RDSDataServiceAccess",
                            "Effect": "Allow",
                            "Action": [
                                "rds-data:BatchExecuteStatement",
                                "rds-data:BeginTransaction",
                                "rds-data:CommitTransaction",
                                "rds-data:ExecuteStatement",
                                "rds-data:RollbackTransaction"
                            ],
                            "Resource": "*"
                        },
                        {
                            "Sid": "SecretsManagerDbCredentialsAccess",
                            "Effect": "Allow",
                            "Action": [
                                "secretsmanager:GetSecretValue"
                            ],
                            "Resource": "*"
                        },
                        {
                            "Sid": "SecretsManagerDbCredentialsAccess2",
                            "Effect": "Allow",
                            "Action": [
                                "secretsmanager:GetSecretValue"
                            ],
                            "Resource": "*"
                        },
                        {
                            "Sid": "RDSDataServiceAccess2",
                            "Effect": "Allow",
                            "Action": [
                                "rds-data:*"
                            ],
                            "Resource": "*"
                        }
                    ]
                }
            ],
            "VpcConfig": {
              "SecurityGroupIds": [
                { "Ref" :"LambdaSecurityGroup"}
              ],
              "SubnetIds": [
                { "Ref" :"PrivateSubnet1"},
                { "Ref" : "PrivateSubnet2"},
                { "Ref" :  "PrivateSubnet3"}
              ]
          }
               
          
          },
          "package":["typeorm","typeorm-aurora-data-api-driver"],
          "logic":true,
          "logicpath":"rdstable",
        },
        {
          "name":"usersecret",
          "type":"secret",
          "config":{
            "SecretString":{ "Fn::Sub":"{'database':${DBName},'username':${DBUserName},'password':${DBUserPassword}}"} 
          },
        
        }

      ], 
    }
  }
}
export const generateLambdaconfig =(env,policy,role)=>{
  let response:AnyObject={}
  if (env!==undefined)response["Environment"]=env
  if (env!==undefined)response["Policies"]=policy
  if (env!==undefined)response["Role"]=role
  return response

}
export const generateEmailauth=()=>{
  let response:AnyObject={}
  let tableaccesspolicy=[
      "AWSLambdaDynamoDBExecutionRole",
      {
        "DynamoDBCrudPolicy": {
          "TableName": { "Ref" : "UserTable"}
        }
      }
    ]
  let lambdauserenv=components.generateLambdaEnv({"UserPoolID": "AuthUserPools","UserPoolClientID": "AuthUserPoolsClient","userinfoTable":"UserTable"})
  let lambdatabenv=components.generateLambdaEnv({"userinfoTable":"UserTable"})
  let signupiam={"Fn::GetAtt": [ "SignUpRoles","Arn"]}
  let lambdaconfigtab= generateLambdaconfig(lambdatabenv,tableaccesspolicy,undefined)
  let lambdaconfiguser=generateLambdaconfig(lambdauserenv,tableaccesspolicy,signupiam)
  response={
    "EmailAuthModule":{
        "resources":[
            components.generateRoverResource("DefineAuthChallenge","lambda",lambdaconfigtab,true),  
            components.generateRoverResource("AuthorizerFunction","lambda",generateLambdaconfig(lambdauserenv,tableaccesspolicy,undefined),true),
            components.generateRoverResource("CreateAuthChallenge","lambda",
              {
                "Environment":components.generateLambdaEnv({"SES_FROM_ADDRESS":  "VerifyAuthChallengeResponse"}),
                "Policies": [
                  {
                    "Version": "2012-10-17",
                    "Statement": [
                      {
                        "Effect": "Allow",
                        "Action": [
                          "ses:SendEmail"
                        ],
                        "Resource": "*"
                      }
                    ]
                  }
                ]
              },
              true
            ),
            components.generateRoverResource("VerifyAuthChallengeResponse","lambda",lambdaconfigtab,true),
            components.generateRoverResource("PreSignUp","lambda",lambdaconfigtab,true),
            components.generateRoverResource("SignUpFunctions","lambda",lambdaconfiguser,true),
            components.generateRoverResource("ResendCode","lambda",lambdaconfiguser,true),
            components.generateRoverResource("ConfirmForgotPassword","lambda",lambdaconfiguser,true),
            components.generateRoverResource("ForgotPassword","lambda",lambdaconfiguser,true),
            components.generateRoverResource("ConfirmUser","lambda",lambdaconfiguser,true),
            components.generateRoverResource("Users","lambda",lambdaconfiguser,true),
            components.generateRoverResource("UserTable","dynamoDB",
              {
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
              false
            ),
            components.generateRoverResource("CreateAuthChallengeInvocationPermission",
                "lambdaPermission",
               {
                   
                  "Action": "lambda:InvokeFunction",
                  "FunctionName":  {"Fn::GetAtt": [ "CreateAuthChallenge","Arn"]},
                  "Principal": "cognito-idp.amazonaws.com",
                  "SourceArn":  {"Fn::GetAtt": [ "AuthUserPools","Arn"]}
                },
                false
            ),
            components.generateRoverResource("DefineAuthChallengeInvocationPermission",
              "lambdaPermission",
             {
                "Action": "lambda:InvokeFunction",
                "FunctionName":  {"Fn::GetAtt": [ "DefineAuthChallenge","Arn"]},
                "Principal": "cognito-idp.amazonaws.com",
                "SourceArn":  {"Fn::GetAtt": [ "AuthUserPools","Arn"]}
              },
              false
            ),
            components.generateRoverResource("VerifyAuthChallengeResponseInvocationPermission",
            "lambdaPermission",
           {
              "Action": "lambda:InvokeFunction",
              "FunctionName":  {"Fn::GetAtt": [ "VerifyAuthChallengeResponse","Arn"]},
              "Principal": "cognito-idp.amazonaws.com",
              "SourceArn":  {"Fn::GetAtt": [ "AuthUserPools","Arn"]}
            },
            false
            ),
            components.generateRoverResource("SignUpInvocationPermission",
            "lambdaPermission",
            {
                  "Principal": "cognito-idp.amazonaws.com",
                  "Action": "lambda:InvokeFunction",
                  "FunctionName": {"Fn::GetAtt": ["SignUpFunctions","Arn"]},
                  "SourceArn":  {"Fn::GetAtt": [ "AuthUserPools","Arn"]}
              },
            false
            ),
            components.generateRoverResource("PreSignUpInvocationPermission",
        "lambdaPermission",
       {
          "Action": "lambda:InvokeFunction",
          "FunctionName":  {"Fn::GetAtt": [ "PreSignUp","Arn"]},
          "Principal": "cognito-idp.amazonaws.com",
          "SourceArn":  {"Fn::GetAtt": [ "AuthUserPools","Arn"]}
        },
        false
            ),
            components.generateRoverResource("AuthUserPools",
                "cognitoUserPool",
               {
                    UserPoolName: "Auth-User-Pool",
                    MfaConfiguration: "OFF",
                    AutoVerifiedAttributes:[
                      "email"
                    ],
                    EmailVerificationSubject: "Your verification code",
                    EmailVerificationMessage: "Your verification code is {####}",
                    EmailConfiguration:{EmailSendingAccount: "COGNITO_DEFAULT"},
                    UsernameAttributes: [
                      "email"
                    ],
                    Schema: [
                      {
                        "Name": "name",
                        "AttributeDataType": "String",
                        "Mutable": true,
                        "Required": true
                      },
                      {
                        "Name": "email",
                        "AttributeDataType": "String",
                        "Mutable": true,
                        "Required": true
                      }
                    ],
                    Policies: {
                      "PasswordPolicy": {
                        "MinimumLength": 8,
                        "RequireUppercase": true,
                        "RequireLowercase": true,
                        "RequireNumbers": true,
                        "RequireSymbols": true
                      }
                    },
                    LambdaConfig: {
                      "CreateAuthChallenge":          {"Fn::GetAtt": [ "CreateAuthChallenge","Arn"]},
                      "DefineAuthChallenge":          {"Fn::GetAtt": [ "DefineAuthChallenge","Arn"]},
                      "PreSignUp":                    {"Fn::GetAtt": [ "PreSignUp","Arn"]},
                      "VerifyAuthChallengeResponse":  {"Fn::GetAtt": [ "VerifyAuthChallengeResponse","Arn"]},
                      
                    }
                  },
                false
            ),
            components.generateRoverResource("AuthUserPoolsClient",
                "userPoolClient",
               {
                    "UserPoolId": { "Ref" : "AuthUserPools"},
                    "ClientName": "email-auth-client",
                    "GenerateSecret": false,
                    
                    "ExplicitAuthFlows": [
                      "CUSTOM_AUTH_FLOW_ONLY"
                    ]
                    
                  },
                false
            ),
            components.generateRoverResource("SignUpRoles",
                "iamrole",
               {
                 "iamservice":["lambda.amazonaws.com","apigateway.amazonaws.com"],
                 "managedarn":["AWSLambdaBasicExecutionRole","AmazonAPIGatewayPushToCloudWatchLogs"],
                 "Path": "/",
                 "Policies":[
                     {  "name":"lambdainvoke",
                         "Action": "lambda:InvokeFunction",
                         "Resource": { "Fn::Sub":"arn:aws:lambda:*:${AWS::AccountId}:function:*"}
                     },
                     {  "name":"cognito",
                         "Action": "cognito-idp:ListUsers",
                         "Resource": { "Fn::Sub":"arn:aws:cognito-idp:*:${AWS::AccountId}:userpool/*"}
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
                         { "Fn::Sub":"arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/UserTable/index/*"} ]
                     }
                 ]
                },
                false
            ),
            components.generateRoverResource("AllowSetUserAttributes",
              "iampolicy",
             {
                  
                  "Statement":[
                      {
                          "Action": "cognito-idp:AdminUpdateUserAttributes",
                          "Resource":   {"Fn::GetAtt": [ "AuthUserPools","Arn"]},
                          "Effect": "Allow"
                      }
                 
                  ],
                  "Roles": [{"Ref" : "SignUpRoles"}],
                  "PolicyName": "AllowSetUserAttributespolicy"
              },
              false
            ),
            components.generateRoverResource("EmailAuthAPIs",
              "apigateway",
                  {
                "StageName":"dev",
                  "objects":components.generateAPIGatewayObject(
                    [
                        ["SignUpFunctions",["post"],"SignUpFunctions","SignUpRoles","/signup","lambda"],
                        ["SignIn",["post"],"SignUpFunctions","SignUpRoles","/signin","lambda"],  
                        ["ConfirmUser",["post"],"ConfirmUser","SignUpRoles","/confirmuser","lambda"  ],  
                        ["ResendCode",["post"],"ResendCode","SignUpRoles","/resendcode","lambda"  ],  
                        ["ConfirmForgotPassword",["post"],"ConfirmForgotPassword","SignUpRoles","/confirmforgotPassword","lambda"  ],  
                        ["ForgotPassword",["post"],"ForgotPassword","SignUpRoles","/forgotpassword","lambda"  ],  
                        ["Users",["get","put","delete"],"Users","SignUpRoles","/users","lambda"  ]
                    ]),
                  "security":{
                    api_key:{
                      "apikeyName":"user_apikey",
                      "type":"apiKey",
                      "name": "x-api-key",
                      "in": "header",
                  },
                    authorizer:{
                      "authorizerName":"user_authorizer",
                      "type":"oauth2",
                      "x-amazon-apigateway-authorizer": {
                        "type": "jwt",
                        "jwtConfiguration": {
                           "issuer": "https://cognito-idp.region.amazonaws.com/UserPoolId",
                           "audience": [
                             "audience1",
                             "audience2"
                           ]
                         },
                         "identitySource": "$request.header.Authorization"
                    }}
                  }
                 
                  },
              false
            ),
            components.generateRoverResource("ClientApiKey",
                "apikey",
                {
                  "DependsOn":["EmailAuthAPIs","EmailAuthAPIsdevStage"],
                  "Enabled": true,
                  "StageKeys": [
                    {
                      "RestApiId": {"Ref":  "EmailAuthAPIs"},
                      "StageName": "dev"
                    },
                  ],
                  
                }
              ,false
            ),
            components.generateRoverResource("ClientOrderUsagePlan",
                 "usageplan",
                {
                  "DependsOn":["ClientApiKey"],
                  "ApiStages": [
                    {
                      "ApiId": {"Ref" :"EmailAuthAPIs"},
                      "Stage": "dev"
                    }
                  ],
                  "Description": "Client Orders's usage plan",
                  "Throttle": {
                    "BurstLimit": 5,
                    "RateLimit": 5
                  }
                }
                ,false
            ),
            components.generateRoverResource("ClientOrderUsagePlanKey",
               "usageplankey",
              {
                "DependsOn":["ClientOrderUsagePlan"],
                "KeyId": {"Ref" :"ClientApiKey"},
                "KeyType": "API_KEY",
                "UsagePlanId": {"Ref" :"ClientOrderUsagePlan"}
              }
              ,false
            ),
            components.generateRoverResource("CognitoAuthorizer",
                 "apiauthorizer",
                {
                  "IdentitySource": "method.request.header.authorization",
                  "Name": "CognitoAuthorizer",
                  "ProviderARNs": [{"Fn::GetAtt": [ "AuthUserPools","Arn"]},],
                  "RestApiId":{"Ref" :"EmailAuthAPIs"},
                  "Type": "COGNITO_USER_POOLS"
                }
                ,false
            )
        ]
    }
  }
  return response
}
export let StackType={
    "BaseModule":{
            "lone":{
                "resources":[
                  components.generateRoverResource("lamone", "lambda",{},false),
                  components.generateRoverResource("lamtwo","lambda",{},false)
                ],
            },
            "ltwo":{
                "resources":[
                  components.generateRoverResource("lamthree","lambda",{},false),
                  components.generateRoverResource("lamfour","lambda",{},false)
            ],
            }
    },
    "TestModule":{
      "test":{
          "resources":[
              components.generateRoverResource("PostSignup","lambda",
              {
                "Environment":components.generateLambdaEnv({"userinfoTable":"UserTable"}),
                "Policies": [
                  "AWSLambdaDynamoDBExecutionRole",
                  {
                    "DynamoDBCrudPolicy": {
                      "TableName": { "Ref" : "UserTable"}
                    }
                  }
                ]
              },
              true
              ),
              components.generateRoverResource("S3Bucket"
                ,"s3bucket",
                {},
                false
              ),
              components.generateRoverResource("UserTable",
                  "dynamoDB",
                  {
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
                  false
              ),
              components.generateRoverResource("emailAuthPermission",
                  "lambdaPermission",
                  {
                     
                      "FunctionName": {"Fn::GetAtt": ["PostSignup","Arn"]},
                      "Principal": "cognito-idp.amazonaws.com",
                      "SourceArn": {"Fn::GetAtt": ["AuthUserPools","Arn"]}
                  },
                  false
              ),
              components.generateRoverResource("AuthUserPools",
                  "cognitoUserPool",
                 {
                      "UserPoolName": "Auth-User-Pool",
                      "AutoVerifiedAttributes": [
                          config.CognitoAutoVerifiedAttributes[0]
                      ],
                      "AliasAttributes": [
                          config.CognitoAliasAttributes[0]
                      ],
                      "Policies": {
                        "PasswordPolicy": {
                          "MinimumLength": 8,
                          "RequireUppercase": true,
                          "RequireLowercase": true,
                          "RequireNumbers": true,
                          "RequireSymbols": true
                        }
                      },
                      "Schema": [
                        {
                          "AttributeDataType": "String",
                          "Name": "email",
                          "Required": true
                        }
                      ],
                      "LambdaConfig": {
                        "PostConfirmation":  {"Fn::GetAtt": ["PostSignup","Arn"]}
                      }
                    },
                 false
              ),
              components.generateRoverResource("AuthUserPoolsClient",
                  "userPoolClient",
                  {
                      "UserPoolId": { "Ref" : "AuthUserPools"},
                      "GenerateSecret": false,
                      "SupportedIdentityProviders": [
                          config.CognitoSupportedIdentityProviders[0]
                      ],
                      "AllowedOAuthFlows": [
                          config.CognitoAllowedOAuthFlows[1]
                      ],
                      "AllowedOAuthScopes": [
                          config.CognitoAllowedOAuthScopes[0],
                          config.CognitoAllowedOAuthScopes[1],
                          config.CognitoAllowedOAuthScopes[2],
                          config.CognitoAllowedOAuthScopes[3],
                          config.CognitoAllowedOAuthScopes[4]
                      ],
                      "ExplicitAuthFlows": [
                          config.CognitoExplicitAuthFlows[2],
                          config.CognitoExplicitAuthFlows[4]
                      ],
                      "AllowedOAuthFlowsUserPoolClient": true,
                      "CallbackURLs": [
                        "https://www.google.com"
                      ]
                    },
                  false
              ),
              components.generateRoverResource("emailAuthRole",
                  "iamrole",
                  {
                      "Path": "/",
                      "Policies":[
                          {
                              "Action": "lambda:InvokeFunction",
                              "Resource": { "Fn::Sub":"arn:aws:lambda:*:${AWS::AccountId}:function:*"}
                          }
                      ]
                  },
                  false
              ),
              components.generateRoverResource("loginapi",
               "apigateway",
                {
                    
                    "objects":components.generateAPIGatewayObject([
                      ["Books",["get","post"],"PostSignup","emailAuthRole","/books","lambda"],
                      ["Authors",["get","post","put","delete"],"PostSignup","emailAuthRole","/authors","lambda"
                    ]
                  ])
                  },
                false
              ),
          ]
      }
  
    },
    "EmailAuthModule":generateEmailauth(),
    "CRUD":components.generatecrud,
    "RDS":generaterds,
    "Customizable":{}
}
export let ModuleDescription=[
  {key:"BaseModule",value:"Base Module : It’s a module with 2 stacks and 2 lambdas in each stack "},
  {key:"TestModule",value:"Test Module : Module with all AWS services supported by rover"},
  {key:"EmailAuthModule",value:"Email Auth Module : Authentication module using Cognito"},
  {key:"CRUD",value:"CRUD : CRUD APIs"},
  {key:"RDS",value:"RDS : RDS Data base"},
  {key:"Customizable",value:"Customizable : Create your own Module"}
]
export let ModuleParams={
  "BaseModule":{},
  "TestModule":{},
  "EmailAuthModule":{},
  "CRUD":{params:[{key:"name",value:"string",message:"API Name :"},{key:"path",value:"string",message:"API Path(e.g /book) :"},{key:"methods",value:"multichoice",message:"Methods required for API :"}]},
  "Customizable":{}
}