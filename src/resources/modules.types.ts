import { IaddComponentResource } from "../roverTypes/rover.types";
import { IcurdComponentObject } from "../generateSAM/generatesam.types";
interface IroverParamObject extends Iroverdescription {
  message: string;
}
interface Iroverdescription {
  key: string;
  value: string;
}
export interface IroverParamObjects {
  params: Array<IroverParamObject>;
}
export interface IroverResourceModule {
  resource:
    | Record<string, IaddComponentResource>
    | ((
        apiname: string,
        config: Record<string, IcurdComponentObject>
      ) => Record<string, IaddComponentResource>);
  params: IroverParamObjects;
  description: Iroverdescription;
}
