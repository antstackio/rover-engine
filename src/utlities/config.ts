export const SkeletonConfig: Record<string, string> = {};
SkeletonConfig["template_version"] = "2010-09-09";
SkeletonConfig["sam_transform_version"] = "AWS::Serverless-2016-10-31";
import {
  IroverlangDetails,
  IroverConfigDefaultsObject,
  IroverGenerateResourceObject,
} from "../roverTypes/rover.types";
import * as child from "child_process";
const exec = child.execSync;
export const npmroot = exec(" npm root -g").toString().trim();

export const stacktype = "AWS::CloudFormation::Stack";
export const samAbstract = ["apigateway", "lambda", "stepfunction"];

export const SAMInitBase = "sam init --no-interactive ";
export const SAMLanguage = " -r ";
export const SAMDependency = " -d ";
export const SAMAppName = " -n ";
export const SAMAppTemplate = " --app-template hello-world";
export const ForceRemove = "rm -rf ";
export const LambdaDemo = "/lambda_demo";
export const eslintconfig = `module.exports ={
  "env": {
    commonjs: true,
    es2021: true,
    node: true,
  },
  "extends": [
    "eslint:recommended",
    "prettier", 
    "plugin:node/recommended",
    "plugin:eslint-plugin/recommended"
  ],
  
  "parserOptions": {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  "plugins": ["prettier"],
  "rules": {
    "no-unused-vars": "warn",
    "func-names": "off",
    
  }
}`;
export const prettierConfig = {
  trailingComma: "es5",
  tabWidth: 2,
  semi: false,
  singleQuote: false,
};
export const StepfunctionStateTypes = [
  "Succeed",
  "Fail",
  "Parallel",
  "Map",
  "Pass",
  "Wait",
  "Task",
  "Choice",
];
export const StepfunctionStates = {
  Type: "",
  Resource: "",
  Next: "",
  Comment: "",
};
export const StepfunctionStatesTypeSkeletons = {
  Task: {
    Comment: "Task State example",
    Type: "Task",
    Resource: "arn:aws:states:us-east-1:123456789012:task:HelloWorld",
    Next: "NextState",
    TimeoutSeconds: 300,
    HeartbeatSeconds: 60,
  },
  Pass: {
    Type: "Pass",
    Result: {},
    ResultPath: "$.coords",
    Next: "End",
  },
  Choice: {
    Type: "Choice",
    Choices: [],
    Default: "RecordEvent",
  },
  Wait: {
    Type: "Wait",
    Seconds: 10,
    Timestamp: "",
    Next: "NextState",
  },
  SuccessState: {
    Type: "Succeed",
  },
  FailState: {
    Type: "Fail",
    Error: "ErrorA",
    Cause: "Kaiju attack",
  },
  Parallel: {
    Type: "Parallel",
    Branches: [],
    Next: "NextState",
  },
  Map: {
    Type: "Map",
    InputPath: "",
    ItemsPath: "",
    MaxConcurrency: 0,
    Parameters: {
      "parcel.$": "",
      "courier.$": "",
    },
    Iterator: {},
    ResultPath: "",
    End: true,
  },
};
export const PolicySkeleton = {
  PolicyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [],
        Resource: [],
      },
    ],
  },
};
export const APIAuthorizerARN = {
  lambda:
    "arn:aws:apigateway:${Region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:FunctionName/invocations",
  cognito: "arn:aws:cognito-idp:{region}:{account_id}:userpool/{UserPoolID}",
};
export const CognitoAllowedOAuthScopes = [
  "phone",
  "email",
  "openid",
  "profile",
  "aws.cognito.signin.user.admin",
];
export const CognitoExplicitAuthFlows = [
  "ALLOW_ADMIN_USER_PASSWORD_AUTH",
  "ALLOW_CUSTOM_AUTH",
  "ALLOW_USER_PASSWORD_AUTH",
  "ALLOW_USER_SRP_AUTH",
  "ALLOW_REFRESH_TOKEN_AUTH",
];
export const CognitoSupportedIdentityProviders = [
  "COGNITO",
  "Facebook",
  "SignInWithApple",
  "Google",
  "LoginWithAmazon",
];
export const CognitoAllowedOAuthFlows = [
  "code",
  "implicit",
  "client_credentials",
];
export const CognitoAutoVerifiedAttributes = ["email", "phone_number"];
export const CognitoAliasAttributes = [
  "email",
  "phone_number",
  "preferred_username",
];
export const IAMRoleSkeleton = {
  ManagedPolicyArns: ["arn:aws:iam::aws:policy/service-role/"],
  AssumeRolePolicyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: ["apigateway.amazonaws.com"],
        },
        Action: ["sts:AssumeRole"],
      },
    ],
  },
  Path: "/",
  Policies: [],
};

