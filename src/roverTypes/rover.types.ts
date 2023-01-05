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
  Description: string;
  Default: string;
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
  Properties: Record<string, object | string | number | boolean>;
}

export type TSAMTemplateResources = Record<string, ISAMTemplateResource>;

export interface TSAMTemplate {
  AWSTemplateFormatVersion: string;
  Transform: string;
  Description: string;
  Globals: {
    Function: {
      Timeout: 30;
    };
  };
  Resources: TSAMTemplateResources;
}
export interface IroverInput {
  app_name: string;
  language: string;
  stack_details: IstackDetails;
}

export interface IroverAppData extends Omit<IroverInput, "stack_details"> {
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
  stack_details?: IstackDetails;
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
  app_name?: string;
  language?: string;
  rover_create_project?: object;
  //Array<IroverCreateProject>;
  rover_add_component?: object;
  //Array<IroveraddComponentInput>;
  rover_add_module?: object;
  //Array<IroveraddModule>;
}
