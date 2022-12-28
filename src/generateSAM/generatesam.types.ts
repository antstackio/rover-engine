type TcrudMethods = "put" | "get" | "post" | "delete" | "options";
interface IcurdObject {
  path: string;
  methods: Array<TcrudMethods>;
  resourcetype: string;
}
interface IstackDetailsObject {
  type: string;
  params: IcurdObject | object;
  componentlist: Array<string>;
}
export interface IstackDetails {
  [key: string]: IstackDetailsObject;
}
