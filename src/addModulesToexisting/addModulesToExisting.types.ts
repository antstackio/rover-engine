import {
  IroverInput,
  TSAMTemplate,
  IroverAppData,
} from "../roverTypes/rover.types";

export interface IroveraddModule extends IroverInput {
  file_name: string;
}

export interface IroverCreateStackResponse {
  fileName: string;
  template: TSAMTemplate;
  stackType: string;
  appData: IroverAppData;
  lambdaDetails:
    | Record<string, Record<string, string | boolean | Array<string>>>
    | never;
}
export type TlambdaProperties = string | boolean | Array<string>