export const APIGatewaySkeleton = {
  "Fn::Transform": {
    Name: "AWS::Include",
    Parameters: {
      Location: "",
    },
  },
};
export const LanguageSupport: Record<string, IroverlangDetails> = {
  node: {
    version: "nodejs14.x",
    dependency: "npm",
    extension: ".js",
  },
  python: {
    version: "python3.9",
    dependency: "pip",
    extension: ".py",
  },
};
export function generateAWSResource(
  name: string,
  type: string,
  base: Array<string>,
  optional: Array<string>,
  defaults: Record<string, IroverConfigDefaultsObject>
): IroverGenerateResourceObject {
  const resource: IroverGenerateResourceObject = {
    name: "",
    attributes: ["Type", "Properties", "DependsOn"],
    type: type,
    Properties: {
      Base: base,
      Optional: optional,
    },
  };
  if (name !== "undefined") {
    resource["name"] = name;
  }
  if (Object.keys(defaults).length !== 0) {
    resource["Properties"]["Default"] = defaults;
  }
  return resource;
}

const stackBase = ["TemplateURL"];
const stackOptional = [
  "NotificationARNs",
  "Parameters",
  "Tags",
  "TemplateURL",
  "TimeoutInMinutes",
];
const stackResource = generateAWSResource(
  "undefined",
  stacktype,
  stackBase,
  stackOptional,
  {}
);

const lambdaBase = ["FunctionName", "CodeUri", "Runtime"];
const lambdaOptional = [
  "Events",
  "Environment",
  "Policies",
  "Role",
  "Tags",
  "Description",
];
const lambdaDefault = {
  Handler: { Key: "Handler", Value: "app.lambdaHandler" },
};
const lambdaResource = generateAWSResource(
  "FunctionName",
  "AWS::Serverless::Function",
  lambdaBase,
  lambdaOptional,
  lambdaDefault
);

const dynamoDBBase = ["TableName", "KeySchema"];
const dynamoDBOptional = [
  "AttributeDefinitions",
  "BillingMode",
  "ContributorInsightsSpecification",
  "GlobalSecondaryIndexes",
  "KinesisStreamSpecification",
  "LocalSecondaryIndexes",
  "PointInTimeRecoverySpecification",
  "ProvisionedThroughput",
  "SSESpecification",
  "StreamSpecification",
  "TableClass",
  "Tags",
  "TimeToLiveSpecification",
];
const dynamoDBResource = generateAWSResource(
  "TableName",
  "AWS::DynamoDB::Table",
  dynamoDBBase,
  dynamoDBOptional,
  {}
);

const cognitoUserPoolBase = ["UserPoolName"];
const cognitoUserPoolOptional = [
  "AccountRecoverySetting",
  "AdminCreateUserConfig",
  "AliasAttributes",
  "AutoVerifiedAttributes",
  "DeviceConfiguration",
  "EmailConfiguration",
  "EmailVerificationMessage",
  "EmailVerificationSubject",
  "EnabledMfas",
  "LambdaConfig",
  "MfaConfiguration",
  "Policies",
  "Schema",
  "SmsAuthenticationMessage",
  "SmsConfiguration",
  "SmsVerificationMessage",
  "UsernameAttributes",
  "UsernameConfiguration",
  "UserPoolAddOns",
  "UserPoolTags",
  "VerificationMessageTemplate",
];
const cognitoUserPoolResource = generateAWSResource(
  "UserPoolName",
  "AWS::Cognito::UserPool",
  cognitoUserPoolBase,
  cognitoUserPoolOptional,
  {}
);

