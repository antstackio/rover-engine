import { IcurdObject } from "../resources/components.types";
export type IcurdComponentObject = Omit<
  IcurdObject,
  "name" | "role" | "resource"
>;

interface IstackDetailsObject {
  type: string;
  params: IcurdComponentObject | object;
  componentlist: Array<string>;
}
export interface IstackDetails {
  [key: string]: IstackDetailsObject;
}
