let response;
const aws = require("aws-sdk");
const dynamoDB = new aws.DynamoDB.DocumentClient();
const UserTable = process.env.userinfoTable;
const UserPoolID = process.env.UserPoolID;
const UserPoolClientID = process.env.UserPoolClientID;
async function addUserData(userData) {
  console.log("[INFO] addUserData input", userData);
  const params = {
    TableName: UserTable,
    Item: userData,
  };
  let Items = await dynamoDB.put(params).promise();
  console.log("[INFO] addUserData output", Items);
  return Items;
}
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
    };
    await cognito.confirmSignUp(params).promise();

    params = {
      UserPoolId: UserPoolID,
      AttributesToGet: ["email", "name", "sub"],
    };

    let res = await cognito.listUsers(params).promise();
    let user = {};
    let Attributes = {};
    res["Users"].map((ele) => {
      Attributes = ele["Attributes"].find(
        (ele) => ele.Name === "email" && ele.Value == event.emailId
      );
      if (Attributes !== undefined) {
        ele["Attributes"].map((ele) => {
          user[ele.Name] = ele.Value;
        });
      }
    });
    console.log(user);
    await addUserData(user);
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: res,
      }),
    };
    // await addUserData()
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 200,
      body: JSON.stringify(err),
    };
  }

  return response;
};
