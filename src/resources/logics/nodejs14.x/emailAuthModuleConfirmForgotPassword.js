let response;
// User pool ID is available via this method -
// const UserPoolID = process.env.UserPoolID;
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
      ConfirmationCode: event.Code,
      Username: event.emailId,
      Password: event.password /* required */,
    };
    const res = await cognito.confirmForgotPassword(params).promise();
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: res,
      }),
    };
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 200,
      body: JSON.stringify(err),
    };
  }

  return response;
};
