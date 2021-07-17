import * as cdk from "monocdk"
import * as iam from "monocdk/aws-iam"
import * as dynamodb from "monocdk/aws-dynamodb"

export type CustomTableProps = dynamodb.TableProps & {
  readOnly: boolean
}

export class CustomTable extends dynamodb.Table {
  private readonly readOnly: boolean;

  constructor(scope: cdk.Construct, id: string, props: CustomTableProps) {
    super(scope, id, props)

    this.readOnly = props.readOnly
  }

  grantReadWriteData(grantee: iam.IGrantable): iam.Grant {
    return this.readOnly ? this.grantReadData(grantee) : super.grantReadWriteData(grantee)
  }

  grantFullAccess(grantee: iam.IGrantable): iam.Grant {
    return this.readOnly ? this.grantReadData(grantee) : super.grantFullAccess(grantee)
  }
}