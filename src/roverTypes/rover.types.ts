import { IroveraddComponentInput } from "../addComponents/addComponents.types";
import { IroveraddModule } from "../addModules/addModules.types";
import { IstackDetails } from "../generateSAM/generatesam.types";
export interface IroverResources {
  name: string;
  type: string;
  config: Record<string, unknown>;
  policies?: Record<string, unknown>;
  logic: boolean;
  logicpath: string;
  package: Array<string>;
}

export interface ItemplateparameterObject {
  Type: string;
  Description?: string;
  Default?: string;
}

export type Ttemplateparameter = Record<string, ItemplateparameterObject>;

export type TroverResourcesArray = Array<IroverResources>;

export interface IroverAppType {
  resources: TroverResourcesArray;
  parameter?: Ttemplateparameter;
  type: string;
}

export type TroverAppTypeObject = Record<string, IroverAppType>;

export interface ISAMTemplateResource {
  Type: string;
  DependsOn: object;
  Properties: Record<
    string,
    | Record<string, unknown>
    | unknown
    | string
    | number
    | boolean
    | Array<string>
    | Array<unknown>
  >;
}

export type TSAMTemplateResources = Record<string, ISAMTemplateResource>;

export interface TSAMTemplate {
  AWSTemplateFormatVersion: string;
  Transform: string;
  Description: string;
  Parameters?: Ttemplateparameter;
  Globals: {
    Function: {
      Timeout: 30;
    };
  };
  Resources: TSAMTemplateResources;
}
export interface IroverInput {
  appName: string;
  language: string;
  stackDetails: IstackDetails;
}

export interface IroverAppData extends Omit<IroverInput, "stackDetails"> {
  dependency: string;
  extension: string;
  StackType: Array<string>;
}

export type IaddComponentResource = Omit<IroverAppType, "type"> & {
  type?: string;
};

export interface IroverConfigTag {
  createdBy: string;
  applicationName: string;
}
export interface IroverConfigTagArrayValue {
  Key: string;
  Value: string;
}
export interface IroverCheckNestedObject {
  checkNested: boolean;
  compStacks: Record<string, string>;
}
export type regexmatchs = string | null;

export type RegExpExecArray = Array<string>;

export interface IroverCreateProject {
  stackDetails?: IstackDetails;
}

export type TconfigFile =
  | "rover_create_project"
  | "rover_add_component"
  | "rover_add_module";
export type TconfigFileTypes =
  | Array<IroverCreateProject>
  | Array<IroveraddComponentInput>
  | Array<IroveraddModule>;
export interface IroverConfigFileObject {
  appName?: string;
  language?: string;
  rover_create_project?: object;
  bucket?: string;
  stack_name?: string;
  region?: string;
  profile?: string;
  //Array<IroverCreateProject>;
  rover_add_component?: object;
  //Array<IroveraddComponentInput>;
  rover_add_module?: object;
  //Array<IroveraddModule>;
  rover_generate_pipeline?: object;
  rover_deploy_cli?: object;
}
export interface IroverDeploymentObject {
  appName?: string;
  name?: string;
  repoType: string;
  tool: string;
  language: string;
  no_of_env: number;
  envs: Array<string>;
  branches: Array<string>;
  framework: string;
  steps: Record<string, Record<string, string>>;
  stackname: Record<string, string>;
  deploymentbucket: Record<string, string>;
  deploymentregion: Record<string, string>;
  deploymentparameters: Record<string, string>;
  deploymentevents: Array<string>;
}
export interface IroverlangDetails {
  version: string;
  dependency: string;
  extension: string;
}
export interface IroverConfigDefaultsObject
  extends Omit<IroverConfigTagArrayValue, "Value"> {
  Value: unknown;
}
export interface IroverGenerateResourceProperties {
  Base: Array<string>;
  Optional: Array<string>;
  Default?: Record<string, IroverConfigDefaultsObject>;
}
export interface IroverGenerateResourceObject {
  name: string;
  attributes: Array<string>;
  type: string;
  Properties: IroverGenerateResourceProperties;
}

export interface ISAMPolicyObject {
  PolicyDocument: ISAMPolicyDocumentObject;
  PolicyName: string;
}
export interface ISAMPolicyDocumentObject {
  Version: string;
  Statement: Array<ISAMPolicyStatementObject>;
}
export interface ISAMPolicyStatementObject {
  Effect: string;
  Action: string | Array<string>;
  Principal: Record<string, Array<string>>;
  Resource: Record<string, string>;
}

export interface ISAMPolicyObject {
  PolicyDocument: ISAMPolicyDocumentObject;
  PolicyName: string;
}

export interface ISAMRolePolicyStatementObject {
  Effect: string;
  Action: string | Array<string>;
  Resource: Record<string, string>;
}

export interface IconfigPolicy
  extends Omit<ISAMRolePolicyStatementObject, "Effect"> {
  name: string;
}
