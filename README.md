# DynamoDB ReadOnly

Describes a CDK app that allows to restrict write access in a DynamoDB table.

This repository is the result of a [Youtube video on Rollback Failed channel](https://youtu.be/cYVIjw_QSmk).

## Commands

```bash
 $ npm run cdk deploy -c readOnly=false # Deploy the system in ReadWrite mode
 $ npm run cdk deploy -c readOnly=true # Deploy the system in ReadOnly mode
 ```
 