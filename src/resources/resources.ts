import * as configs from "../utlities/config";
import * as utilities from "../utlities/utilities";
import * as yaml from "yaml";
import {
  TSAMTemplate,
  ISAMPolicyObject,
  ISAMTemplateResource,
  ISAMPolicyDocumentObject,
  ISAMRolePolicyStatementObject,
  IconfigPolicy,
} from "../roverTypes/rover.types";
import { IcurdObject } from "./components/components.types";
export function skeleton(): TSAMTemplate {
  const template_skeleton: TSAMTemplate = {
    AWSTemplateFormatVersion: JSON.parse(
      JSON.stringify(configs.SkeletonConfig["template_version"])
    ),
    Transform: JSON.parse(
      JSON.stringify(configs.SkeletonConfig["sam_transform_version"])
    ),
    Description: "SAM Template",
    Globals: { Function: { Timeout: 30 } },
    Resources: {},
  };
  return template_skeleton;
}
function rolePolicyAddition(
  template: ISAMTemplateResource,
  config: Record<string, unknown>
) {
  const policies: Array<ISAMPolicyObject> = [];

  const base = (<Array<string>>template["Properties"]["ManagedPolicyArns"])[0];
  let j = "";
  for (j in <Array<string>>config["managedarn"]) {
    (<Array<string>>template["Properties"]["ManagedPolicyArns"])[
      <number>(<unknown>j)
    ] = base + (<Array<string>>config["managedarn"])[j];
  }
  if (Object.prototype.hasOwnProperty.call(config, "iamservice")) {
    for (const j in <Array<string>>config["iamservice"]) {
      (<ISAMPolicyDocumentObject>(
        template["Properties"]["AssumeRolePolicyDocument"]
      ))["Statement"][0]["Principal"]["Service"].push(
        (<Array<string>>config["iamservice"])[j]
      );
    }
  }

  const configPolicies = <Array<IconfigPolicy>>config["Policies"];
  for (const k in configPolicies) {
    const role: ISAMPolicyObject = JSON.parse(
      JSON.stringify(configs.PolicySkeleton)
    );
    role["PolicyName"] = configPolicies[k]["name"];
    role["PolicyDocument"]["Statement"][0]["Action"] =
      configPolicies[k]["Action"];
    role["PolicyDocument"]["Statement"][0]["Resource"] =
      configPolicies[k]["Resource"];
    policies.push(role);
  }
  template["Properties"]["Policies"] = policies;

  return template;
}
function policyAddition(
  template: ISAMTemplateResource,
  config: Record<string, unknown>
) {
  const role = JSON.parse(JSON.stringify(configs.PolicySkeleton));
  const configRoleObject = <Array<ISAMRolePolicyStatementObject>>(
    config["Statement"]
  );
  for (const k in configRoleObject) {
    role["PolicyDocument"]["Statement"][k]["Action"] =
      configRoleObject[k]["Action"];
    role["PolicyDocument"]["Statement"][k]["Resource"] =
      configRoleObject[k]["Resource"];
  }
  template["Properties"]["PolicyDocument"] = role["PolicyDocument"];

  return template;
}

function swaggerGenerator(config: Record<string, unknown>) {
  const swagger = JSON.parse(JSON.stringify(configs.SwaggerSkeleton));
  const swaggerPaths: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(config, "security")) {
    swagger["securityDefinitions"] = JSON.parse(
      JSON.stringify(config["security"])
    );
  }
  const security: Array<Record<string, Array<unknown>>> = [];

  if (
    config["security"] !== undefined &&
    Object.keys(<Record<string, unknown>>config.security).length > 0
  ) {
    const apikeyObject = <Record<string, unknown>>config.security;
    if (Object.prototype.hasOwnProperty.call(config.security, "api_key")) {
      const apikey: Record<string, Array<unknown>> = {};

      apikey[
        JSON.parse(
          JSON.stringify(
            (<Record<string, string>>apikeyObject.api_key).apikeyName
          )
        )
      ] = [];
      security.push(apikey);
    }
    if (Object.prototype.hasOwnProperty.call(apikeyObject, "authorizer")) {
      const authorizer: Record<string, Array<unknown>> = {};
      authorizer[
        JSON.parse(
          JSON.stringify(
            (<Record<string, string>>apikeyObject.authorizer).authorizerName
          )
        )
      ] = [];
      security.push(authorizer);
    }
  }

  const configObjects = <Array<IcurdObject>>config.objects;
  configObjects.map((data: IcurdObject) => {
    const pathName = data["path"];
    swaggerPaths[pathName] = attachMethods(data["methods"], data, security);
    return null;
  });

  swagger["paths"] = swaggerPaths;
  const doc = new yaml.Document();
  doc.contents = swagger;
  utilities.writeFile(<string>config["filepath"], doc.toString());
}

