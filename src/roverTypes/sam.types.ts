export interface IsamBuildTOMLObject {
  codeuri: string;
  runtime: string;
  architecture: string;
  handler: string;
  manifest_hash: string;
  packagetype: string;
  functions: Array<string>;
}
type TsamBuildTOMLObjects = Record<string, IsamBuildTOMLObject>;
export type TsamBuildTOML = Record<string, TsamBuildTOMLObjects>;