const userPoolClientBase = ["UserPoolId"];
const userPoolClientOptional = [
  "AccessTokenValidity",
  "AllowedOAuthFlows",
  "AllowedOAuthFlowsUserPoolClient",
  "AllowedOAuthScopes",
  "AnalyticsConfiguration",
  "CallbackURLs",
  "ClientName",
  "DefaultRedirectURI",
  "EnableTokenRevocation",
  "ExplicitAuthFlows",
  "GenerateSecret",
  "IdTokenValidity",
  "LogoutURLs",
  "PreventUserExistenceErrors",
  "ReadAttributes",
  "RefreshTokenValidity",
  "SupportedIdentityProviders",
  "TokenValidityUnits",
  "WriteAttributes",
];
const userPoolClientResource = generateAWSResource(
  "ClientName",
  "AWS::Cognito::UserPoolClient",
  userPoolClientBase,
  userPoolClientOptional,
  {}
);

const lambdaPermissionBase = ["FunctionName", "Principal"];
const lambdaPermissionOptional = [
  "EventSourceToken",
  "SourceAccount",
  "SourceArn",
];
const lambdaPermissionDefault = {
  Action: { Key: "Action", Value: "lambda:InvokeFunction" },
};
const lambdaPermissionResource = generateAWSResource(
  "Name",
  "AWS::Lambda::Permission",
  lambdaPermissionBase,
  lambdaPermissionOptional,
  lambdaPermissionDefault
);

const iampolicyBase = ["PolicyName"];
const iampolicyOptional = ["Roles", "Users", "Groups"];
const iampolicyDefault = {};
const iampolicyResource = generateAWSResource(
  "PolicyName",
  "AWS::IAM::Policy",
  iampolicyBase,
  iampolicyOptional,
  iampolicyDefault
);

const apigatewayBase = ["Name"];
const apigatewayOptional = [
  "StageName",
  "AccessLogSetting",
  "Auth",
  "BinaryMediaTypes",
  "CacheClusterEnabled",
  "CacheClusterSize",
  "CanarySetting",
  "Cors",
  "DefinitionBody",
  "DefinitionUri",
  "Description",
  "DisableExecuteApiEndpoint",
  "Domain",
  "EndpointConfiguration",
  "GatewayResponses",
  "MethodSettings",
  "MinimumCompressionSize",
  "Mode",
  "Models",
  "Name",
  "OpenApiVersion",
  "Tags",
  "TracingEnabled",
  "Variables",
];
const apigatewayDefault = {};
const apigatewayResource = generateAWSResource(
  "Name",
  "AWS::Serverless::Api",
  apigatewayBase,
  apigatewayOptional,
  apigatewayDefault
);

const stepfunctionBase = ["Definition", "DefinitionUri"];
const stepfunctionOptional = [
  "Definition",
  "DefinitionSubstitutions",
  "DefinitionUri",
  "Events",
  "Logging",
  "Name",
  "PermissionsBoundary",
  "Policies",
  "Role",
  "Tags",
  "Tracing",
  "Type",
];
const stepfunctionDefault = {};
const stepfunctionResource = generateAWSResource(
  "Name",
  "AWS::Serverless::StateMachine",
  stepfunctionBase,
  stepfunctionOptional,
  stepfunctionDefault
);

