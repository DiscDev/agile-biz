# AWS MCP Servers Setup Guide

## Overview

AWS MCP (Model Context Protocol) servers provide a comprehensive suite of integrations enabling the Coder, DevOps, and API agents to interact directly with AWS services. With over 35 specialized MCP servers available, agents can manage infrastructure, deploy applications, monitor resources, and implement cloud-native solutions across the entire AWS ecosystem.

## What This Enables

With AWS MCP servers configured, agents can:
- 🏗️ **Infrastructure as Code** - Create and manage AWS resources programmatically
- 🚀 **Serverless Deployment** - Deploy Lambda functions, API Gateway, and more
- 📊 **Cloud Storage** - Manage S3 buckets, objects, and permissions
- 🗄️ **Database Management** - Work with DynamoDB, RDS, and other data services
- 🔐 **Security & IAM** - Configure users, roles, policies, and permissions
- 📈 **Monitoring & Logs** - Access CloudWatch metrics, logs, and alarms
- 🌐 **Networking** - Configure VPCs, load balancers, and CDN
- 🤖 **AI/ML Services** - Integrate with Bedrock, SageMaker, and AI tools
- 💰 **Cost Management** - Monitor and optimize AWS spending
- 🔄 **CI/CD Pipelines** - Implement with CodePipeline, CodeBuild

## Prerequisites

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured with credentials
3. **Claude Desktop**: MCP servers work with Claude Desktop app
4. **Node.js**: Version 18+ for MCP server installation
5. **AWS Credentials**: Access keys or IAM role configured

## Key AWS MCP Servers for AgileAiAgents

### 1. AWS Core MCP Server (Orchestrator)
- **Purpose**: Manages and coordinates other AWS MCP servers
- **Key Feature**: Automatic MCP Server Management
- **Use Case**: Centralized control of all AWS services

### 2. AWS IAM MCP Server (Security)
- **Purpose**: Identity and Access Management operations
- **Capabilities**: User/role management, policy creation, permission simulation
- **Use Case**: Security configuration and access control

### 3. AWS Lambda MCP Server (Serverless)
- **Purpose**: Deploy and manage serverless functions
- **Capabilities**: Function creation, invocation, configuration
- **Use Case**: Serverless application development

### 4. AWS S3 MCP Server (Storage)
- **Purpose**: Object storage management
- **Capabilities**: Bucket operations, file uploads/downloads, permissions
- **Use Case**: Static hosting, data storage, backups

### 5. AWS DynamoDB MCP Server (NoSQL Database)
- **Purpose**: Managed NoSQL database operations
- **Capabilities**: Table creation, CRUD operations, queries
- **Use Case**: Scalable application data storage

### 6. AWS CloudWatch MCP Server (Monitoring)
- **Purpose**: Monitoring and observability
- **Capabilities**: Metrics, logs, alarms, dashboards
- **Use Case**: Application monitoring and alerting

### 7. AWS EC2 MCP Server (Compute)
- **Purpose**: Virtual machine management
- **Capabilities**: Instance creation, management, scaling
- **Use Case**: Traditional server deployments

### 8. AWS RDS MCP Server (Relational Database)
- **Purpose**: Managed relational databases
- **Capabilities**: Database creation, backups, scaling
- **Use Case**: SQL database applications

## Step 1: Set Up AWS Credentials

### Option A: AWS CLI Configuration
```bash
# Configure AWS CLI with your credentials
aws configure

# Enter when prompted:
AWS Access Key ID: your-access-key-id
AWS Secret Access Key: your-secret-access-key
Default region name: us-east-1
Default output format: json
```

### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_DEFAULT_REGION=us-east-1
```

### Option C: IAM Role (For EC2/Lambda)
- Assign appropriate IAM role to your compute resource
- No explicit credentials needed

## Step 2: Install AWS Core MCP Server

The Core MCP Server is the foundation that manages other AWS MCP servers:

```bash
# Install using UVX (recommended)
uvx mcp-server-aws-core

