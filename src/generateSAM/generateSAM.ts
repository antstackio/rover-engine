import * as utlities from "../utlities/utilities";
import * as yaml from "yaml";
import * as fs from "fs";
import * as helpers from "../helpers/helpers";
import * as child from "child_process";
const exec = child.execSync;
const pwd = utlities.pwd;
import {
  createStack,
  createStackFolders,
} from "../utlities/generate-utilities";
import {
  IroverInput,
  IroverAppData,
  TroverAppTypeObject,
  ISAMTemplateResource,
  IroverConfigFileObject,
} from "../roverTypes/rover.types";
import { IroverCreateStackResponse } from "../addModulesToexisting/addModulesToExisting.types";

const stackMap: Record<string, Record<string, string>> = <
  Record<string, Record<string, string>>
>{};

export function generateSAM(input: IroverInput): void {
  try {
    const app_data: IroverAppData = utlities.getAppdata(input);
    const app_types: TroverAppTypeObject = utlities.cliModuletoConfig(
      input,
      false
    );
    const appname: string = input.appName;
    const stackdata = createStack(app_data, app_types, "", stackMap);
    createRootStack(
      appname,
      <Record<string, ISAMTemplateResource>>stackdata["stacks"]
    );
    createStackFolders(
      <Record<string, IroverCreateStackResponse>>stackdata["responses"],
      false
    );
    helpers.generateRoverConfig(
      input.appName,
      <IroverConfigFileObject>input,
      "rover_create_project"
    );
    exec("cd " + utlities.pwd + appname + " && npm run format:write");
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
export function createRootStack(
  appname: string,
  stacksData: Record<string, ISAMTemplateResource>
) {
  const template = utlities.addResourceTemplate(
    stacksData,
    Object.keys(stacksData),
    undefined
  );
  const doc = new yaml.Document();
  doc.contents = template;
  const yamltemplate = utlities.replaceYAML(doc.toString());
  utlities.writeFile(`${appname}/template.yaml`, yamltemplate);
  Object.keys(stacksData).forEach((Element) => {
    fs.mkdirSync(`${pwd}${appname}/${Element}`);
  });
}
