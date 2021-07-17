import * as path from "path";

import * as cdk from 'monocdk';
import * as ApiGateway from 'monocdk/aws-apigateway';
import * as lambda from 'monocdk/aws-lambda';
import * as dynamodb from 'monocdk/aws-dynamodb';
import * as sqs from 'monocdk/aws-sqs';
import * as eventSource from 'monocdk/aws-lambda-event-sources';

import { MaintenanceIntegration } from "./maintenance";
import { CustomTable } from "./custom-table";

export class ReadOnlyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const readOnly = (this.node.tryGetContext("readOnly") as string).toLowerCase() === "true"

    ///////////////////////////////////////////
    ///             API
    ///////////////////////////////////////////
    const api = new ApiGateway.RestApi(this, "API")

    const table = new CustomTable(this, "MessagesTable", {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      readOnly
    })

    const readLambda = new lambda.Function(this, "readLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/")),
      handler: "read.handler",
      environment: {
        TABLE_NAME: table.tableName
      },
    })
    
    const writeLambda = new lambda.Function(this, "writeLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/")),
      handler: "write.handler",
      environment: {
        TABLE_NAME: table.tableName
      }
    })

    table.grantReadData(readLambda);
    table.grantReadWriteData(writeLambda);

    const messages = api.root.addResource("messages")

    /**
     * GET /messages/{messageId}
     */
    messages.addResource("{messageId}").addMethod("GET", new ApiGateway.LambdaIntegration(readLambda))

    /**
     * POST /messages
     */
    if (readOnly) {
      const maintenanceInteg = new MaintenanceIntegration()
      messages.addMethod("POST", maintenanceInteg, maintenanceInteg.methodOptions)  
    } else {
      messages.addMethod("POST", new ApiGateway.LambdaIntegration(writeLambda))
    }
    
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url
    })

    ///////////////////////////////////////////
    ///             SQS
    ///////////////////////////////////////////
    const queue = new sqs.Queue(this, "Queue")

    const processQueueLambda = new lambda.Function(this, "processQueue", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/")),
      handler: "processQueue.handler",
      environment: {
        TABLE_NAME: table.tableName
      }
    })
    
    table.grantReadWriteData(processQueueLambda)
    processQueueLambda.addEventSource(new eventSource.SqsEventSource(queue, {
      enabled: !readOnly
    }))

    new cdk.CfnOutput(this, "QueueUrl", {
      value: queue.queueUrl
    })
  }
}