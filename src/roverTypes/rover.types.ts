export interface IroverResources {
  name: string;
  type: string;
  config: Record<string, unknown>;
  policies: Record<string, unknown>;
  logic: boolean;
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

export type TSAMTemplate = Record<string, ISAMTemplateResource>;
