'use strict';

const AWS = require("aws-sdk");
const DynamoDb = new AWS.DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);

  const id = context.awsRequestId
  const { message } = body
  
  await DynamoDb.put({
    TableName: TABLE_NAME,
    Item: {
      PK: id,
      Message: message,
    }
  }).promise()
  
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      status: "created",
      data: {
        id,
        message
      }
    })
  };
  
  return response;
};