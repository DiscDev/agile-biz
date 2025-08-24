---
title: "Infrastructure Management - DevOps Agent Context"
type: "agent-context"
agent: "devops"
keywords: ["infrastructure", "terraform", "cloudformation", "provisioning", "iac", "cloud", "resources"]
token_count: 2176
---

# Infrastructure Management - DevOps Agent Context

## When to Load This Context
- **Keywords**: infrastructure, terraform, cloudformation, provisioning, iac, cloud, resources
- **Patterns**: "provision infrastructure", "terraform setup", "infrastructure as code", "cloud resources"

## Infrastructure as Code (IaC)

### Terraform Configuration
```hcl
# main.tf - Complete application infrastructure
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

# Public Subnet
resource "aws_subnet" "public" {
  count = length(var.availability_zones)
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "${var.environment}-public-${count.index + 1}"
    Environment = var.environment
    Type        = "Public"
  }
}

# Private Subnet  
resource "aws_subnet" "private" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name        = "${var.environment}-private-${count.index + 1}"
    Environment = var.environment
    Type        = "Private"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = aws_subnet.public[*].id
  
  enable_deletion_protection = var.environment == "production"
  
  tags = {
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.environment}-cluster"
  
  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs.name
      }
    }
  }
  
  tags = {
    Environment = var.environment
  }
}
```

### CloudFormation Templates
```yaml
# infrastructure.yaml - CloudFormation stack
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Complete application infrastructure stack'

Parameters:
  Environment:
    Type: String
    Default: staging
    AllowedValues: [development, staging, production]
  
  InstanceType:
    Type: String
    Default: t3.micro
    AllowedValues: [t3.micro, t3.small, t3.medium]

Mappings:
  EnvironmentMap:
    development:
      MinSize: 1
      MaxSize: 2
      DesiredCapacity: 1
    staging:
      MinSize: 1
      MaxSize: 3
      DesiredCapacity: 2
    production:
      MinSize: 2
      MaxSize: 10
      DesiredCapacity: 3

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
        - Key: Environment
          Value: !Ref Environment

  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-igw'

  AttachGateway:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref InternetGateway

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub '${Environment}-alb'
      Type: application
      Scheme: internet-facing
      Subnets:
        - !Ref PublicSubnetA
        - !Ref PublicSubnetB
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Tags:
        - Key: Environment
          Value: !Ref Environment

  # Auto Scaling Group
  LaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    Properties:
      LaunchTemplateName: !Sub '${Environment}-template'
      LaunchTemplateData:
        ImageId: ami-0abcdef1234567890
        InstanceType: !Ref InstanceType
        KeyName: !Ref KeyPairName
        SecurityGroupIds:
          - !Ref InstanceSecurityGroup
        IamInstanceProfile:
          Arn: !GetAtt InstanceProfile.Arn
        UserData:
          Fn::Base64: !Sub |
            #!/bin/bash
            yum update -y
            yum install -y docker
            systemctl start docker
            systemctl enable docker
            
            # Configure dynamic port allocation
            echo "PORT=${PORT:-3000}" >> /etc/environment
            
            # Start application
            docker run -d \
              -p ${PORT:-3000}:3000 \
              -e NODE_ENV=${Environment} \
              myapp:latest

  AutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      AutoScalingGroupName: !Sub '${Environment}-asg'
      VPCZoneIdentifier:
        - !Ref PrivateSubnetA
        - !Ref PrivateSubnetB
      LaunchTemplate:
        LaunchTemplateId: !Ref LaunchTemplate
        Version: !GetAtt LaunchTemplate.LatestVersionNumber
      MinSize: !FindInMap [EnvironmentMap, !Ref Environment, MinSize]
      MaxSize: !FindInMap [EnvironmentMap, !Ref Environment, MaxSize]
      DesiredCapacity: !FindInMap [EnvironmentMap, !Ref Environment, DesiredCapacity]
      TargetGroupARNs:
        - !Ref TargetGroup
      HealthCheckType: ELB
      HealthCheckGracePeriod: 300
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-instance'
          PropagateAtLaunch: true
        - Key: Environment
          Value: !Ref Environment
          PropagateAtLaunch: true

Outputs:
  VPCId:
    Description: VPC ID
    Value: !Ref VPC
    Export:
      Name: !Sub '${Environment}-VPC-ID'

  LoadBalancerDNS:
    Description: Load Balancer DNS Name
    Value: !GetAtt ApplicationLoadBalancer.DNSName
    Export:
      Name: !Sub '${Environment}-ALB-DNS'
```

