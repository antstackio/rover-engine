import { IroverResources, TSAMTemplate } from "../roverTypes/rover.types";
import * as utlities from "../utlities/utilities";
import * as config from "../utlities/config";
import { IdefineRoverModule } from "./defineRoverModules.types";

export function defineRoverModules(input: Record<string, string>): void {
  try {
    const template: TSAMTemplate = utlities.getYamlData(
      `${input["modulePath"]}/template.yaml`
    );

    Object.keys(template.Resources).forEach((Element) => {
      if (template.Resources[Element]["Type"] === config.stacktype) {
        throw new Error("Modules cannot be Nested");
      }
    });
    const resp = templatetoRoverConfig(template);
    console.log("bbn", JSON.stringify(resp));
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
function templatetoRoverConfig(jsondata: TSAMTemplate) {
  const res: Array<IroverResources> = <Array<IroverResources>>[];
  const templateResources = jsondata.Resources;
  Object.keys(templateResources).map((ele) => {
    const obj: IroverResources = <IroverResources>{};
    obj["name"] = ele;
    obj["type"] = templateResources[ele]["Type"].split("::")[2].toLowerCase();
    obj["config"] = templateResources[ele]["Properties"];
    res.push(obj);
  });
  return res;
  //  return JSON.stringify(res);
}
