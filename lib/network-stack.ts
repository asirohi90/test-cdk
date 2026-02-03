import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// Define a stack to create a VPC with specific configurations
export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  // Stack constructor
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC with 3 availability zones and 1 NAT gateway
    this.vpc = new ec2.Vpc(this, 'ApplicationVpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 3,
      natGateways: 1,
    });
    this.vpc.addFlowLog('FlowLogS3', {
    destination: ec2.FlowLogDestination.toS3(),
    trafficType: ec2.FlowLogTrafficType.ALL
   });
  }
}
