export type TcrudMethods = "put" | "get" | "post" | "delete" | "options";

export interface IcurdObject {
  name: string;
  role: string;
  resource: string;
  path: string;
  methods: Array<TcrudMethods>;
  resourcetype: string;
}

export interface ICRUDiamresource {
  "Fn::Sub": string;
}
export type TLambdaENV = Record<string, Record<string, Record<string, string>>>;