## Environment Management

### Multi-Environment Configuration
```bash
#!/bin/bash
# deploy-infrastructure.sh - Environment deployment script

set -e

ENVIRONMENT=${1:-staging}
REGION=${2:-us-east-1}
STACK_NAME="${ENVIRONMENT}-infrastructure"

echo "Deploying infrastructure for ${ENVIRONMENT} environment..."

# Validate template
aws cloudformation validate-template \
  --template-body file://infrastructure.yaml \
  --region ${REGION}

# Deploy stack
aws cloudformation deploy \
  --template-file infrastructure.yaml \
  --stack-name ${STACK_NAME} \
  --parameter-overrides \
    Environment=${ENVIRONMENT} \
    InstanceType=t3.micro \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ${REGION} \
  --tags \
    Environment=${ENVIRONMENT} \
    ManagedBy=CloudFormation

# Get outputs
aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --region ${REGION} \
  --query 'Stacks[0].Outputs' \
  --output table

echo "Infrastructure deployment complete for ${ENVIRONMENT}"
```

### Environment Configuration Files
```yaml
# environments/development.yaml
environment: development
region: us-east-1
instance_type: t3.micro
min_capacity: 1
max_capacity: 2
desired_capacity: 1

# Database configuration
database:
  engine: postgres
  instance_class: db.t3.micro
  allocated_storage: 20
  multi_az: false

# Load balancer configuration
load_balancer:
  type: application
  scheme: internet-facing
  idle_timeout: 60

# Auto scaling configuration
auto_scaling:
  scale_up_threshold: 70
  scale_down_threshold: 30
  scale_up_adjustment: 1
  scale_down_adjustment: -1
```

## Dynamic Port Management

### Container Port Configuration
```yaml
# docker-compose.yml with dynamic ports
version: '3.8'
services:
  app:
    build: .
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      - PORT=3000
      - NODE_ENV=${NODE_ENV:-development}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "${NGINX_PORT:-80}:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    environment:
      - UPSTREAM_SERVER=app:3000
```

### Kubernetes Dynamic Port Configuration
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: node-env
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  node-env: "production"
  database-url: "postgresql://prod-db:5432/myapp"
```

## Resource Optimization

### Cost Management
```python
# cost-optimization.py
import boto3
import json
from datetime import datetime, timedelta

