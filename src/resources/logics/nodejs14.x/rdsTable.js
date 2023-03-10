// WE GOT THIS FROM THE LOGICS DIRECTORY
const secret = process.env.Secret;
const clustername = process.env.Clustername;
const region = process.env.Region;
const accountid = process.env.Accountid;
const DBname = process.env.DBname;
const data = require("data-api-client")({
  secretArn: secret,
  resourceArn:
    "arn:aws:rds:" + region + ":" + accountid + ":cluster:" + clustername,
  database: DBname // default database
});

async function createTable(TableName) {
  console.log(
    `CREATE TABLE IF NOT EXISTS ` +
      TableName +
      ` (
        name VARCHAR(100) NOT NULL,
        id VARCHAR(50) NOT NULL,
        PRIMARY KEY (id)
      )`
  );
  let response = await data.query(
    `CREATE TABLE IF NOT EXISTS ` +
      TableName +
      `(
        name VARCHAR(100) NOT NULL,
        id VARCHAR(50) NOT NULL,
        PRIMARY KEY (id)
      )`
  );
  return response;
}

async function insertData(values, params, TableName) {
  console.log(
    `INSERT INTO ` + TableName + params + ` VALUES(:name,:id) `,
    values
  );
  let response = await data.query(
    `INSERT INTO ` + TableName + params + ` VALUES(:name,:id) `,
    values
  );

  return response;
}

async function getData(TableName) {
  let response = await data.query(`SELECT * FROM ` + TableName);

  return response;
}

async function updateData(id, name, TableName) {
  let response = await data.query(
    `UPDATE ` + TableName + ` SET name = :name WHERE id = :id `,
    { name: name, id: id }
  );
  return response;
}

async function getDatabyID(id, TableName) {
  let response = await data.query(
    `SELECT * FROM ` + TableName + ` WHERE id = :id `,
    { id: id }
  );
  return response;
}

async function deleteDatabyID(id, TableName) {
  let response = await data.query(
    `DELETE FROM ` + TableName + ` WHERE id = :id `,
    { id: id }
  );
  return response;
}

exports.lambdaHandler = async (event) => {
  let TableName = "userk";
  let tablecreate = await createTable(TableName);
  console.log("table creation", tablecreate);
  let insertdata = await insertData(
    { name: "dgb", id: "32" },
    "(name,id)",
    TableName
  );
  console.log("insertData", insertdata);
  let getdata = await getData(TableName);
  console.log("getdata", getdata);
  let updatedata = await updateData("32", "DGB", TableName);
  console.log("updateData", updatedata);
  let getdatabyid = await getDatabyID("32", TableName);
  console.log("getDatabyID", getdatabyid);
  let deletedatabyid = await deleteDatabyID("32", TableName);
  console.log("deleteDatabyID", deletedatabyid);
};
