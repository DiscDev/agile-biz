---
title: "AWS Infrastructure - Shared Tool"
type: "shared-tool"
keywords: ["aws", "cloud", "ec2", "lambda", "s3", "rds", "iam", "cloudwatch", "dynamodb", "infrastructure"]
agents: ["developer", "devops", "dba", "api"]
token_count: 2144
---

# AWS Infrastructure - Shared Tool

## When to Load This Context
- **Keywords**: aws, cloud, ec2, lambda, s3, rds, iam, cloudwatch, dynamodb, infrastructure
- **Patterns**: "aws setup", "cloud infrastructure", "deploy to aws", "aws services"
- **Shared by**: DevOps, Developer, DBA, Security, Data Engineer agents

## AWS MCP Suite Overview

**AWS MCP Suite**: Comprehensive AWS service management with 35+ services
- **Setup Guide**: See `project-mcps/aws-mcp-setup.md` for configuration
- **Core Services**: EC2, Lambda, S3, DynamoDB, RDS, CloudWatch, IAM
- **Capabilities**: Infrastructure provisioning, serverless deployment, monitoring, security
- **Tools Available**: `iam_create_role`, `lambda_create_function`, `s3_create_bucket`, `cloudwatch_put_metric_alarm`
- **Benefits**: Complete cloud infrastructure automation with cost optimization

## Agent-Specific Usage

### For DevOps Agents
- Provision and manage cloud infrastructure
- Deploy applications using AWS services
- Set up monitoring, logging, and alerting
- Implement infrastructure as code with CloudFormation/CDK
- Manage auto-scaling and load balancing

### For Developer Agents
- Deploy applications to AWS services
- Configure serverless functions and APIs
- Set up development and staging environments
- Integrate with AWS SDKs and APIs
- Manage application secrets and configuration

### For DBA Agents
- Provision and manage RDS instances
- Configure database backups and monitoring
- Set up database migration and replication
- Implement database security and access controls
- Monitor database performance and costs

### For Security Agents
- Configure IAM roles and policies
- Set up VPC security and network isolation
- Implement encryption and key management
- Monitor security events and compliance
- Configure AWS security services (GuardDuty, CloudTrail)

### For Data Engineer Agents
- Set up data pipelines with AWS services
- Configure S3 data lakes and warehouses
- Deploy analytics and ML workloads
- Manage data processing with Lambda/EMR
- Implement data governance and security

## Core AWS Services

### Identity and Access Management (IAM)

#### Roles and Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-app-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/my-app-table"
    }
  ]
}
```

#### Service-Linked Roles
```bash
# Create role for Lambda function
aws iam create-role \
  --role-name lambda-execution-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {"Service": "lambda.amazonaws.com"},
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach managed policy
aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### Compute Services

#### EC2 Instance Management
```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --count 1 \
  --instance-type t3.micro \
  --key-name my-key-pair \
  --security-groups my-security-group \
  --subnet-id subnet-12345678 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MyWebServer}]'

# Create Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name my-asg \
  --launch-template LaunchTemplateName=my-template,Version=1 \
  --min-size 1 \
  --max-size 5 \
  --desired-capacity 2 \
  --vpc-zone-identifier subnet-12345678,subnet-87654321
```

#### Lambda Functions
```python
# Python Lambda function example
import json
import boto3

def lambda_handler(event, context):
    """
    Process S3 events and update DynamoDB
    """
    
    # Initialize AWS services
    s3 = boto3.client('s3')
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('file-processing-log')
    
    try:
        # Process each record in the event
        for record in event['Records']:
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            
            # Get object metadata
            response = s3.head_object(Bucket=bucket, Key=key)
            
            # Log to DynamoDB
            table.put_item(
                Item={
                    'file_key': key,
                    'bucket': bucket,
                    'size': response['ContentLength'],
                    'last_modified': response['LastModified'].isoformat(),
                    'processed_at': context.aws_request_id
                }
            )
        
        return {
            'statusCode': 200,
            'body': json.dumps('Successfully processed files')
        }
        
    except Exception as e:
        print(f'Error processing: {str(e)}')
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }
```

### Storage Services

#### S3 Configuration
```yaml
# CloudFormation template for S3 bucket
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  MyAppBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AWS::StackName}-app-storage'
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      LifecycleConfiguration:
        Rules:
          - Id: DeleteIncompleteMultipartUploads
            Status: Enabled
            AbortIncompleteMultipartUpload:
              DaysAfterInitiation: 7
          - Id: TransitionToIA
            Status: Enabled
            Transition:
              Days: 30
              StorageClass: STANDARD_IA
          - Id: TransitionToGlacier
            Status: Enabled
            Transition:
              Days: 90
              StorageClass: GLACIER
```

