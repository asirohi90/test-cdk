import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as rds from 'aws-cdk-lib/aws-rds';

// Define the properties for the EcsStack
interface EcsStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  queue: sqs.IQueue;
  db: rds.DatabaseCluster;
}

// Define a stack to create an ECS Fargate service with an application load balancer
export class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
    });

    // Create a Fargate service with an application load balancer
    const service =
      new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        'TestFargateService',
        {
          cluster,
          cpu: 256,
          memoryLimitMiB: 512,
          desiredCount: 1,
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset('docker/app'),
            environment: {
              QUEUE_URL: props.queue.queueUrl,
              DB_HOST: props.db.clusterEndpoint.hostname,
              DB_PORT: props.db.clusterEndpoint.port.toString(),
              DB_NAME: 'postgres',
              DB_USER: 'clusteradmin',
              DB_PASSWORD: props.db.secret?.secretValueFromJson('password').toString() || '',
            },
          },
          publicLoadBalancer: false,
        }
      );

    // Grant the ECS task role permissions to consume messages from the SQS queue
    props.queue.grantConsumeMessages(service.taskDefinition.taskRole);
    props.db.connections.allowFrom(
      service.service,
      ec2.Port.tcp(5432)
    );
  }
}
