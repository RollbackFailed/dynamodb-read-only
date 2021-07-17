#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'monocdk';
import { ReadOnlyStack } from '../lib/read-only-stack';

const app = new cdk.App();

new ReadOnlyStack(app, 'ReadOnlyStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});