class CostOptimizer:
    def __init__(self, region='us-east-1'):
        self.ec2 = boto3.client('ec2', region_name=region)
        self.ce = boto3.client('ce', region_name=region)
        self.region = region

    def analyze_unused_resources(self):
        """Find unused resources to reduce costs"""
        
        unused_resources = {
            'ebs_volumes': [],
            'elastic_ips': [],
            'load_balancers': [],
            'nat_gateways': []
        }
        
        # Find unattached EBS volumes
        volumes = self.ec2.describe_volumes(
            Filters=[
                {'Name': 'status', 'Values': ['available']}
            ]
        )
        
        for volume in volumes['Volumes']:
            unused_resources['ebs_volumes'].append({
                'volume_id': volume['VolumeId'],
                'size': volume['Size'],
                'volume_type': volume['VolumeType'],
                'created': volume['CreateTime'].isoformat()
            })
        
        # Find unassociated Elastic IPs
        addresses = self.ec2.describe_addresses()
        
        for address in addresses['Addresses']:
            if 'InstanceId' not in address:
                unused_resources['elastic_ips'].append({
                    'allocation_id': address['AllocationId'],
                    'public_ip': address['PublicIp']
                })
        
        return unused_resources

    def get_rightsizing_recommendations(self):
        """Get EC2 rightsizing recommendations"""
        
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        try:
            response = self.ce.get_rightsizing_recommendation(
                Service='AmazonEC2',
                Configuration={
                    'BenefitsConsidered': True,
                    'RecommendationTarget': 'SAME_INSTANCE_FAMILY'
                }
            )
            
            return response['RightsizingRecommendations']
        except Exception as e:
            print(f"Error getting rightsizing recommendations: {e}")
            return []

    def implement_lifecycle_policies(self, bucket_name):
        """Implement S3 lifecycle policies"""
        
        s3 = boto3.client('s3')
        
        lifecycle_config = {
            'Rules': [
                {
                    'ID': 'cost-optimization-rule',
                    'Status': 'Enabled',
                    'Filter': {'Prefix': ''},
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
                    ],
                    'Expiration': {
                        'Days': 2555  # 7 years
                    }
                }
            ]
        }
        
        s3.put_bucket_lifecycle_configuration(
            Bucket=bucket_name,
            LifecycleConfiguration=lifecycle_config
        )
        
        return lifecycle_config

# Usage example
if __name__ == "__main__":
    optimizer = CostOptimizer()
    
    # Analyze unused resources
    unused = optimizer.analyze_unused_resources()
    print(json.dumps(unused, indent=2, default=str))
    
    # Get rightsizing recommendations
    recommendations = optimizer.get_rightsizing_recommendations()
    print(f"Found {len(recommendations)} rightsizing recommendations")
```

### Auto Scaling Configuration
```yaml
# auto-scaling-policy.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
```

## Disaster Recovery

### Backup Strategies
```bash
#!/bin/bash
# backup-strategy.sh - Comprehensive backup automation

set -e

ENVIRONMENT=${1:-production}
BACKUP_RETENTION_DAYS=${2:-30}
S3_BACKUP_BUCKET="myapp-backups-${ENVIRONMENT}"

echo "Starting backup process for ${ENVIRONMENT} environment..."

# Database backup
backup_database() {
    echo "Creating database backup..."
    
    DB_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier "${ENVIRONMENT}-database" \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text)
    
    BACKUP_FILE="database-backup-$(date +%Y%m%d-%H%M%S).sql"
    
    pg_dump -h ${DB_ENDPOINT} -U postgres -d myapp > /tmp/${BACKUP_FILE}
    
    # Upload to S3
    aws s3 cp /tmp/${BACKUP_FILE} s3://${S3_BACKUP_BUCKET}/database/${BACKUP_FILE}
    
    # Clean up local file
    rm /tmp/${BACKUP_FILE}
    
    echo "Database backup completed: ${BACKUP_FILE}"
}

# Application data backup
backup_application_data() {
    echo "Creating application data backup..."
    
    # Backup user uploads
    aws s3 sync s3://myapp-uploads-${ENVIRONMENT}/ \
        s3://${S3_BACKUP_BUCKET}/uploads/$(date +%Y%m%d)/ \
        --delete
    
    # Backup configuration
    kubectl get configmaps -o yaml > /tmp/configmaps-backup.yaml
    kubectl get secrets -o yaml > /tmp/secrets-backup.yaml
    
    aws s3 cp /tmp/configmaps-backup.yaml \
        s3://${S3_BACKUP_BUCKET}/k8s/configmaps-$(date +%Y%m%d).yaml
    aws s3 cp /tmp/secrets-backup.yaml \
        s3://${S3_BACKUP_BUCKET}/k8s/secrets-$(date +%Y%m%d).yaml
    
    rm /tmp/configmaps-backup.yaml /tmp/secrets-backup.yaml
    
    echo "Application data backup completed"
}

