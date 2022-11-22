import { AnyObject } from "immer/dist/internal"
export let SkeletonConfig:AnyObject={}
SkeletonConfig["template_version"]="2010-09-09"
let ini = require('ini')
let fs = require("fs");
const exec = require("child_process").execSync;
export let npmroot=exec(" npm root -g").toString().trim()
export const stacktype="AWS::CloudFormation::Stack"
export const samabstract=["apigateway","lambda","stepfunction"]
SkeletonConfig["sam_transform_version"]="AWS::Serverless-2016-10-31"
export let SAMInitBase="sam init --no-interactive "
export let SAMLanguage=" -r " 
export let SAMDependency=" -d "
export let SAMAppName=" -n "
export let SAMAppTemplate=" --app-template hello-world"
export let ForceRemove = "rm -rf "
export let LambdaDemo = "/lambda_demo"
export let StepfunctionStateTypes=["Succeed","Fail","Parallel","Map","Pass","Wait","Task","Choice"]
export let StepfunctionStates={
      "Type" : "",
      "Resource": "",
      "Next": "",
      "Comment": ""
}
export let StepfunctionStatesTypeSkeletons={
      "Task": {
        "Comment": "Task State example",
        "Type": "Task",
        "Resource": "arn:aws:states:us-east-1:123456789012:task:HelloWorld",
        "Next": "NextState",
        "TimeoutSeconds": 300,
        "HeartbeatSeconds": 60
      },
      "Pass":{
        "Type": "Pass",
        "Result": {},
        "ResultPath": "$.coords",
        "Next": "End"
      },
      "Choice":{
        "Type" : "Choice",
        "Choices":[],
        "Default": "RecordEvent"
          
      },
      "Wait":{
            "Type" : "Wait",
            "Seconds" : 10,
            "Timestamp": "",
            "Next": "NextState"
      },
      "SuccessState": {
        "Type": "Succeed"
      },
      "FailState": {
        "Type": "Fail",
        "Error": "ErrorA",
        "Cause": "Kaiju attack"
      },
      "Parallel":{
        "Type": "Parallel",
        "Branches": [],
        "Next": "NextState"
      },
      "Map":{
        "Type": "Map",
        "InputPath": "",
        "ItemsPath": "",
        "MaxConcurrency": 0,
        "Parameters": {
          "parcel.$": "",
          "courier.$": ""
        },
        "Iterator": {
          
        },
        "ResultPath": "",
        "End": true
      }
}
export let PolicySkeleton={
    "PolicyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [],
          "Resource": []
        }
      ]
    },
   
}
export let APIAuthorizerARN={
    
    "lambda":"arn:aws:apigateway:${Region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:FunctionName/invocations",
    "cognito":"arn:aws:cognito-idp:{region}:{account_id}:userpool/{UserPoolID}"
}
export let CognitoAllowedOAuthScopes= [
    "phone",
    "email",
    "openid",
    "profile",
    "aws.cognito.signin.user.admin"
]
export let CognitoExplicitAuthFlows=[
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_CUSTOM_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
]
export let CognitoSupportedIdentityProviders=[
    "COGNITO", 
    "Facebook", 
    "SignInWithApple", 
    "Google" ,
    "LoginWithAmazon"
]
export let CognitoAllowedOAuthFlows=[
    "code",
    "implicit",
    "client_credentials"
]
export let CognitoAutoVerifiedAttributes=[
    "email", 
    "phone_number"
]
export let CognitoAliasAttributes=[
    "email", 
    "phone_number",
    "preferred_username"
]
let  IAMRoleSkeleton= {
          "ManagedPolicyArns": [
            "arn:aws:iam::aws:policy/service-role/"
          ],
          "AssumeRolePolicyDocument": {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "Service": [
                    "apigateway.amazonaws.com"
                  ]
                },
                "Action": [
                  "sts:AssumeRole"
                ]
              }
            ]
          },
          "Path": "/",
          "Policies": []
}
export {IAMRoleSkeleton}

