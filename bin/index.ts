import * as helpers from "../src/helpers/helpers";
import * as deployment from "../src/deployment/deployment";
import * as modules from "../src/resources/modules/modules";
import * as components from "../src/resources/components/components";
import * as generateSAM from "../src/generateSAM/generatesam";
import * as addComponents from "../src/addComponents/addcomponents";
import * as addModules from "../src/addModules/addModules";
import * as generateSAMTypes from "../src/generateSAM/generatesam.types";
export = {
  deployment: deployment,
  helpers: helpers,
  modules: modules,
  components: components,
  generateSAM: generateSAM,
  generateSAMTypes: generateSAMTypes,
  addComponents: addComponents,
  addModules: addModules
};
