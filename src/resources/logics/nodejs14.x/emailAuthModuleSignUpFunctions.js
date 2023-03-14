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
    // const ret = await axios(url);
    const cognito = new aws.CognitoIdentityServiceProvider();
    const params = {
      ClientId: UserPoolClientID,
      Username: event.emailId,
      Password: event.Password,
      UserAttributes: [
        {
          Name: "email",
          Value: event.emailId,
        },
        {
          Name: "name",
          Value: event.name,
        },
      ],
    };
    console.log(params);
    let res = await cognito.signUp(params).promise();
    response = {
      statusCode: 200,
      body: JSON.stringify(res),
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
