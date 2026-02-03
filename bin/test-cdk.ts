#!/usr/bin/env node

// import necessary CDK libraries and stacks
import * as cdk from 'aws-cdk-lib/core';
import { NetworkStack } from '../lib/network-stack';
import { RdsStack } from '../lib/rds-stack';
import { SqsStack } from '../lib/sqs-stack';
import { EcsStack } from '../lib/test-cdk-stack';

const app = new cdk.App();

// Create the network stack
const network = new NetworkStack(app, 'NetworkStack');

// Create the SQS stack
const sqs = new SqsStack(app, 'SqsStack');

// Create the RDS stack
const rds = new RdsStack(app, 'RdsStack', {
  vpc: network.vpc,
});

// Create the ECS + ALB stack
new EcsStack(app, 'EcsAlbStack', {
  vpc: network.vpc,
  queue: sqs.queue,
  db: rds.database,
});