const s3bucketBase = ["BucketName"];
const s3bucketOptional = [
  "AccelerateConfiguration",
  "AccessControl",
  "AnalyticsConfigurations",
  "BucketEncryption",
  "CorsConfiguration",
  "IntelligentTieringConfigurations",
  "InventoryConfigurations",
  "LifecycleConfiguration",
  "LoggingConfiguration",
  "MetricsConfigurations",
  "NotificationConfiguration",
  "ObjectLockConfiguration",
  "ObjectLockEnabled",
  "OwnershipControls",
  "PublicAccessBlockConfiguration",
  "ReplicationConfiguration",
  "Tags",
  "VersioningConfiguration",
  "WebsiteConfiguration",
];
const s3bucketDefault = {};
const s3bucketResource = generateAWSResource(
  "BucketName",
  "AWS::S3::Bucket",
  s3bucketBase,
  s3bucketOptional,
  s3bucketDefault
);

const apikeyBase = ["Name"];
const apikeyOptional = [
  "CustomerId",
  "Description",
  "Enabled",
  "GenerateDistinctId",
  "StageKeys",
  "Tags",
  "Value",
];
const apikeyDefault = {};
const apikeyResource = generateAWSResource(
  "Name",
  "AWS::ApiGateway::ApiKey",
  apikeyBase,
  apikeyOptional,
  apikeyDefault
);

const usageplanBase = ["UsagePlanName"];
const usageplanOptional = [
  "ApiStages",
  "Description",
  "Quota",
  "Tags",
  "Throttle",
];
const usageplanDefault = {};
const usageplanResource = generateAWSResource(
  "UsagePlanName",
  "AWS::ApiGateway::UsagePlan",
  usageplanBase,
  usageplanOptional,
  usageplanDefault
);

const usageplankeyBase = ["KeyId", "KeyType", "UsagePlanId"];
const usageplankeyOptional: Array<string> = [];
const usageplankeyDefault = {};
const usageplankeyResource = generateAWSResource(
  "undefined",
  "AWS::ApiGateway::UsagePlanKey",
  usageplankeyBase,
  usageplankeyOptional,
  usageplankeyDefault
);

const apiauthorizerBase = ["Name", "RestApiId", "Type"];
const apiauthorizerOptional = [
  "AuthorizerCredentials",
  "AuthorizerResultTtlInSeconds",
  "AuthorizerUri",
  "AuthType",
  "IdentitySource",
  "IdentityValidationExpression",
  "ProviderARNs",
];
const apiauthorizerDefault = {};
const apiauthorizerResource = generateAWSResource(
  "Name",
  "AWS::ApiGateway::Authorizer",
  apiauthorizerBase,
  apiauthorizerOptional,
  apiauthorizerDefault
);

const vpcBase: Array<string> = [];
const vpcOptional = [
  "CidrBlock",
  "EnableDnsHostnames",
  "EnableDnsSupport",
  "InstanceTenancy",
  "Ipv4IpamPoolId",
  "Ipv4NetmaskLength",
  "Tags",
];
const vpcResource = generateAWSResource(
  "",
  "AWS::EC2::VPC",
  vpcBase,
  vpcOptional,
  {}
);

const internetgatewayBase: Array<string> = [];
const internetgatewayOptional = ["Tags"];
const internetgatewayResource = generateAWSResource(
  "",
  "AWS::EC2::InternetGateway",
  internetgatewayBase,
  internetgatewayOptional,
  {}
);

const vpcgatewayattachmentBase = ["VpcId"];
const vpcgatewayattachmentOptional = ["InternetGatewayId", "VpnGatewayId"];
const vpcgatewayattachmentResource = generateAWSResource(
  "",
  "AWS::EC2::VPCGatewayAttachment",
  vpcgatewayattachmentBase,
  vpcgatewayattachmentOptional,
  {}
);

const subnetBase = ["VpcId"];
const subnetOptional = [
  "AssignIpv6AddressOnCreation",
  "AvailabilityZone",
  "AvailabilityZoneId",
  "CidrBlock",
  "EnableDns64",
  "Ipv6CidrBlock",
  "Ipv6Native",
  "MapPublicIpOnLaunch",
  "OutpostArn",
  "PrivateDnsNameOptionsOnLaunch",
  "Tags",
];
const subnetResource = generateAWSResource(
  "",
  "AWS::EC2::Subnet",
  subnetBase,
  subnetOptional,
  {}
);

