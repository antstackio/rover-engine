let response;
const aws = require("aws-sdk");
// User pool ID is available via this method -
// const UserPoolID = process.env.UserPoolID;
const UserPoolClientID = process.env.UserPoolClientID;
exports.lambdaHandler = async (event) => {
  try {
    if (event.body !== undefined) {
      event = JSON.parse(event.body);
    }
    const cognito = new aws.CognitoIdentityServiceProvider();

    let params = {
      ClientId: UserPoolClientID,
      Username: event.emailId,
    };
    const res = await cognito.resendConfirmationCode(params).promise();

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