# Or install globally with npm
npm install -g @aws/mcp-server-core
```

## Step 3: Configure Claude Desktop

Add AWS MCP servers to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "aws-core": {
      "command": "uvx",
      "args": ["mcp-server-aws-core"],
      "env": {
        "AWS_REGION": "us-east-1"
      }
    },
    "aws-iam": {
      "command": "uvx",
      "args": ["mcp-server-aws-iam"],
      "env": {
        "AWS_REGION": "us-east-1",
        "READ_ONLY_MODE": "false"
      }
    },
    "aws-lambda": {
      "command": "uvx",
      "args": ["mcp-server-aws-lambda-tool"],
      "env": {
        "AWS_REGION": "us-east-1",
        "FUNCTION_NAME_FILTER": "myapp-*"
      }
    },
    "aws-s3": {
      "command": "uvx",
      "args": ["mcp-server-aws-s3"],
      "env": {
        "AWS_REGION": "us-east-1"
      }
    },
    "aws-dynamodb": {
      "command": "uvx",
      "args": ["mcp-server-aws-dynamodb"],
      "env": {
        "AWS_REGION": "us-east-1"
      }
    },
    "aws-cloudwatch": {
      "command": "uvx",
      "args": ["mcp-server-aws-cloudwatch"],
      "env": {
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

## Step 4: Update AgileAiAgents .env File

Add AWS configuration to the `.env` file:

```bash
# AWS MCP Configuration
AWS_MCP_ENABLED=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Optional: Specific service configurations
AWS_S3_DEFAULT_BUCKET=my-project-bucket
AWS_LAMBDA_FUNCTION_PREFIX=myapp-
AWS_DYNAMODB_TABLE_PREFIX=myapp-
AWS_CLOUDWATCH_LOG_GROUP=/aws/lambda/myapp

# IAM MCP Configuration
AWS_IAM_READ_ONLY=false  # Set to true for safer exploration

