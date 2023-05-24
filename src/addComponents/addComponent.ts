import * as config from "../utlities/config";
import * as components from "../resources/components/components";
import * as utlities from "../utlities/utilities";
import * as helpers from "../helpers/helpers";

import {
  IroveraddComponentInput,
  IroveraddComponentInputNestedType,
  IroveraddComponentInputType,
  IaddComponentAppData,
} from "./addComponents.types";
import {
  TSAMTemplate,
  TSAMTemplateResources,
  TroverResourcesArray,
  IaddComponentResource,
  IroverResources,
} from "../roverTypes/rover.types";
import { TlambdaProperties } from "../addModulesToexisting/addModulesToExisting.types";
import {
  copyLambdaLogic,
  createStackResources,
  genrateResourceFiles,
} from "../utlities/generate-utilities";
const pwd = utlities.pwd;

export async function addComponents(
  input: IroveraddComponentInput
): Promise<void> {
  const Data: TSAMTemplate = utlities.getYamlData(input.fileName);
  if (!Object.prototype.hasOwnProperty.call(Data, "Resources")) {
    console.log("wrong template structure");
  }
  const app_data = getAppdata(input);
  if (input.nested) {
    const inputs: IroveraddComponentInputNestedType = <
      IroveraddComponentInputNestedType
    >input;
    const addComponentData = addComponentsNested(inputs, app_data);
     Object.keys(addComponentData).forEach((Element) => {
      const templatePath = `${input.appName}/${Element}`;
      const templetData = utlities.getYamlData(`${templatePath}/template.yaml`);
      genrateResourceFiles(
        templatePath,
        <TSAMTemplateResources>addComponentData[Element]["response"]
      );
      templetData.Resources = {
        ...templetData.Resources,
        ...(<TSAMTemplateResources>addComponentData[Element]["response"]),
      };
      utlities.JSONtoYAML(templatePath, templetData);
      copyLambdaLogic(
        `${pwd}${input.appName}/${Element}`,
        <Record<string, Record<string, TlambdaProperties>>>(
          addComponentData[Element]["lambdaDetails"]
        )
      );
    });
  } else {
    const inputs: IroveraddComponentInputType = <IroveraddComponentInputType>(
      input
    );
    const addComponentData = addComponentsnonNested(inputs, app_data);
    const templatePath = `${input.appName}`;
    const templetData = utlities.getYamlData(`${templatePath}/template.yaml`);
    genrateResourceFiles(
      templatePath,
      <TSAMTemplateResources>addComponentData["response"]
    );
    templetData.Resources = {
      ...templetData.Resources,
      ...(<TSAMTemplateResources>addComponentData["response"]),
    };
     utlities.JSONtoYAML(templatePath, templetData);
     copyLambdaLogic(
      `${pwd}${input.appName}`,
      <Record<string, Record<string, TlambdaProperties>>>(
        addComponentData["lambdaDetails"]
      )
    );
  }
  helpers.generateRoverConfig(input.appName, input, "rover_add_component");
}

function addComponentsNested(
  input: IroveraddComponentInputNestedType,
  app_data: IaddComponentAppData
) {
  const response: Record<
    string,
    Record<
      string,
      TSAMTemplateResources | Record<string, Record<string, TlambdaProperties>>
    >
  > = <
    Record<
      string,
      Record<
        string,
        | TSAMTemplateResources
        | Record<string, Record<string, TlambdaProperties>>
      >
    >
  >{};
  Object.keys(input.nestedComponents).forEach((ele) => {
    const res: IaddComponentResource = {
      resources: getComponents(input.nestedComponents[ele]["components"]),
    };
    const stackResource = createStackResources(res, app_data, "");
    response[ele] = stackResource;
  });
  return response;
}
function addComponentsnonNested(
  input: IroveraddComponentInputType,
  app_data: IaddComponentAppData
) {
  const res: IaddComponentResource = {
    resources: getComponents(input.components),
  };
  const response = createStackResources(res, app_data, "");
  return response;
}
function getAppdata(input: IroveraddComponentInput): IaddComponentAppData {
  const app_data: IaddComponentAppData = {
    appName: input.appName,
    language: config.LanguageSupport[input.language]["version"],
    dependency: config.LanguageSupport[input.language]["dependency"],
    extension: config.LanguageSupport[input.language]["extension"],
  };
  return app_data;
}
function getComponents(component: Array<string>): TroverResourcesArray {
  const resources: TroverResourcesArray = [];
  Object.entries(component).forEach((ele) => {
    const componentstype: string = ele[1];
    const componentstypeobj: TroverResourcesArray = JSON.parse(
      JSON.stringify(components.Components[componentstype])
    );
    componentstypeobj.forEach(function (ele: IroverResources) {
      resources.push(ele);
    });
  });
  return resources;
}
