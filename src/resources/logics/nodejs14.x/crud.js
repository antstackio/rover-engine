let response;
const aws = require("aws-sdk");
const dynamoDB = new aws.DynamoDB.DocumentClient();
const Table = process.env.Table;

async function getData(id) {
  const params = {
    TableName: Table,
    Key: { id: id },
  };
  let { Item } = await dynamoDB.get(params).promise();
  console.log("[INFO] getData output", Item);
  return Item;
}
async function deleteData(id) {
  const params = {
    TableName: Table,
    Key: { id: id },
  };
  let { Item } = await dynamoDB.delete(params).promise();
  console.log("[INFO] getData output", Item);
  return Item;
}
async function addupdateData(userData) {
  console.log("[INFO] addupdateData input", userData);
  const params = {
    TableName: Table,
    Item: userData,
  };
  let Items = await dynamoDB.put(params).promise();
  console.log("[INFO] addupdateData output", Items);
  return Items;
}
exports.lambdaHandler = async (event) => {
  try {
    let res;
    console.log("events ");
    if (event.httpMethod == "POST") {
      if (event.body !== undefined) {
        event = JSON.parse(event.body);
      }
      await addupdateData(event);
      res = { message: "data updated" };
    }
    if (event.httpMethod == "GET") {
      res = await getData(event.pathParameters["id"]);
    }
    if (event.httpMethod == "PUT") {
      if (event.body !== undefined) {
        event = JSON.parse(event.body);
      }
      await addupdateData(event);
      res = { message: "data updated" };
    }
    if (event.httpMethod == "DELETE") {
      await deleteData(event.pathParameters["id"]);
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
