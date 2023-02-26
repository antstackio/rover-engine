import { IcurdObject } from "../resources/components/components.types";
export type IcurdComponentObject = Omit<
  IcurdObject,
  "name" | "role" | "resource"
>;

interface IstackDetailsObject {
  type: string;
  params: IcurdComponentObject | object;
  componentList: Array<string>;
  stackName: string;
}
export interface IstackDetails {
  [key: string]: IstackDetailsObject;
}