const routetableBase = ["VpcId"];
const routetableOptional = ["Tags"];
const routetableResource = generateAWSResource(
  "",
  "AWS::EC2::RouteTable",
  routetableBase,
  routetableOptional,
  {}
);

const routeBase = ["RouteTableId"];
const routeOptional = [
  "CarrierGatewayId",
  "DestinationCidrBlock",
  "DestinationIpv6CidrBlock",
  "EgressOnlyInternetGatewayId",
  "GatewayId",
  "InstanceId",
  "LocalGatewayId",
  "NatGatewayId",
  "NetworkInterfaceId",
  "TransitGatewayId",
  "VpcEndpointId",
  "VpcPeeringConnectionId",
];
const routeResource = generateAWSResource(
  "",
  "AWS::EC2::Route",
  routeBase,
  routeOptional,
  {}
);

const subnetroutetableassociationBase = ["RouteTableId", "SubnetId"];
const subnetroutetableassociationOptional: Array<string> = [];
const subnetroutetableassociationResource = generateAWSResource(
  "",
  "AWS::EC2::SubnetRouteTableAssociation",
  subnetroutetableassociationBase,
  subnetroutetableassociationOptional,
  {}
);

const eipBase: Array<string> = [];
const eipOptional = [
  "Domain",
  "InstanceId",
  "NetworkBorderGroup",
  "PublicIpv4Pool",
  "Tags",
];
const eipResource = generateAWSResource(
  "",
  "AWS::EC2::EIP",
  eipBase,
  eipOptional,
  {}
);

const natgatewayBase = ["SubnetId"];
const natgatewayOptional = ["AllocationId", "ConnectivityType", "Tags"];
const natgatewayResource = generateAWSResource(
  "",
  "AWS::EC2::NatGateway",
  natgatewayBase,
  natgatewayOptional,
  {}
);

const securitygroupBase = ["GroupDescription"];
const securitygroupOptional = [
  "GroupName",
  "SecurityGroupEgress",
  "SecurityGroupIngress",
  "Tags",
  "VpcId",
];
const securitygroupResource = generateAWSResource(
  "",
  "AWS::EC2::SecurityGroup",
  securitygroupBase,
  securitygroupOptional,
  {}
);

const dbsubnetgroupBase = ["SubnetIds", "DBSubnetGroupDescription"];
const dbsubnetgroupOptional = ["DBSubnetGroupName", "Tags"];
const dbsubnetgroupResource = generateAWSResource(
  "",
  "AWS::RDS::DBSubnetGroup",
  dbsubnetgroupBase,
  dbsubnetgroupOptional,
  {}
);

const dbclusterBase = ["Engine"];
const dbclusterOptional = [
  "AssociatedRoles",
  "AvailabilityZones",
  "BacktrackWindow",
  "BackupRetentionPeriod",
  "CopyTagsToSnapshot",
  "DatabaseName",
  "DBClusterIdentifier",
  "DBClusterParameterGroupName",
  "DBSubnetGroupName",
  "DeletionProtection",
  "EnableCloudwatchLogsExports",
  "EnableHttpEndpoint",
  "EnableIAMDatabaseAuthentication",
  "EngineMode",
  "EngineVersion",
  "GlobalClusterIdentifier",
  "KmsKeyId",
  "MasterUsername",
  "MasterUserPassword",
  "Port",
  "PreferredBackupWindow",
  "PreferredMaintenanceWindow",
  "ReplicationSourceIdentifier",
  "RestoreType",
  "ScalingConfiguration",
  "SnapshotIdentifier",
  "SourceDBClusterIdentifier",
  "SourceRegion",
  "StorageEncrypted",
  "Tags",
  "UseLatestRestorableTime",
  "VpcSecurityGroupIds",
];
const dbclusterResource = generateAWSResource(
  "",
  "AWS::RDS::DBCluster",
  dbclusterBase,
  dbclusterOptional,
  {}
);

