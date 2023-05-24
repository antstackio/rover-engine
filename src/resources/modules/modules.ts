import * as config from "../../utlities/config";
import * as components from "../components/components";
import { RDS, BaseModule, EmailAuthModule } from "./module.json";
import { IroverResourceModule, IroverParamObjects } from "./modules.types";

export const Modules: Record<string, IroverResourceModule> = {
  BaseModule: {
    resource: BaseModule,
    params: <IroverParamObjects>{},
    description: {
      key: "BaseModule",
      value:
        "Base Module : It’s a module with 2 stacks and 2 lambdas in each stack ",
    },
  },
  TestModule: {
    resource: {
      test: {
        resources: [
          components.generateRoverResource(
            "Samplelambda",
            "lambda",
            {
              Environment: components.generateLambdaEnv({
                userinfoTable: "UserTable",
              }),
              Policies: [
                "AWSLambdaDynamoDBExecutionRole",
                {
                  DynamoDBCrudPolicy: {
                    TableName: { Ref: "UserTable" },
                  },
                },
              ],
            },
            true
          ),
          components.generateRoverResource("S3Bucket", "s3bucket", {}, false),
          components.generateRoverResource(
            "UserTable",
            "dynamoDB",
            {
              BillingMode: "PAY_PER_REQUEST",
              AttributeDefinitions: [
                {
                  AttributeName: "email",
                  AttributeType: "S",
                },
              ],
              KeySchema: [
                {
                  AttributeName: "email",
                  KeyType: "HASH",
                },
              ],
            },
            false
          ),
          components.generateRoverResource(
            "emailAuthPermission",
            "lambdaPermission",
            {
              FunctionName: { "Fn::GetAtt": ["PostSignup", "Arn"] },
              Principal: "cognito-idp.amazonaws.com",
              SourceArn: { "Fn::GetAtt": ["AuthUserPools", "Arn"] },
            },
            false
          ),
          components.generateRoverResource(
            "AuthUserPools",
            "cognitoUserPool",
            {
              UserPoolName: "Auth-User-Pool",
              AutoVerifiedAttributes: [config.CognitoAutoVerifiedAttributes[0]],
              AliasAttributes: [config.CognitoAliasAttributes[0]],
              Policies: {
                PasswordPolicy: {
                  MinimumLength: 8,
                  RequireUppercase: true,
                  RequireLowercase: true,
                  RequireNumbers: true,
                  RequireSymbols: true,
                },
              },
              Schema: [
                {
                  AttributeDataType: "String",
                  Name: "email",
                  Required: true,
                },
              ],
              LambdaConfig: {
                PostConfirmation: { "Fn::GetAtt": ["PostSignup", "Arn"] },
              },
            },
            false
          ),
          components.generateRoverResource(
            "AuthUserPoolsClient",
            "userPoolClient",
            {
              UserPoolId: { Ref: "AuthUserPools" },
              GenerateSecret: false,
              SupportedIdentityProviders: [
                config.CognitoSupportedIdentityProviders[0],
              ],
              AllowedOAuthFlows: [config.CognitoAllowedOAuthFlows[1]],
              AllowedOAuthScopes: [
                config.CognitoAllowedOAuthScopes[0],
                config.CognitoAllowedOAuthScopes[1],
                config.CognitoAllowedOAuthScopes[2],
                config.CognitoAllowedOAuthScopes[3],
                config.CognitoAllowedOAuthScopes[4],
              ],
              ExplicitAuthFlows: [
                config.CognitoExplicitAuthFlows[2],
                config.CognitoExplicitAuthFlows[4],
              ],
              AllowedOAuthFlowsUserPoolClient: true,
              CallbackURLs: ["https://www.google.com"],
            },
            false
          ),
          components.generateRoverResource(
            "emailAuthRole",
            "iamrole",
            {
              Path: "/",
              Policies: [
                {
                  name: "Authpolicy",
                  Action: "lambda:InvokeFunction",
                  Resource: {
                    "Fn::Sub": "arn:aws:lambda:*:${AWS::AccountId}:function:*",
                  },
                },
              ],
            },
            false
          ),
          components.generateRoverResource(
            "loginapi",
            "apigateway",
            {
              StageName: "dev",
              objects: components.generateAPIGatewayObject([
                [
                  "Books",
                  ["get", "post"],
                  "PostSignup",
                  "emailAuthRole",
                  "/books",
                  "lambda",
                ],
                [
                  "Authors",
                  ["get", "post", "put", "delete"],
                  "PostSignup",
                  "emailAuthRole",
                  "/authors",
                  "lambda",
                ],
              ]),
            },
            false
          ),
        ],
      },
    },
    params: <IroverParamObjects>{},
    description: {
      key: "TestModule",
      value: "Test Module : Module with all AWS services supported by rover",
    },
  },
  EmailAuthModule: {
    resource: EmailAuthModule,
    params: <IroverParamObjects>{},
    description: {
      key: "EmailAuthModule",
      value: "Email Auth Module : Authentication module using Cognito",
    },
  },
  CRUDModule: {
    resource: components.generatecrud,
    params: {
      params: [
        { key: "name", value: "string", message: "API Name :" },
        { key: "path", value: "string", message: "API Path(e.g /book) :" },
        {
          key: "methods",
          value: "multichoice",
          message: "Methods required for API :",
        },
      ],
    },
    description: { key: "CRUDModule", value: "CRUD Module : CRUD APIs" },
  },
  RDSModule: {
    resource: RDS,
    params: <IroverParamObjects>{},
    description: { key: "RDSModule", value: "RDS Module : RDS Data base" },
  },
  CustomizableModule: {
    resource: {},
    params: <IroverParamObjects>{},
    description: {
      key: "CustomizableModule",
      value: "Customizable Module : Create your own Module",
    },
  },
};