export let APIGatewaySkeleton={
    "Fn::Transform": {
      "Name": "AWS::Include",
      "Parameters": {
          "Location":""
      }
    }
}
export let LanguageSupport={
"node":{
    "version":"nodejs14.x",
    "dependency":"npm",
    "extension":".js"
},
"python":{
    "version":"python3.9",
    "dependency":"pip",
    "extension":".py"
}
}
export function generateAWSResource(name,type,base,optional, defaults){
    
   let resource:object= {
    "attributes":["Type","Properties","DependsOn"],
    "type":type,
    "Properties":{
        "Base":base,
        "Optional":optional

    }
}
    if (name!==undefined) {
        resource["name"]=name  
    }
    if (defaults!==undefined) {
        resource["Properties"]["Default"]=defaults  
    }
    return resource
}


let stackBase=["TemplateURL"]
let stackOptional=["NotificationARNs","Parameters" ,"Tags"  ,"TemplateURL" ,"TimeoutInMinutes"]
let stackResource= generateAWSResource(undefined,stacktype,stackBase,stackOptional, undefined)

let lambdaBase=["FunctionName","CodeUri","Runtime"]
let lambdaOptional=["Events","Environment","Policies","Role","Tags","Description"]
let lambdaDefault={"Handler":{"Key":"Handler","Value":"app.lambdaHandler"}}
let lambdaResource= generateAWSResource("FunctionName","AWS::Serverless::Function",lambdaBase,lambdaOptional, lambdaDefault)

let dynamoDBBase=["TableName","KeySchema"]
let dynamoDBOptional=[
    "AttributeDefinitions", 
    "BillingMode",
    "ContributorInsightsSpecification",
    "GlobalSecondaryIndexes" ,
    "KinesisStreamSpecification",
    "LocalSecondaryIndexes",
    "PointInTimeRecoverySpecification",
    "ProvisionedThroughput",
    "SSESpecification",
    "StreamSpecification" ,
    "TableClass",
    "Tags",
    "TimeToLiveSpecification"]
let dynamoDBResource= generateAWSResource("TableName","AWS::DynamoDB::Table",dynamoDBBase,dynamoDBOptional, undefined)

let cognitoUserPoolBase=["UserPoolName",]
let cognitoUserPoolOptional=["AccountRecoverySetting","AdminCreateUserConfig","AliasAttributes","AutoVerifiedAttributes","DeviceConfiguration","EmailConfiguration","EmailVerificationMessage","EmailVerificationSubject","EnabledMfas","LambdaConfig","MfaConfiguration","Policies","Schema","SmsAuthenticationMessage","SmsConfiguration","SmsVerificationMessage","UsernameAttributes","UsernameConfiguration","UserPoolAddOns","UserPoolTags","VerificationMessageTemplate",] 
let cognitoUserPoolResource = generateAWSResource('UserPoolName','AWS::Cognito::UserPool',cognitoUserPoolBase,cognitoUserPoolOptional,undefined)

let userPoolClientBase=["UserPoolId",]
let userPoolClientOptional=["AccessTokenValidity","AllowedOAuthFlows","AllowedOAuthFlowsUserPoolClient","AllowedOAuthScopes","AnalyticsConfiguration","CallbackURLs","ClientName","DefaultRedirectURI","EnableTokenRevocation","ExplicitAuthFlows","GenerateSecret","IdTokenValidity","LogoutURLs","PreventUserExistenceErrors","ReadAttributes","RefreshTokenValidity","SupportedIdentityProviders","TokenValidityUnits","WriteAttributes",] 
let userPoolClientResource = generateAWSResource('ClientName','AWS::Cognito::UserPoolClient',userPoolClientBase,userPoolClientOptional,undefined)

let lambdaPermissionBase=["FunctionName","Principal",]
let lambdaPermissionOptional=["EventSourceToken","SourceAccount","SourceArn",] 
let lambdaPermissionDefault={"Action":{"Key":"Action","Value":"lambda:InvokeFunction"}}
let lambdaPermissionResource = generateAWSResource('Name','AWS::Lambda::Permission',lambdaPermissionBase,lambdaPermissionOptional,lambdaPermissionDefault)

