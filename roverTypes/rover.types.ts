export interface IroverResources{
    name: string,
    "type": string,
    "config": Record<string, unknown>,
    "policies": Record<string, unknown>,
    "logic": boolean
  }

  export type TroverResourcesArray=
Array<IroverResources>


export interface IroverAppType {
    resources:TroverResourcesArray,
    type:string
}

export type TroverAppTypeObject=Record<string,IroverAppType>