#### EBS Volumes
```bash
# Create and attach EBS volume
aws ec2 create-volume \
  --size 20 \
  --volume-type gp3 \
  --availability-zone us-east-1a \
  --encrypted \
  --tag-specifications 'ResourceType=volume,Tags=[{Key=Name,Value=MyAppVolume}]'

aws ec2 attach-volume \
  --volume-id vol-1234567890abcdef0 \
  --instance-id i-1234567890abcdef0 \
  --device /dev/sdf
```

### Database Services

#### RDS Configuration
```yaml
# RDS PostgreSQL instance
MyDatabase:
  Type: AWS::RDS::DBInstance
  Properties:
    DBInstanceIdentifier: !Sub '${AWS::StackName}-postgres'
    DBInstanceClass: db.t3.micro
    Engine: postgres
    EngineVersion: '13.13'
    MasterUsername: postgres
    MasterUserPassword: !Ref DatabasePassword
    AllocatedStorage: 20
    StorageType: gp2
    StorageEncrypted: true
    VPCSecurityGroups:
      - !Ref DatabaseSecurityGroup
    DBSubnetGroupName: !Ref DatabaseSubnetGroup
    BackupRetentionPeriod: 7
    MultiAZ: false
    PubliclyAccessible: false
    DeletionProtection: true
```

#### DynamoDB Tables
```python
import boto3

# Create DynamoDB table
dynamodb = boto3.resource('dynamodb')

table = dynamodb.create_table(
    TableName='UserProfiles',
    KeySchema=[
        {
            'AttributeName': 'user_id',
            'KeyType': 'HASH'
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'user_id',
            'AttributeType': 'S'
        }
    ],
    BillingMode='PAY_PER_REQUEST',
    StreamSpecification={
        'StreamEnabled': True,
        'StreamViewType': 'NEW_AND_OLD_IMAGES'
    },
    Tags=[
        {
            'Key': 'Environment',
            'Value': 'production'
        }
    ]
)
```

## Infrastructure as Code

### CloudFormation Templates
```yaml
# Complete application stack
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Web application infrastructure'

Parameters:
  Environment:
    Type: String
    Default: staging
    AllowedValues: [staging, production]

Resources:
  # VPC and Networking
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-vpc'

  PublicSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true

  PrivateSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']

  # Application Load Balancer
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      Subnets:
        - !Ref PublicSubnet
      SecurityGroups:
        - !Ref LoadBalancerSecurityGroup

  # Auto Scaling Group
  LaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    Properties:
      LaunchTemplateData:
        ImageId: ami-0abcdef1234567890
        InstanceType: t3.micro
        KeyName: !Ref KeyPairName
        SecurityGroupIds:
          - !Ref WebServerSecurityGroup
        UserData:
          Fn::Base64: !Sub |
            #!/bin/bash
            yum update -y
            yum install -y docker
            systemctl start docker
            systemctl enable docker
```

### CDK (Python Example)
```python
from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_rds as rds,
    aws_secretsmanager as secretsmanager
)

class MyAppStack(Stack):
    def __init__(self, scope, construct_id, **kwargs):
        super().__init__(scope, construct_id, **kwargs)
        
        # Create VPC
        vpc = ec2.Vpc(
            self, "MyAppVPC",
            max_azs=2,
            nat_gateways=1
        )
        
        # Create ECS Cluster
        cluster = ecs.Cluster(
            self, "MyAppCluster",
            vpc=vpc
        )
        
        # Create RDS Database
        database = rds.DatabaseInstance(
            self, "MyAppDatabase",
            engine=rds.DatabaseInstanceEngine.postgres(
                version=rds.PostgresEngineVersion.VER_13_13
            ),
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.T3, 
                ec2.InstanceSize.MICRO
            ),
            vpc=vpc,
            multi_az=False,
            allocated_storage=20,
            storage_encrypted=True,
            deletion_protection=True,
            backup_retention=7
        )
        
        # Create Fargate Service
        fargate_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "MyAppService",
            cluster=cluster,
            memory_limit_mib=512,
            cpu=256,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_registry("my-app:latest"),
                container_port=3000,
                environment={
                    "DATABASE_URL": database.instance_endpoint.socket_address
                }
            )
        )
```

## Monitoring and Observability

### CloudWatch Configuration
```yaml
# CloudWatch Alarms
HighCPUAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: !Sub '${Environment}-high-cpu'
    AlarmDescription: 'High CPU utilization'
    MetricName: CPUUtilization
    Namespace: AWS/EC2
    Statistic: Average
    Period: 300
    EvaluationPeriods: 2
    Threshold: 80
    ComparisonOperator: GreaterThanThreshold
    Dimensions:
      - Name: InstanceId
        Value: !Ref WebServerInstance
    AlarmActions:
      - !Ref SNSTopicArn

# Log Group
ApplicationLogGroup:
  Type: AWS::Logs::LogGroup
  Properties:
    LogGroupName: !Sub '/aws/lambda/${Environment}-app'
    RetentionInDays: 14
```