let iampolicyBase=["PolicyName",]
let iampolicyOptional=["Roles","Users","Groups",] 
let iampolicyDefault={}
let iampolicyResource = generateAWSResource('PolicyName','AWS::IAM::Policy',iampolicyBase,iampolicyOptional,iampolicyDefault)

let apigatewayBase=["Name",]
let apigatewayOptional=["StageName","AccessLogSetting","Auth","BinaryMediaTypes","CacheClusterEnabled","CacheClusterSize","CanarySetting","Cors","DefinitionBody","DefinitionUri","Description","DisableExecuteApiEndpoint","Domain","EndpointConfiguration","GatewayResponses","MethodSettings","MinimumCompressionSize","Mode","Models","Name","OpenApiVersion","Tags","TracingEnabled","Variables",] 
let apigatewayDefault={}
let apigatewayResource = generateAWSResource('Name','AWS::Serverless::Api',apigatewayBase,apigatewayOptional,apigatewayDefault)

let stepfunctionBase=["Definition","DefinitionUri",]
let stepfunctionOptional=["Definition","DefinitionSubstitutions","DefinitionUri","Events","Logging","Name","PermissionsBoundary","Policies","Role","Tags","Tracing","Type",] 
let stepfunctionDefault={}
let stepfunctionResource = generateAWSResource('Name','AWS::Serverless::StateMachine',stepfunctionBase,stepfunctionOptional,stepfunctionDefault)

let s3bucketBase=["BucketName",]
let s3bucketOptional=["AccelerateConfiguration","AccessControl","AnalyticsConfigurations","BucketEncryption","CorsConfiguration","IntelligentTieringConfigurations","InventoryConfigurations","LifecycleConfiguration","LoggingConfiguration","MetricsConfigurations","NotificationConfiguration","ObjectLockConfiguration","ObjectLockEnabled","OwnershipControls","PublicAccessBlockConfiguration","ReplicationConfiguration","Tags","VersioningConfiguration","WebsiteConfiguration",] 
let s3bucketDefault={}
let s3bucketResource = generateAWSResource('BucketName','AWS::S3::Bucket',s3bucketBase,s3bucketOptional,s3bucketDefault)

let apikeyBase=["Name",]
let apikeyOptional=["CustomerId","Description","Enabled","GenerateDistinctId","StageKeys","Tags","Value",] 
let apikeyDefault={}
let apikeyResource = generateAWSResource('Name','AWS::ApiGateway::ApiKey',apikeyBase,apikeyOptional,apikeyDefault)

let usageplanBase=["UsagePlanName",]
let usageplanOptional=["ApiStages","Description","Quota","Tags","Throttle",] 
let usageplanDefault={}
let usageplanResource = generateAWSResource('UsagePlanName','AWS::ApiGateway::UsagePlan',usageplanBase,usageplanOptional,usageplanDefault)

let usageplankeyBase=["KeyId","KeyType","UsagePlanId",]
let usageplankeyOptional=[] 
let usageplankeyDefault={}
let usageplankeyResource = generateAWSResource('undefined','AWS::ApiGateway::UsagePlanKey',usageplankeyBase,usageplankeyOptional,usageplankeyDefault)

let apiauthorizerBase=["Name","RestApiId","Type",]
let apiauthorizerOptional=["AuthorizerCredentials","AuthorizerResultTtlInSeconds","AuthorizerUri","AuthType","IdentitySource","IdentityValidationExpression","ProviderARNs",] 
let apiauthorizerDefault={}
let apiauthorizerResource = generateAWSResource('Name','AWS::ApiGateway::Authorizer',apiauthorizerBase,apiauthorizerOptional,apiauthorizerDefault)

