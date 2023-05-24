import * as utlities from "../utlities/utilities";
import * as helpers from "../helpers/helpers";
import * as yaml from "yaml";
import * as fs from "fs";
import {
  ISAMTemplateResource,
  IroverAppData,
  TSAMTemplate,
  TroverAppTypeObject,
} from "../roverTypes/rover.types";
import { IroveraddModule } from "./addModules.types";

import {
  createStack,
  createStackFolders,
} from "../utlities/generate-utilities";
import { IroverCreateStackResponse } from "../addModulesToexisting/addModulesToExisting.types";
const pwd = utlities.pwd;

const stackMap: Record<string, Record<string, string>> = <
  Record<string, Record<string, string>>
>{};
export function addModules(input: IroveraddModule): void {
  try {
    const app_data: IroverAppData = utlities.getAppdata(input);
    const app_types: TroverAppTypeObject = utlities.cliModuletoConfig(
      input,
      true
    );
    const appname: string = input.appName;
    const stackdata = createStack(app_data, app_types, "", stackMap);
    createModuleFiles(
      appname,
      <Record<string, ISAMTemplateResource>>stackdata["stacks"]
    );
    createStackFolders(
      <Record<string, IroverCreateStackResponse>>stackdata["responses"],
      false
    );

    helpers.generateRoverConfig(input.appName, input, "rover_add_module");
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
export function createModuleFiles(
  appname: string,
  stacksData: Record<string, ISAMTemplateResource>
) {
  const template: TSAMTemplate = utlities.getYamlData(
    `${appname}/template.yaml`
  );

  template.Resources = { ...template.Resources, ...stacksData };
  const doc = new yaml.Document();
  doc.contents = template;
  const yamltemplate = utlities.replaceYAML(doc.toString());
  utlities.writeFile(`${appname}/template.yaml`, yamltemplate);
  Object.keys(stacksData).forEach((Element) => {
    fs.mkdirSync(`${pwd}${appname}/${Element}`);
  });
}
