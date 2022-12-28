type TcrudMethods = "put" | "get" | "post" | "delete" | "options";
//type TroverLang = "node" | "python";
interface curdObject {
  path: string;
  methods: Array<TcrudMethods>;
  resourcetype: string;
}
interface IstackDetailsObject {
  type: string;
  params: curdObject | object;
  componentlist: Array<string>;
}
export interface IstackDetails {
  [key: string]: IstackDetailsObject;
}
