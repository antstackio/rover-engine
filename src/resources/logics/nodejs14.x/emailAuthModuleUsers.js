let response;
const aws = require("aws-sdk");
const dynamoDB = new aws.DynamoDB.DocumentClient();
const UserTable = process.env.userinfoTable;
const UserPoolID = process.env.UserPoolID;
const UserPoolClientID = process.env.UserPoolClientID;
async function getUserData(id) {
  try {
    const params = {
      TableName: UserTable,
      Key: { email: id },
    };
    let { Item } = await dynamoDB.get(params).promise();
    console.log("[INFO] getUserData output", Item);
    return Item;
  } catch (err) {
    throw err;
  }
}
async function deleteUserData(id) {
  try {
    const params = {
      TableName: UserTable,
      Key: { email: id },
    };
    let { Item } = await dynamoDB.delete(params).promise();
    console.log("[INFO] getUserData output", Item);
    return Item;
  } catch (err) {
    throw err;
  }
}
async function addUserData(userData) {
  try {
    console.log("[INFO] addUserData input", userData);
    const params = {
      TableName: UserTable,
      Item: userData,
    };
    let Items = await dynamoDB.put(params).promise();
    console.log("[INFO] addUserData output", Items);
    return Items;
  } catch (err) {
    throw err;
  }
}
exports.lambdaHandler = async (event, context) => {
  try {
    let res;
    console.log("events ", event.pathParameters["email"]);
    if (event.httpMethod == "GET") {
      res = await getUserData(event.pathParameters["email"]);
    }
    if (event.httpMethod == "PUT") {
      if (event.body !== undefined) {
        event = JSON.parse(event.body);
      }
      res = await addUserData(event);
      res = { message: "data updated" };
    }
    if (event.httpMethod == "DELETE") {
      res = await deleteUserData(event.pathParameters["email"]);
      res = { message: "data deleted" };
    }
    response = {
      statusCode: 200,
      body: JSON.stringify({
        data: res,
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
