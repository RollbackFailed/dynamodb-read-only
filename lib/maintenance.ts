import * as apigateway from "monocdk/aws-apigateway"

export class MaintenanceIntegration extends apigateway.MockIntegration {
  constructor() {
    super({
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      requestTemplates: {
        "application/json": `{ "statusCode": 503 }`
      },
      integrationResponses: [
        {
          statusCode: "503",
          responseTemplates: {
            "application/json": JSON.stringify({
              error: {
                message: "system is in read-only mode"
              }
            })
          }
        }
      ]
    })
  }

  get methodOptions(): apigateway.MethodOptions {
    return {
      methodResponses: [
        {
          statusCode: "503",
          responseModels: {
            "application/json": apigateway.Model.EMPTY_MODEL
          }
        }
      ]
    }
  }
}