# Cost Management
AWS_BUDGET_ALERT_THRESHOLD=100  # Alert when spending exceeds $100
```

## Available MCP Tools by Service

### AWS Core MCP Tools

#### **aws_list_services**
List all available AWS services
```
Example: Show all configured AWS services
```

#### **aws_manage_servers**
Manage other AWS MCP servers
```
Parameters:
- action: start, stop, restart, status
- server: Service name (s3, lambda, etc.)
Example: Start S3 MCP server
```

### AWS IAM MCP Tools

#### **iam_create_user**
Create new IAM user
```
Parameters:
- userName: User name
- path: Optional path
- tags: Optional tags
Example: Create deployment user
```

#### **iam_create_role**
Create IAM role
```
Parameters:
- roleName: Role name
- assumeRolePolicyDocument: Trust policy
- description: Role description
Example: Create Lambda execution role
```

#### **iam_attach_policy**
Attach policy to user/role
```
Parameters:
- policyArn: Policy ARN
- targetType: user or role
- targetName: User/role name
Example: Attach S3 access policy
```

#### **iam_simulate_policy**
Test IAM permissions
```
Parameters:
- policySourceArn: User/role ARN
- actionNames: Actions to test
- resourceArns: Resources to test against
Example: Test S3 bucket access
```

### AWS Lambda MCP Tools

#### **lambda_create_function**
Create Lambda function
```
Parameters:
- functionName: Function name
- runtime: Node.js, Python, etc.
- handler: Entry point
- code: Function code or S3 location
- role: Execution role ARN
Example: Deploy API endpoint function
```

#### **lambda_invoke_function**
Execute Lambda function
```
Parameters:
- functionName: Function to invoke
- payload: Input data
- invocationType: Sync or async
Example: Test function with sample data
```

#### **lambda_update_function**
Update function code/config
```
Parameters:
- functionName: Function name
- code: New code
- configuration: Memory, timeout, etc.
Example: Deploy new version
```

### AWS S3 MCP Tools

#### **s3_create_bucket**
Create S3 bucket
```
Parameters:
- bucketName: Unique bucket name
- region: AWS region
- acl: Access control
Example: Create website hosting bucket
```

#### **s3_upload_object**
Upload file to S3
```
Parameters:
- bucket: Bucket name
- key: Object path
- body: File content
- contentType: MIME type
Example: Upload website assets
```

#### **s3_list_objects**
List bucket contents
```
Parameters:
- bucket: Bucket name
- prefix: Filter prefix
- maxKeys: Result limit
Example: List all images
```

#### **s3_configure_website**
Enable static hosting
```
Parameters:
- bucket: Bucket name
- indexDocument: Index file
- errorDocument: Error file
Example: Configure React app hosting
```

### AWS DynamoDB MCP Tools

#### **dynamodb_create_table**
Create DynamoDB table
```
Parameters:
- tableName: Table name
- keySchema: Primary key definition
- attributeDefinitions: Attributes
- billingMode: PAY_PER_REQUEST or PROVISIONED
Example: Create user sessions table
```

#### **dynamodb_put_item**
Insert/update item
```
Parameters:
- tableName: Table name
- item: Item data
- conditionExpression: Optional condition
Example: Save user profile
```

#### **dynamodb_query**
Query table data
```
Parameters:
- tableName: Table name
- keyConditionExpression: Query condition
- expressionAttributeValues: Parameters
Example: Get user's orders
```

### AWS CloudWatch MCP Tools

#### **cloudwatch_put_metric_alarm**
Create monitoring alarm
```
Parameters:
- alarmName: Alarm name
- metricName: Metric to monitor
- threshold: Alert threshold
- comparisonOperator: >, <, etc.
Example: Alert on high error rate
```

#### **cloudwatch_get_logs**
Retrieve log entries
```
Parameters:
- logGroupName: Log group
- startTime: Begin timestamp
- endTime: End timestamp
- filterPattern: Search pattern
Example: Find error messages
```

## Agent Workflows with AWS MCP

### For DevOps Agent - Infrastructure Management

1. **Environment Setup**
   ```
   - Use iam_create_role for service roles
   - Configure VPC with EC2 MCP
   - Set up security groups and networking
   - Create S3 buckets for artifacts
   ```

2. **Deployment Pipeline**
   ```
   - Create CodePipeline with Pipeline MCP
   - Configure CodeBuild projects
   - Set up deployment stages
   - Implement blue/green deployments
   ```

3. **Monitoring Setup**
   ```
   - Create CloudWatch dashboards
   - Set up log aggregation
   - Configure alarms for key metrics
   - Implement distributed tracing
   ```

### For Coder Agent - Application Development

1. **Serverless Development**
   ```
   - Create Lambda functions
   - Configure API Gateway endpoints
   - Set up DynamoDB tables
   - Implement event-driven architecture
   ```

2. **Storage Integration**
   ```
   - Create S3 buckets for uploads
   - Implement presigned URLs
   - Configure CloudFront CDN
   - Set up lifecycle policies
   ```

3. **Database Operations**
   ```
   - Design DynamoDB schemas
   - Create RDS instances
   - Implement data access layers
   - Configure backups and replication
   ```

### For API Agent - Integration Development

1. **API Gateway Setup**
   ```
   - Create REST/WebSocket APIs
   - Configure routes and methods
   - Set up authorization
   - Implement request/response mappings
   ```

2. **Service Integration**
   ```
   - Connect to SQS/SNS for messaging
   - Integrate with Step Functions
   - Set up EventBridge rules
   - Implement service mesh
   ```

## Example Agent Prompts

### Infrastructure Deployment
```
Acting as the DevOps Agent, use AWS MCP servers to:
1. Create a VPC with public/private subnets
2. Deploy an ECS cluster for container workloads
3. Set up RDS PostgreSQL with Multi-AZ
4. Configure CloudWatch monitoring and alarms
5. Implement auto-scaling policies
```

### Serverless Application
```
Acting as the Coder Agent, use AWS MCP to build:
1. Lambda functions for API endpoints
2. DynamoDB tables for data storage
3. S3 bucket for file uploads with presigned URLs
4. API Gateway with authentication
5. CloudWatch logs and monitoring
```

### CI/CD Pipeline
```
Acting as the DevOps Agent, implement CI/CD:
1. CodeCommit repository setup
2. CodeBuild project for testing
3. CodePipeline for orchestration
4. Lambda deployment automation
5. CloudFormation for infrastructure as code
```

## Best Practices

### Security
1. **Least Privilege**: Grant minimal required permissions
2. **Credential Rotation**: Regularly rotate access keys
3. **MFA**: Enable multi-factor authentication
4. **Encryption**: Use KMS for sensitive data
5. **Audit**: Enable CloudTrail logging

### Cost Optimization
1. **Resource Tagging**: Tag all resources for tracking
2. **Auto-shutdown**: Implement schedules for dev resources
3. **Right-sizing**: Monitor and adjust resource sizes
4. **Reserved Instances**: Use for predictable workloads
5. **Cost Alerts**: Set up billing alarms

### Performance
1. **Region Selection**: Choose closest region to users
2. **Caching**: Implement CloudFront and ElastiCache
3. **Database Optimization**: Use read replicas
4. **Async Processing**: Use SQS/SNS for decoupling
5. **Monitoring**: Track performance metrics

## Troubleshooting

### Authentication Issues
- Verify AWS credentials are correct
- Check IAM permissions for required actions
- Ensure MCP server has credential access
- Test with AWS CLI first

### Permission Denied Errors
- Review IAM policies attached to user/role
- Use iam_simulate_policy to test permissions
- Check resource-based policies (S3 bucket policies)
- Verify service control policies (SCPs)

### Service Limits
- Check AWS service quotas
- Request limit increases if needed
- Implement retry logic with backoff
- Use service quotas API for monitoring

### MCP Connection Issues
- Verify MCP server is running
- Check Claude Desktop configuration
- Review server logs for errors
- Ensure network connectivity

## Complete AWS Service List

AWS MCP supports 35+ services including:
- **Compute**: EC2, Lambda, ECS, EKS, Batch
- **Storage**: S3, EBS, EFS, Storage Gateway
- **Database**: RDS, DynamoDB, ElastiCache, Neptune
- **Networking**: VPC, CloudFront, Route 53, API Gateway
- **Security**: IAM, KMS, Secrets Manager, GuardDuty
- **Management**: CloudWatch, CloudTrail, Systems Manager
- **Analytics**: Athena, Kinesis, QuickSight, EMR
- **AI/ML**: Bedrock, SageMaker, Comprehend, Rekognition
- **Application**: SQS, SNS, Step Functions, EventBridge

## Integration with AgileAiAgents

Once configured, agents will automatically:

### DevOps Agent
1. **Provision infrastructure** using CloudFormation/CDK
2. **Deploy applications** to various compute services
3. **Configure monitoring** with CloudWatch
4. **Implement security** best practices
5. **Manage costs** with budgets and optimization

### Coder Agent
1. **Develop serverless** applications with Lambda
2. **Integrate databases** (RDS, DynamoDB)
3. **Implement storage** solutions with S3
4. **Build APIs** with API Gateway
5. **Handle events** with EventBridge

### API Agent
1. **Design RESTful APIs** with API Gateway
2. **Implement GraphQL** with AppSync
3. **Create webhooks** with Lambda
4. **Manage queues** with SQS/SNS
5. **Build integrations** with Step Functions

Results are saved to:
```
agile-ai-agents/project-documents/
├── 10-environment/
│   ├── aws-infrastructure.yaml
│   ├── cloudformation-templates/
│   └── terraform-configs/
├── 13-implementation/
│   ├── lambda-functions/
│   ├── api-definitions/
│   └── database-schemas/
└── 15-deployment/
    ├── deployment-scripts/
    ├── monitoring-setup/
    └── security-policies/
```

## Security Considerations

- **Never commit AWS credentials** to version control
- **Use IAM roles** instead of access keys when possible
- **Enable MFA** for all user accounts
- **Implement least privilege** access policies
- **Rotate credentials** regularly
- **Monitor with CloudTrail** for audit logs
- **Use AWS Secrets Manager** for sensitive data
- **Enable GuardDuty** for threat detection

## Additional Resources

- **AWS MCP Documentation**: https://awslabs.github.io/mcp/
- **Individual Server Docs**: https://github.com/awslabs/mcp-servers
- **AWS Documentation**: https://docs.aws.amazon.com/
- **AWS Well-Architected**: https://aws.amazon.com/architecture/well-architected/
- **AWS Best Practices**: https://aws.amazon.com/architecture/best-practices/

This comprehensive AWS MCP integration empowers AgileAiAgents to build, deploy, and manage complete cloud-native applications on AWS!