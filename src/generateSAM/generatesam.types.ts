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
interface IstackDetails {
  [key: string]: IstackDetailsObject;
}
export interface IroverInput {
  app_name: string;
  language: string;
  stack_details: IstackDetails;
}

export interface IroverAppData extends Omit<IroverInput, "stack_details"> {
  dependency: string;
  extension: string;
  StackType: Array<string>;
}

export interface IroverConfigTag {
  createdBy: string;
  applicationName: string;
}
export interface IroverConfigTagArrayValue {
  Key: string;
  Value: string;
}
