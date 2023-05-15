import * as helpers from "../src/helpers/helpers";
import * as deployment from "../src/deployment/deployment";
import * as modules from "../src/resources/modules/modules";
import * as components from "../src/resources/components/components";
import * as generateSAM from "../src/generateSAM/generatesam";
import * as generateCustomSAM from "../src/generateSAM/customSAM";
import * as addComponent from "../src/addComponents/addComponent";
import * as addModules from "../src/addModules/addModules";
import * as addModulesToExisting from "../src/addModulesToexisting/addModulesToExisting";
import * as generateSAMTypes from "../src/generateSAM/generatesam.types";
export = {
  deployment: deployment,
  helpers: helpers,
  modules: modules,
  components: components,
  generateSAM: generateSAM,
  generateSAMTypes: generateSAMTypes,
  generateCustomSAM: generateCustomSAM,
  addComponent: addComponent,
  addModules: addModules,
  addModulesToExisting: addModulesToExisting,
};
