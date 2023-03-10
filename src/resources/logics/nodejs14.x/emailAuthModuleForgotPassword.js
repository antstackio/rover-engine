// WE GOT THIS FROM THE LOGICS DIRECTORY
let response;
const UserPoolID = process.env.UserPoolID;
const UserPoolClientID = process.env.UserPoolClientID;
const aws = require("aws-sdk");
exports.lambdaHandler = async (event, context) => {
  try {
    if (event.body !== undefined) {
      event = JSON.parse(event.body);
    }
    const cognito = new aws.CognitoIdentityServiceProvider();
    let params = {
      ClientId: UserPoolClientID,
      Username: event.emailId
    };
    let res = await cognito.forgotPassword(params).promise();
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: res
      })
    };
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 200,
      body: JSON.stringify(err)
    };
  }

  return response;
};