let vpcBase=[]
let vpcOptional=["CidrBlock","EnableDnsHostnames","EnableDnsSupport","InstanceTenancy","Ipv4IpamPoolId","Ipv4NetmaskLength","Tags",] 
let vpcResource = generateAWSResource('','AWS::EC2::VPC',vpcBase,vpcOptional,undefined)

let internetgatewayBase=[]
let internetgatewayOptional=["Tags",] 
let internetgatewayResource = generateAWSResource('','AWS::EC2::InternetGateway',internetgatewayBase,internetgatewayOptional,undefined)

let vpcgatewayattachmentBase=["VpcId",]
let vpcgatewayattachmentOptional=["InternetGatewayId","VpnGatewayId",] 
let vpcgatewayattachmentResource = generateAWSResource('','AWS::EC2::VPCGatewayAttachment',vpcgatewayattachmentBase,vpcgatewayattachmentOptional,undefined)

let subnetBase=["VpcId",]
let subnetOptional=["AssignIpv6AddressOnCreation","AvailabilityZone","AvailabilityZoneId","CidrBlock","EnableDns64","Ipv6CidrBlock","Ipv6Native","MapPublicIpOnLaunch","OutpostArn","PrivateDnsNameOptionsOnLaunch","Tags",] 
let subnetResource = generateAWSResource('','AWS::EC2::Subnet',subnetBase,subnetOptional,undefined)

let routetableBase=["VpcId",]
let routetableOptional=["Tags",] 
let routetableResource = generateAWSResource('','AWS::EC2::RouteTable',routetableBase,routetableOptional,undefined)

let routeBase=["RouteTableId",]
let routeOptional=["CarrierGatewayId","DestinationCidrBlock","DestinationIpv6CidrBlock","EgressOnlyInternetGatewayId","GatewayId","InstanceId","LocalGatewayId","NatGatewayId","NetworkInterfaceId","TransitGatewayId","VpcEndpointId","VpcPeeringConnectionId",] 
let routeResource = generateAWSResource('','AWS::EC2::Route',routeBase,routeOptional,undefined)

let subnetroutetableassociationBase=["RouteTableId","SubnetId",]
let subnetroutetableassociationOptional=[] 
let subnetroutetableassociationResource = generateAWSResource('','AWS::EC2::SubnetRouteTableAssociation',subnetroutetableassociationBase,subnetroutetableassociationOptional,undefined)

let eipBase=[]
let eipOptional=["Domain","InstanceId","NetworkBorderGroup","PublicIpv4Pool","Tags",] 
let eipResource = generateAWSResource('','AWS::EC2::EIP',eipBase,eipOptional,undefined)

let natgatewayBase=["SubnetId",]
let natgatewayOptional=["AllocationId","ConnectivityType","Tags",] 
let natgatewayResource = generateAWSResource('','AWS::EC2::NatGateway',natgatewayBase,natgatewayOptional,undefined)

let securitygroupBase=["GroupDescription",]
let securitygroupOptional=["GroupName","SecurityGroupEgress","SecurityGroupIngress","Tags","VpcId",] 
let securitygroupResource = generateAWSResource('','AWS::EC2::SecurityGroup',securitygroupBase,securitygroupOptional,undefined)

let dbsubnetgroupBase=["SubnetIds","DBSubnetGroupDescription",]
let dbsubnetgroupOptional=["DBSubnetGroupName","Tags",] 
let dbsubnetgroupResource = generateAWSResource('','AWS::RDS::DBSubnetGroup',dbsubnetgroupBase,dbsubnetgroupOptional,undefined)

let dbclusterBase=["Engine",]
let dbclusterOptional=["AssociatedRoles","AvailabilityZones","BacktrackWindow","BackupRetentionPeriod","CopyTagsToSnapshot","DatabaseName","DBClusterIdentifier","DBClusterParameterGroupName","DBSubnetGroupName","DeletionProtection","EnableCloudwatchLogsExports","EnableHttpEndpoint","EnableIAMDatabaseAuthentication","EngineMode","EngineVersion","GlobalClusterIdentifier","KmsKeyId","MasterUsername","MasterUserPassword","Port","PreferredBackupWindow","PreferredMaintenanceWindow","ReplicationSourceIdentifier","RestoreType","ScalingConfiguration","SnapshotIdentifier","SourceDBClusterIdentifier","SourceRegion","StorageEncrypted","Tags","UseLatestRestorableTime","VpcSecurityGroupIds",] 
let dbclusterResource = generateAWSResource('','AWS::RDS::DBCluster',dbclusterBase,dbclusterOptional,undefined)