const dbinstanceBase = ["DBInstanceClass"];
const dbinstanceOptional = [
  "AllocatedStorage",
  "AllowMajorVersionUpgrade",
  "AssociatedRoles",
  "AutoMinorVersionUpgrade",
  "AvailabilityZone",
  "BackupRetentionPeriod",
  "CACertificateIdentifier",
  "CharacterSetName",
  "CopyTagsToSnapshot",
  "DBClusterIdentifier",
  "DBInstanceIdentifier",
  "DBName",
  "DBParameterGroupName",
  "DBSecurityGroups",
  "DBSnapshotIdentifier",
  "DBSubnetGroupName",
  "DeleteAutomatedBackups",
  "DeletionProtection",
  "Domain",
  "DomainIAMRoleName",
  "EnableCloudwatchLogsExports",
  "EnableIAMDatabaseAuthentication",
  "EnablePerformanceInsights",
  "Engine",
  "EngineVersion",
  "Iops",
  "KmsKeyId",
  "LicenseModel",
  "MasterUsername",
  "MasterUserPassword",
  "MaxAllocatedStorage",
  "MonitoringInterval",
  "MonitoringRoleArn",
  "MultiAZ",
  "OptionGroupName",
  "PerformanceInsightsKMSKeyId",
  "PerformanceInsightsRetentionPeriod",
  "Port",
  "PreferredBackupWindow",
  "PreferredMaintenanceWindow",
  "ProcessorFeatures",
  "PromotionTier",
  "PubliclyAccessible",
  "SourceDBInstanceIdentifier",
  "SourceRegion",
  "StorageEncrypted",
  "StorageType",
  "Tags",
  "Timezone",
  "UseDefaultProcessorFeatures",
  "VPCSecurityGroups",
];
const dbinstanceResource = generateAWSResource(
  "DBName",
  "AWS::RDS::DBInstance",
  dbinstanceBase,
  dbinstanceOptional,
  {}
);

const secretBase = ["Name"];
const secretOptional = [
  "Description",
  "GenerateSecretString",
  "KmsKeyId",
  "ReplicaRegions",
  "SecretString",
  "Tags",
];
const secretResource = generateAWSResource(
  "Name",
  "AWS::SecretsManager::Secret",
  secretBase,
  secretOptional,
  {}
);

const codebuildprojectBase = [
  "Artifacts",
  "ServiceRole",
  "Source",
  "Environment",
];
const codebuildprojectOptional = [
  "BadgeEnabled",
  "BuildBatchConfig",
  "Cache",
  "ConcurrentBuildLimit",
  "Description",
  "EncryptionKey",
  "FileSystemLocations",
  "LogsConfig",
  "QueuedTimeoutInMinutes",
  "ResourceAccessRole",
  "SecondaryArtifacts",
  "SecondarySources",
  "SecondarySourceVersions",
  "SourceVersion",
  "Tags",
  "TimeoutInMinutes",
  "Triggers",
  "Visibility",
  "VpcConfig",
];
const codebuildprojectResource = generateAWSResource(
  "Name",
  "AWS::CodeBuild::Project",
  codebuildprojectBase,
  codebuildprojectOptional,
  {}
);

