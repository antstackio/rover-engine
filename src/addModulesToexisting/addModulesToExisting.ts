import * as utlities from "../utlities/utilities";
import * as helpers from "../helpers/helpers";

import { IstackDetails } from "../generateSAM/generatesam.types";
import {
  IroveraddModule,
  IroverCreateStackResponse,
} from "./addModulesToExisting.types";
import {
  createStack,
  createStackFolders,
} from "../utlities/generate-utilities";

export function addModulesToExistingStack(input: IroveraddModule): void {
  try {
    const inputJSON = JSON.parse(JSON.stringify(input));
    inputJSON.appName = input.appName + "_test";
    const app_types = utlities.cliModuletoConfig(input, true);
    const app_data = utlities.getAppdata(input);
    const stackMap = stackMapping(Object.keys(app_types), input.stackDetails);
    const stackData = createStack(
      app_data,
      app_types,
      input.fileName,
      stackMap
    );
    createStackFolders(
      <Record<string, IroverCreateStackResponse>>stackData["responses"],
      true
    );
    helpers.generateRoverConfig(input.appName, input, "rover_add_module");
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
function stackMapping(
  newStackNames: Array<string>,
  stackDetails: IstackDetails
) {
  const response: Record<string, Record<string, string>> = {};
  for (const stacks of newStackNames) {
    response[stacks] = {};
    response[stacks]["stackName"] = stackDetails[stacks].stackName;
    response[stacks]["stackType"] = stackDetails[stacks].type;
  }
  return response;
}