let dbinstanceBase=["DBInstanceClass",]
let dbinstanceOptional=["AllocatedStorage","AllowMajorVersionUpgrade","AssociatedRoles","AutoMinorVersionUpgrade","AvailabilityZone","BackupRetentionPeriod","CACertificateIdentifier","CharacterSetName","CopyTagsToSnapshot","DBClusterIdentifier","DBInstanceIdentifier","DBName","DBParameterGroupName","DBSecurityGroups","DBSnapshotIdentifier","DBSubnetGroupName","DeleteAutomatedBackups","DeletionProtection","Domain","DomainIAMRoleName","EnableCloudwatchLogsExports","EnableIAMDatabaseAuthentication","EnablePerformanceInsights","Engine","EngineVersion","Iops","KmsKeyId","LicenseModel","MasterUsername","MasterUserPassword","MaxAllocatedStorage","MonitoringInterval","MonitoringRoleArn","MultiAZ","OptionGroupName","PerformanceInsightsKMSKeyId","PerformanceInsightsRetentionPeriod","Port","PreferredBackupWindow","PreferredMaintenanceWindow","ProcessorFeatures","PromotionTier","PubliclyAccessible","SourceDBInstanceIdentifier","SourceRegion","StorageEncrypted","StorageType","Tags","Timezone","UseDefaultProcessorFeatures","VPCSecurityGroups",] 
let dbinstanceResource = generateAWSResource('DBName','AWS::RDS::DBInstance',dbinstanceBase,dbinstanceOptional,undefined)

let secretBase=["Name",]
let secretOptional=["Description","GenerateSecretString","KmsKeyId","ReplicaRegions","SecretString","Tags",] 
let secretResource = generateAWSResource('Name','AWS::SecretsManager::Secret',secretBase,secretOptional,undefined)

let codebuildprojectBase=["Artifacts","ServiceRole","Source","Environment",]
let codebuildprojectOptional=["BadgeEnabled","BuildBatchConfig","Cache","ConcurrentBuildLimit","Description","EncryptionKey","FileSystemLocations","LogsConfig","QueuedTimeoutInMinutes","ResourceAccessRole","SecondaryArtifacts","SecondarySources","SecondarySourceVersions","SourceVersion","Tags","TimeoutInMinutes","Triggers","Visibility","VpcConfig",] 
let codebuildprojectResource = generateAWSResource('Name','AWS::CodeBuild::Project',codebuildprojectBase,codebuildprojectOptional,undefined)