const iamroleBase = ["AssumeRolePolicyDocument"];
const iamroleOptional = [
  "Description",
  "ManagedPolicyArns",
  "MaxSessionDuration",
  "Path",
  "PermissionsBoundary",
  "Policies",
  "RoleName",
  "Tags",
];
const iamroleDefault = {
  AssumeRolePolicyDocument: {
    Key: "AssumeRolePolicyDocument",
    Value: IAMRoleSkeleton["AssumeRolePolicyDocument"],
  },
  ManagedPolicyArns: {
    Key: "ManagedPolicyArns",
    Value: IAMRoleSkeleton["ManagedPolicyArns"],
  },
};
const iamroleResource = generateAWSResource(
  "RoleName",
  "AWS::IAM::Role",
  iamroleBase,
  iamroleOptional,
  iamroleDefault
);
export const AWSResources: Record<string, IroverGenerateResourceObject> = {
  stack: stackResource,
  lambda: lambdaResource,
  dynamoDB: dynamoDBResource,
  cognitoUserPool: cognitoUserPoolResource,
  userPoolClient: userPoolClientResource,
  lambdaPermission: lambdaPermissionResource,
  iamrole: iamroleResource,
  iampolicy: iampolicyResource,
  apigateway: apigatewayResource,
  stepfunction: stepfunctionResource,
  s3bucket: s3bucketResource,
  apikey: apikeyResource,
  usageplan: usageplanResource,
  usageplankey: usageplankeyResource,
  apiauthorizer: apiauthorizerResource,
  vpc: vpcResource,
  internetgateway: internetgatewayResource,
  vpcgatewayattachment: vpcgatewayattachmentResource,
  subnet: subnetResource,
  routetable: routetableResource,
  route: routeResource,
  subnetroutetableassociation: subnetroutetableassociationResource,
  eip: eipResource,
  natgateway: natgatewayResource,
  securitygroup: securitygroupResource,
  dbsubnetgroup: dbsubnetgroupResource,
  dbcluster: dbclusterResource,
  dbinstance: dbinstanceResource,
  secret: secretResource,
  codebuildproject: codebuildprojectResource,
};
export const APIGatewayURI: Record<string, string> = {
  lambda: "lambda:path/2015-03-31/functions/${lambda.Arn}/invocations",
  stepfunction: "states:action/StartSyncExecution",
};
export const SwaggerSkeleton = {
  openapi: "3.0.1",
  info: {
    title: "user-api",
    version: "2021-11-22T07:01:12Z",
  },
  paths: {},
  components: {
    schemas: {
      Empty: {
        title: "Empty Schema",
        type: "object",
      },
    },
  },
};
const swaggerparameter = {
  name: "email",
  in: "path",
  required: true,
  schema: {
    type: "string",
  },
};
const httpresponses = {
  description: "200 response",
  headers: {
    "Access-Control-Allow-Origin": {
      schema: {
        type: "string",
      },
    },
    "Access-Control-Allow-Methods": {
      schema: {
        type: "string",
      },
    },
    "Access-Control-Allow-Headers": {
      schema: {
        type: "string",
      },
    },
  },
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Empty",
      },
    },
  },
};

const swaggerresponse = {
  "200": httpresponses,
  "400": httpresponses,
  "500": httpresponses,
};
const xamazonapigatewayintegrationresponse = {
  default: {
    statusCode: "200",
    responseParameters: {
      "method.response.header.Access-Control-Allow-Methods":
        "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
      "method.response.header.Access-Control-Allow-Headers":
        "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
      "method.response.header.Access-Control-Allow-Origin": "'*'",
    },
    responseTemplates: {
      "application/json": "{}    \n",
    },
  },
};
const xamazonapigatewayintegrationuri = {
  "Fn::Sub": "arn:aws:apigateway:${AWS::Region}:",
};
const xamazonapigatewayintegration = {
  httpMethod: "POST",
  uri: xamazonapigatewayintegrationuri,
  responses: xamazonapigatewayintegrationresponse,
  passthroughBehavior: "when_no_match",
  contentHandling: "CONVERT_TO_TEXT",
  type: "aws_proxy",
};
const swaggermethods = {
  responses: swaggerresponse,
  "x-amazon-apigateway-integration": xamazonapigatewayintegration,
};
const swaggermethodswithparameter: Record<string, unknown> = swaggermethods;
swaggermethodswithparameter["parameters"] = [swaggerparameter];
export const SwaggerPathSkeleton: Record<string, unknown> = {
  get: swaggermethodswithparameter,
  post: swaggermethods,
  delete: swaggermethodswithparameter,
  put: swaggermethodswithparameter,
  options: {
    responses: swaggerresponse,
    "x-amazon-apigateway-integration": {
      responses: xamazonapigatewayintegrationresponse,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
      passthroughBehavior: "when_no_match",
      type: "mock",
    },
  },
};
