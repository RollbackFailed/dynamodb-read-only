'use strict';

const AWS = require("aws-sdk");
const DynamoDb = new AWS.DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env

exports.handler = async (event) => {
  for (const record of event.Records) {
    const { body, messageId } = record

    const id = messageId
    const message = JSON.parse(body).message
    
    await DynamoDb.put({
      TableName: TABLE_NAME,
      Item: {
        PK: id,
        Message: message,
      }
    }).promise()
  }
  
  return {
    statusCode: 200,
  };
};