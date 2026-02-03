import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// Define the properties for the RdsStack
interface RdsStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

// Define a stack to create an RDS Aurora Postgres cluster
export class RdsStack extends cdk.Stack {
  public readonly database: rds.DatabaseCluster;

  // Stack constructor
  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    // Create a security group for the RDS cluster
    const securityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', { vpc: props.vpc });

    // Allow inbound traffic on port 5432 (Postgres) from within the VPC
    securityGroup.addIngressRule(ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.tcp(5432), 'Allow Postgres access from within VPC');

    // Create the RDS Aurora Postgres cluster
    this.database = new rds.DatabaseCluster(this, 'PostgresDBCluster', {
        // Using Aurora Postgres version 17.6
        engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_17_6}),
        // Credentials generated automatically with username 'clusteradmin'
        credentials: rds.Credentials.fromGeneratedSecret('clusteradmin'),

        // Instance configuration
        writer: rds.ClusterInstance.provisioned('writer', {
            publiclyAccessible: false,
        }),
        readers: [
            rds.ClusterInstance.provisioned('reader1', { promotionTier: 1 }),
            rds.ClusterInstance.provisioned('reader2'),
        ],
        subnetGroup: new rds.SubnetGroup(this, 'SubnetGroup', {
            vpc: props.vpc,
            description: 'Subnet group for RDS cluster',
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
        }),
        vpc: props.vpc,
        copyTagsToSnapshot: true,
        enableClusterLevelEnhancedMonitoring: true,
        deletionProtection: true,
        autoMinorVersionUpgrade: false,

        // Using default parameter group for Aurora Postgres 17, alternatively we can define custom parameters using parameters property
        parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql17'), // Alternatively, we can use parameters: { 'parameter_name': 'value'
        securityGroups: [securityGroup],
        monitoringInterval: cdk.Duration.seconds(60)
        });
  }
}