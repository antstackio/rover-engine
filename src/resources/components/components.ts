import {
  IroverResources,
  IaddComponentResource
} from "../../roverTypes/rover.types";
import {
  IcurdObject,
  ICRUDiamresource,
  TLambdaENV,
  TcrudMethods
} from "./components.types";
import { IcurdComponentObject } from "../../generateSAM/generatesam.types";
export const generateRoverResource = (
  name: string,
  type: string,
  config: Record<string, unknown>,
  logic: boolean
): IroverResources => {
  const resource = {
    name: name,
    type: type,
    config: {},
    logicpath: "",
    package: [""],
    logic: logic
  };
  if (config.length !== 0 || config !== undefined) {
    resource["config"] = config;
    if (Object.prototype.hasOwnProperty.call(config, "logicpath"))
      resource["logicpath"] = <string>config["logicpath"];
    if (Object.prototype.hasOwnProperty.call(config, "package"))
      resource["package"] = <Array<string>>config["package"];
  }
  return <IroverResources>resource;
};

export const generatecrud = (
  apiname: string,
  config: Record<string, IcurdComponentObject>
): Record<string, IaddComponentResource> => {
  const objects: Array<IcurdObject> = [];
  const functions: Array<IroverResources> = [];
  const tables: Array<IroverResources> = [];
  const iamresources: Array<ICRUDiamresource> = [];

  Object.keys(config).forEach((ele) => {
    const obj: IcurdObject = JSON.parse(JSON.stringify(config[ele]));
    obj["name"] = ele;
    obj["role"] = apiname + "Roles";
    obj["resource"] = ele + "Function";
    objects.push(obj);
    const tableaccess = {
      Environment: {
        Variables: {
          Table: { Ref: ele + "Table" }
        }
      },
      Policies: [
        "AWSLambdaDynamoDBExecutionRole",
        {
          DynamoDBCrudPolicy: {
            TableName: { Ref: ele + "Table" }
          }
        }
      ]
    };
    const lambdafunc: IroverResources = generateRoverResource(
      ele + "Function",
      "lambda",
      tableaccess,
      true
    );
    lambdafunc["logicpath"] = "crud";
    const tableconfig = {
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH"
        }
      ]
    };

    const table = generateRoverResource(
      ele + "Table",
      "dynamoDB",
      tableconfig,
      false
    );
    functions.push(lambdafunc);
    tables.push(table);
    iamresources.push(
      {
        "Fn::Sub":
          "arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/" +
          table["name"]
      },
      {
        "Fn::Sub":
          "arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/" +
          table["name"] +
          "/index/*"
      }
    );
  });
  const role = {
    name: apiname + "Roles",
    type: "iamrole",
    config: {
      iamservice: ["lambda.amazonaws.com", "apigateway.amazonaws.com"],
      managedarn: [
        "AWSLambdaBasicExecutionRole",
        "AmazonAPIGatewayPushToCloudWatchLogs"
      ],
      Path: "/",
      Policies: [
        {
          name: "lambdainvoke",
          Action: "lambda:InvokeFunction",
          Resource: {
            "Fn::Sub": "arn:aws:lambda:*:${AWS::AccountId}:function:*"
          }
        },
        {
          name: "dynamodbcrud",
          Action: [
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
          Resource: iamresources
        }
      ]
    },
    package: [""],

    logic: false,
    logicpath: ""
  };
  const apis = {
    name: apiname + "APIs",
    type: "apigateway",
    config: {
      StageName: "dev",
      objects: objects
    },
    logic: false,
    logicpath: ""
  };
  const res: Record<string, IaddComponentResource> = {};
  res[apiname] = { resources: [] };
  let resarray = res[apiname]["resources"];
  resarray.push(<IroverResources>(<unknown>role));
  resarray.push(<IroverResources>(<unknown>apis));
  resarray = resarray.concat(functions);
  resarray = resarray.concat(tables);
  res[apiname]["resources"] = resarray;

  return res;
};
export const generateLambdaEnv = (
  input: Record<string, unknown>
): TLambdaENV => {
  const response: TLambdaENV = {};
  response["Variables"] = {};
  Object.keys(input).forEach((ele) => {
    const refval: Record<string, string> = {};
    refval["Ref"] = <string>input[ele];
    response["Variables"][ele] = refval;
  });
  return response;
};
export const generateAPIGatewayObject = (
  input: Array<Array<string | Array<string>>>
): Array<IcurdObject> => {
  const response: Array<IcurdObject> = [];
  input.forEach((ele) => {
    const obj: IcurdObject = {
      name: <string>ele[0],
      methods: <Array<TcrudMethods>>(<unknown>ele[1]),
      resource: <string>ele[2],
      role: <string>ele[3],
      path: <string>ele[4],
      resourcetype: <string>ele[5]
    };
    response.push(obj);
  });
  return response;
};
const crudcomponentconfig = <Record<string, IcurdComponentObject>>{
  book: {
    path: "/book",
    methods: ["put", "get", "post", "delete", "options"],
    resourcetype: "lambda"
  }
};
const crudcomponent: Record<string, IaddComponentResource> = generatecrud(
  "Book",
  crudcomponentconfig
);

export const Components: Record<string, Array<IroverResources>> = {
  "S3 Lambda": [
    {
      name: "Lambdas",
      type: "lambda",
      config: {
        Policies: ["AWSLambdaDynamoDBExecutionRole"]
      },
      logic: true,
      logicpath: "",
      package: []
    },
    {
      name: "Bucket",
      type: "s3bucket",
      config: {
        CorsConfiguration: {
          CorsRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "POST", "DELETE"],
              AllowedOrigins: ["*"]
            }
          ]
        }
      },
      logic: false,
      logicpath: "",
      package: []
    }
  ],
  "CRUD API": crudcomponent["Book"]["resources"],
  "S3 Bucket": [generateRoverResource("Bucket", "s3bucket", {}, false)],
  Lambda: [generateRoverResource("Lambda", "lambda", {}, true)],
  DynamoDB: [generateRoverResource("Dynamodb", "dynamoDB", {}, false)]
};
export const ModuleDescription = {
  "S3 Lambda": "lambda with S3 as trigger",
  "CRUD API": "basic book CRUD API's ",
  "S3 Bucket": "Simple Storage Service Bucket ",
  Lambda: "one Lambda function",
  DynamoDB: "One DynamoDB table"
};
