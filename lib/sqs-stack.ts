import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

// Define a stack to create an SQS queue
export class SqsStack extends cdk.Stack {
  public readonly queue: sqs.Queue;

  // Stack constructor
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an SQS queue with a visibility timeout of 30 seconds
    this.queue = new sqs.Queue(this, 'EventQueue', {
      visibilityTimeout: cdk.Duration.seconds(30),
    });
  }
}