let iamroleBase=["AssumeRolePolicyDocument"]
let iamroleOptional=["Description" ,"ManagedPolicyArns","MaxSessionDuration" ,"Path" ,"PermissionsBoundary" ,"Policies" ,"RoleName" ,"Tags"]
let iamroleDefault={
    "AssumeRolePolicyDocument":{
        "Key":"AssumeRolePolicyDocument",
        "Value":IAMRoleSkeleton["AssumeRolePolicyDocument"]
    },"ManagedPolicyArns":{
        "Key":"ManagedPolicyArns",
        "Value":IAMRoleSkeleton["ManagedPolicyArns"]
    }
}
let iamroleResource=generateAWSResource("RoleName","AWS::IAM::Role",iamroleBase,iamroleOptional,iamroleDefault)
export let AWSResources={
    "stack":stackResource,
    "lambda":lambdaResource,
    "dynamoDB":dynamoDBResource,
    "cognitoUserPool":cognitoUserPoolResource,
    "userPoolClient":userPoolClientResource,
    "lambdaPermission":lambdaPermissionResource,
    "iamrole":iamroleResource,
    "iampolicy":iampolicyResource,
    "apigateway":apigatewayResource,
    "stepfunction":stepfunctionResource,
    "s3bucket":s3bucketResource,
    "apikey":apikeyResource,
    "usageplan":usageplanResource,
    "usageplankey":usageplankeyResource,
    "apiauthorizer":apiauthorizerResource,
    "vpc":vpcResource,
    "internetgateway":internetgatewayResource,
    "vpcgatewayattachment":vpcgatewayattachmentResource,
    "subnet":subnetResource,
    "routetable":routetableResource,
    "route": routeResource,
    "subnetroutetableassociation": subnetroutetableassociationResource,
    "eip": eipResource,
    "natgateway": natgatewayResource,
    "securitygroup": securitygroupResource,
    "dbsubnetgroup": dbsubnetgroupResource,
    "dbcluster": dbclusterResource,
    "dbinstance":dbinstanceResource ,
    "secret":secretResource,
    "codebuildproject": codebuildprojectResource
}
export let APIGatewayURI={
    "lambda":"lambda:path/2015-03-31/functions/${lambda.Arn}/invocations",
    "stepfunction":"states:action/StartSyncExecution"
}
export let SwaggerSkeleton={
    "openapi": "3.0.1",
    "info": {
        "title": "user-api",
        "version": "2021-11-22T07:01:12Z"
    },
    "paths": {},
    "components": {
        "schemas": {
            "Empty": {
                "title": "Empty Schema",
                "type": "object"
            }
        }
    }
}
const swaggerparameter={
    "name": "email",
    "in": "path",
    "required": true,
    "schema": {
        "type": "string"
    }
}
const httpresponses={
    "description": "200 response",
    "headers": {
        "Access-Control-Allow-Origin": {
            "schema": {
                "type": "string"
            }
        },
        "Access-Control-Allow-Methods": {
            "schema": {
                "type": "string"
            }
        },
        "Access-Control-Allow-Headers": {
            "schema": {
                "type": "string"
            }
        }
    },
    "content": {
        "application/json": {
            "schema": {
                "$ref": "#/components/schemas/Empty"
            }
        }
    }
    }

 
const swaggerresponse = { 
    "200": httpresponses,
    "400": httpresponses,
    "500": httpresponses
}
const xamazonapigatewayintegrationresponse={
    "default": {
        "statusCode": "200",
        "responseParameters": {
            "method.response.header.Access-Control-Allow-Methods": "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
            "method.response.header.Access-Control-Allow-Headers": "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
            "method.response.header.Access-Control-Allow-Origin": "'*'"
        },
        "responseTemplates": {
            "application/json": "{}    \n"
          }
    }
}
const xamazonapigatewayintegrationuri={"Fn::Sub":"arn:aws:apigateway:${AWS::Region}:"}
const xamazonapigatewayintegration= {
    "httpMethod": "POST",
    "uri": xamazonapigatewayintegrationuri,
    "responses": xamazonapigatewayintegrationresponse,
    "passthroughBehavior": "when_no_match",
    "contentHandling": "CONVERT_TO_TEXT",
    "type": "aws_proxy"
}
const swaggermethods =   {
    "responses": swaggerresponse,
    "x-amazon-apigateway-integration": xamazonapigatewayintegration
}
const swaggermethodswithparameter =  swaggermethods
swaggermethodswithparameter["parameters"]=[swaggerparameter]
export let SwaggerPathSkeleton=  {
    "get": swaggermethodswithparameter,
    "post": swaggermethods,
    "delete": swaggermethodswithparameter,
    "put": swaggermethodswithparameter,
    "options": {
        "responses": swaggerresponse,
        "x-amazon-apigateway-integration": {
            "responses": xamazonapigatewayintegrationresponse,
            "requestTemplates": {
                "application/json": "{\"statusCode\": 200}"
            },
            "passthroughBehavior": "when_no_match",
            "type": "mock"
        }
    }
}