### X-Ray Tracing
```python
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

# Patch all AWS SDK calls
patch_all()

@xray_recorder.capture('database_query')
def query_database(user_id):
    """Query user data with X-Ray tracing"""
    
    # This will be automatically traced
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('users')
    
    response = table.get_item(
        Key={'user_id': user_id}
    )
    
    return response.get('Item')

@xray_recorder.capture('lambda_handler')
def lambda_handler(event, context):
    """Main Lambda handler with tracing"""
    
    user_id = event.get('user_id')
    
    # Add custom metadata
    xray_recorder.put_metadata('user_request', {
        'user_id': user_id,
        'request_id': context.aws_request_id
    })
    
    # Query database (traced)
    user_data = query_database(user_id)
    
    return {
        'statusCode': 200,
        'body': json.dumps(user_data)
    }
```

## Security Best Practices

### IAM Least Privilege
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::my-app-bucket/*"
      ],
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    },
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/my-app-table"
      ],
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:Attributes": [
            "user_id",
            "data",
            "timestamp"
          ]
        }
      }
    }
  ]
}
```

### VPC Security
```yaml
# Security Groups
WebServerSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for web servers
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 80
        ToPort: 80
        SourceSecurityGroupId: !Ref LoadBalancerSecurityGroup
      - IpProtocol: tcp
        FromPort: 443
        ToPort: 443
        SourceSecurityGroupId: !Ref LoadBalancerSecurityGroup
    SecurityGroupEgress:
      - IpProtocol: tcp
        FromPort: 443
        ToPort: 443
        CidrIp: 0.0.0.0/0  # HTTPS outbound
      - IpProtocol: tcp
        FromPort: 5432
        ToPort: 5432
        DestinationSecurityGroupId: !Ref DatabaseSecurityGroup

DatabaseSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for database
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 5432
        ToPort: 5432
        SourceSecurityGroupId: !Ref WebServerSecurityGroup
```

## Cost Optimization

### Reserved Instances and Savings Plans
```python
# Cost optimization script
import boto3
import json
from datetime import datetime, timedelta

def analyze_ec2_usage():
    """Analyze EC2 usage for Reserved Instance recommendations"""
    
    ec2 = boto3.client('ec2')
    ce = boto3.client('ce')
    
    # Get running instances
    instances = ec2.describe_instances(
        Filters=[
            {'Name': 'instance-state-name', 'Values': ['running']}
        ]
    )
    
    # Analyze usage patterns
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    usage = ce.get_usage_and_costs(
        TimePeriod={'Start': start_date, 'End': end_date},
        Granularity='DAILY',
        Metrics=['UsageQuantity', 'BlendedCost'],
        GroupBy=[
            {'Type': 'DIMENSION', 'Key': 'INSTANCE_TYPE'},
            {'Type': 'DIMENSION', 'Key': 'AVAILABILITY_ZONE'}
        ]
    )
    
    return {
        'instances': instances,
        'usage_data': usage,
        'recommendations': 'Consider Reserved Instances for consistent workloads'
    }

def implement_lifecycle_policies():
    """Implement S3 lifecycle policies for cost optimization"""
    
    s3 = boto3.client('s3')
    
    lifecycle_config = {
        'Rules': [
            {
                'ID': 'transition-rule',
                'Status': 'Enabled',
                'Filter': {'Prefix': 'logs/'},
                'Transitions': [
                    {
                        'Days': 30,
                        'StorageClass': 'STANDARD_IA'
                    },
                    {
                        'Days': 90,
                        'StorageClass': 'GLACIER'
                    },
                    {
                        'Days': 365,
                        'StorageClass': 'DEEP_ARCHIVE'
                    }
                ]
            }
        ]
    }
    
    return lifecycle_config
```

## Troubleshooting

### Common Issues and Solutions
```bash
# Check service health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:...

# View CloudWatch logs
aws logs tail /aws/lambda/my-function --follow

# Debug VPC connectivity
aws ec2 describe-vpc-endpoints
aws ec2 describe-route-tables
aws ec2 describe-security-groups

# Check IAM permissions
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:role/MyRole \
  --action-names s3:GetObject \
  --resource-arns arn:aws:s3:::my-bucket/my-key
```

### AWS CLI Configuration
```bash
# Configure AWS CLI
aws configure set region us-east-1
aws configure set output json

# Use named profiles
aws configure set profile.staging.region us-west-2
aws configure set profile.production.region us-east-1

# Assume roles
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/DeploymentRole \
  --role-session-name deployment-session
```

## Setup Requirements

### Prerequisites
- AWS account with appropriate permissions
- AWS CLI configured with credentials
- AWS MCP server configured in Claude Code
- Understanding of AWS service limits and pricing

### Required IAM Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "iam:ListRoles",
        "iam:PassRole",
        "s3:*",
        "lambda:*",
        "cloudformation:*",
        "logs:*",
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### Configuration
Location: `project-mcps/aws-mcp-setup.md`
- Contains step-by-step AWS MCP setup
- Includes credential configuration
- Provides service-specific setup guides
- Security best practices and compliance guidelines