const attachMethods = (
  methodArray: Array<string>,
  data: IcurdObject,
  security: Array<Record<string, Array<unknown>>>
) => {
  const result: Record<string, object> = {};
  if (methodArray.length) {
    methodArray.map((item: string) => {
      result[item] = JSON.parse(
        JSON.stringify(configs.SwaggerPathSkeleton[item])
      );
      if (item !== "options") {
        let uri =
          (<Record<string, Record<string, Record<string, unknown>>>>(
            result[item]
          ))["x-amazon-apigateway-integration"]["uri"]["Fn::Sub"] +
          configs.APIGatewayURI[data["resourcetype"]];

        if (data["resourcetype"] == "lambda") {
          uri = uri.replace("lambda.Arn", data["resource"] + ".Arn");
        }

        if (security !== undefined && Object.keys(security).length > 0) {
          (<Record<string, unknown>>result[item])["security"] = JSON.parse(
            JSON.stringify(security)
          );
        }
        (<Record<string, Record<string, Record<string, unknown>>>>result[item])[
          "x-amazon-apigateway-integration"
        ]["uri"]["Fn::Sub"] = uri;
      }
      (<Record<string, Record<string, unknown>>>result[item])[
        "x-amazon-apigateway-integration"
      ]["credentials"] = {};
      (<Record<string, Record<string, Record<string, unknown>>>>result[item])[
        "x-amazon-apigateway-integration"
      ]["credentials"]["Fn::Sub"] = "${" + data["role"] + ".Arn}";
      return null;
    });
  }

  return result;
};

export function apigatewaypath(template: ISAMTemplateResource, path: string) {
  const definationbody = JSON.parse(JSON.stringify(configs.APIGatewaySkeleton));
  definationbody["Fn::Transform"]["Parameters"]["Location"] = path;
  template["Properties"]["DefinitionBody"] = definationbody;
  return template;
}
export const resourceGeneration = function (
  resource_name: string,
  config: Record<string, unknown>
) {
  const resource_properties = JSON.parse(
    JSON.stringify(configs.AWSResources[resource_name])
  );
  let template: ISAMTemplateResource = <ISAMTemplateResource>{};
  for (const j in resource_properties.attributes) {
    if (resource_properties.attributes[j] == "Type") {
      template[<"Type">resource_properties.attributes[j]] = JSON.parse(
        JSON.stringify(configs.AWSResources[resource_name].type)
      );
    } else if (resource_properties.attributes[j] == "DependsOn") {
      if (config["DependsOn"] !== undefined)
        template[<"DependsOn">resource_properties.attributes[j]] = JSON.parse(
          JSON.stringify(config["DependsOn"])
        );
    } else {
      template[<"Properties">resource_properties.attributes[j]] = {};

      if (resource_properties.Properties.Base.length > 0) {
        for (const k in resource_properties.Properties.Base) {
          template[<"Properties">resource_properties.attributes[j]][
            resource_properties.Properties.Base[k]
          ] = config[resource_properties.Properties.Base[k]];
        }
      }

      if (resource_properties.Properties.Optional.length > 0) {
        for (const l in resource_properties.Properties.Optional) {
          if (
            config[resource_properties.Properties.Optional[l]] !== undefined
          ) {
            template[<"Properties">resource_properties.attributes[j]][
              resource_properties.Properties.Optional[l]
            ] = config[resource_properties.Properties.Optional[l]];
          }
        }
      }

      for (const m in resource_properties.Properties.Default) {
        template[<"Properties">resource_properties.attributes[j]][
          resource_properties.Properties.Default[m]["Key"]
        ] = resource_properties.Properties.Default[m]["Value"];
      }
    }
  }
  if (resource_name == "iamrole") {
    template = rolePolicyAddition(template, config);
  }
  if (resource_name == "iampolicy") {
    template = policyAddition(template, config);
  }
  if (resource_name == "apigateway") {
    if (Object.prototype.hasOwnProperty.call(config, "path")) {
      template = apigatewaypath(template, <string>config["path"]);
    }
    if (Object.prototype.hasOwnProperty.call(config, "objects")) {
      swaggerGenerator(config);
    }
  }
  return template;
};
