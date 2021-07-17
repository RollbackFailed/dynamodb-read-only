'use strict';

const AWS = require("aws-sdk");
const DynamoDb = new AWS.DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env

exports.handler = async (event) => {
  const { messageId } = event.pathParameters;

  const result = await DynamoDb.get({
    TableName: TABLE_NAME,
    Key: {
      PK: messageId
    }
  }).promise()
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: result.Item.PK,
      message: result.Item.Message
    })
  };
};