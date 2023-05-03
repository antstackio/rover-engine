import { IroverInput, IroverAppData } from "../roverTypes/rover.types";

export interface IroveraddComponentInputNestedType
  extends Omit<IroverInput, "stackDetails"> {
  nested: boolean;
  fileName: string;
  nestedComponents: TnestedComponentsObject;
}
export interface IroveraddComponentInputType
  extends Omit<IroverInput, "stackDetails"> {
  nested: boolean;
  fileName: string;
  components: Array<string>;
}

export type IroveraddComponentInput =
  | IroveraddComponentInputType
  | IroveraddComponentInputNestedType;

interface IroverComponentInputObject {
  components: Array<string>;
  path: string;
}

export type IaddComponentAppData = Omit<IroverAppData, "StackType">;
type TnestedComponentsObject = Record<string, IroverComponentInputObject>;

export interface IaddComponentComp {
  desti?: string;
  demo_desti: string;
}
