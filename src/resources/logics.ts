import * as fs from "fs";
import * as path from "path";

export const LambdaLogicsFileMappings: Record<
  string,
  Record<string, string>
> = {
  "nodejs14.x": {
    EmailAuthModule_PreSignUp: "emailAuthModulePreSignUp.js",
    EmailAuthModule_DefineAuthChallenge:
      "emailAuthModuleDefineAuthChallenge.js",
    EmailAuthModule_CreateAuthChallenge:
      "emailAuthModuleCreateAuthChallenge.js",
    EmailAuthModule_VerifyAuthChallengeResponse:
      "emailAuthModuleVerifyAuthChallengeResponse.js",
    EmailAuthModule_SignUpFunctions: "emailAuthModuleSignUpFunctions.js",
    EmailAuthModule_ResendCode: "emailAuthModuleResendCode.js",
    EmailAuthModule_ConfirmUser: "emailAuthModuleConfirmUser.js",
    EmailAuthModule_ConfirmForgotPassword:
      "emailAuthModuleConfirmForgotPassword.js",
    EmailAuthModule_ForgotPassword: "emailAuthModuleForgotPassword.js",
    EmailAuthModule_AuthorizerFunction: "emailAuthModuleAuthorizerFunction.js",
    s3_lambda: "s3Lambda.js",
    EmailAuthModule_Users: "emailAuthModuleUsers.js",
    crud: "crud.js",
    rdstable: "rdsTable.js"
  },
  "python3.9": {}
};

export function generateLambdaLogics(filename: string, language: string) {
  const dirName = path.join(__dirname);
  const filePath = path.join(dirName, `logics/${language}/${filename}`);
  const fileContent = fs.readFileSync(filePath, "utf-8").toString();
  return fileContent;
}
