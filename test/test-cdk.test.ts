import { App, SecretValue } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NetworkStack } from '../lib/network-stack';
import { EcsStack } from '../lib/test-cdk-stack';
import { SqsStack } from '../lib/sqs-stack';

test('ECS Service Created', () => {
  const app = new App();
  const network = new NetworkStack(app, 'TestNetwork');
  const sqs = new SqsStack(app, 'TestSqs');
  
  // Create a mock database object with the required properties
  const mockSecret = {
    secretValueFromJson: (key: string) => SecretValue.unsafePlainText('test-password')
  };
  
  // Mock database cluster to avoid cyclic dependency issues
  const mockDb = {
    clusterEndpoint: {
      hostname: 'mock-db-host',
      port: 5432,
      toString: () => '5432'
    },
    secret: mockSecret,
    connections: {
      allowFrom: () => {} 
    }
  } as any;
  
  // Create the ECS stack with the mock database
  const stack = new EcsStack(app, 'TestEcs', {
    vpc: network.vpc,
    queue: sqs.queue,
    db: mockDb,
  });

  // Assert that the ECS Service and related resources are created
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::ECS::Service', 1);
  template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
  template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
  template.resourceCountIs('AWS::IAM::Role', 2);
  template.resourceCountIs('AWS::IAM::Policy', 2);
  template.resourceCountIs('AWS::ElasticLoadBalancingV2::Listener', 1);
  template.resourceCountIs('AWS::EC2::SecurityGroup', 2);
  template.resourceCountIs('AWS::Logs::LogGroup', 1);
});