# Infrastructure state backup
backup_infrastructure() {
    echo "Creating infrastructure backup..."
    
    # Backup Terraform state
    aws s3 cp s3://myapp-terraform-state/infrastructure/terraform.tfstate \
        s3://${S3_BACKUP_BUCKET}/terraform/terraform-$(date +%Y%m%d).tfstate
    
    # Export CloudFormation templates
    aws cloudformation get-template \
        --stack-name "${ENVIRONMENT}-infrastructure" \
        --query 'TemplateBody' > /tmp/infrastructure-template.json
    
    aws s3 cp /tmp/infrastructure-template.json \
        s3://${S3_BACKUP_BUCKET}/cloudformation/infrastructure-$(date +%Y%m%d).json
    
    rm /tmp/infrastructure-template.json
    
    echo "Infrastructure backup completed"
}

# Cleanup old backups
cleanup_old_backups() {
    echo "Cleaning up old backups..."
    
    CUTOFF_DATE=$(date -d "${BACKUP_RETENTION_DAYS} days ago" +%Y-%m-%d)
    
    aws s3api list-objects-v2 \
        --bucket ${S3_BACKUP_BUCKET} \
        --query "Contents[?LastModified<='${CUTOFF_DATE}'].Key" \
        --output text | \
    while read -r key; do
        if [[ -n "$key" ]]; then
            aws s3 rm s3://${S3_BACKUP_BUCKET}/${key}
            echo "Deleted old backup: ${key}"
        fi
    done
}

# Main backup execution
main() {
    backup_database
    backup_application_data
    backup_infrastructure
    cleanup_old_backups
    
    echo "Backup process completed successfully"
    
    # Send notification
    aws sns publish \
        --topic-arn arn:aws:sns:us-east-1:123456789012:backup-notifications \
        --message "Backup completed successfully for ${ENVIRONMENT} environment"
}

main
```

## Troubleshooting

### Infrastructure Debugging
```bash
#!/bin/bash
# debug-infrastructure.sh - Infrastructure troubleshooting

check_ec2_health() {
    echo "Checking EC2 instance health..."
    
    aws ec2 describe-instance-status \
        --query 'InstanceStatuses[?InstanceState.Name!=`running`]' \
        --output table
}

check_load_balancer_health() {
    echo "Checking Load Balancer target health..."
    
    aws elbv2 describe-load-balancers \
        --query 'LoadBalancers[].LoadBalancerArn' \
        --output text | \
    while read -r lb_arn; do
        echo "Load Balancer: $lb_arn"
        
        aws elbv2 describe-target-groups \
            --load-balancer-arn $lb_arn \
            --query 'TargetGroups[].TargetGroupArn' \
            --output text | \
        while read -r tg_arn; do
            echo "Target Group Health:"
            aws elbv2 describe-target-health \
                --target-group-arn $tg_arn \
                --output table
        done
    done
}

check_vpc_connectivity() {
    echo "Checking VPC connectivity..."
    
    # Check route tables
    aws ec2 describe-route-tables --output table
    
    # Check security groups
    aws ec2 describe-security-groups \
        --query 'SecurityGroups[?GroupName!=`default`]' \
        --output table
    
    # Check NACLs
    aws ec2 describe-network-acls --output table
}

check_kubernetes_cluster() {
    echo "Checking Kubernetes cluster health..."
    
    kubectl get nodes -o wide
    kubectl get pods --all-namespaces | grep -v Running
    kubectl top nodes
    kubectl top pods --all-namespaces
}

# Run all checks
echo "=== Infrastructure Health Check ==="
check_ec2_health
echo ""
check_load_balancer_health
echo ""
check_vpc_connectivity
echo ""
check_kubernetes_cluster
```

This infrastructure management context provides comprehensive coverage of IaC, environment management, dynamic port configuration, cost optimization, disaster recovery, and troubleshooting - all optimized for the shared tools architecture approach.