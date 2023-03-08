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
  appData: IroverAppData;
}
