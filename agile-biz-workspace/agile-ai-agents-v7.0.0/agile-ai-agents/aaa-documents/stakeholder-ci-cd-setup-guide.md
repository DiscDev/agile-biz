# Stakeholder CI/CD Setup Guide

## Overview
This guide helps stakeholders collaborate with AgileAiAgents during Sprint 1 to set up complete infrastructure including GitHub, databases, CI/CD pipelines, and servers.

## Prerequisites Checklist

Before Sprint 1 begins, stakeholders should have:
- [ ] Admin access to company GitHub/GitLab/Bitbucket account
- [ ] Cloud provider account (AWS/Azure/GCP) with billing set up
- [ ] Credit card for any paid services
- [ ] Domain name (optional but recommended)
- [ ] 3-4 hours available for Sprint 1 Day 1
- [ ] Decision-making authority for infrastructure choices

## Sprint 1 Collaboration Timeline

### Day 1 Morning (2-3 hours active participation)
- Infrastructure setup with DevOps Agent guidance
- Account creation and configuration
- Credentials and secrets management
- Repository and CI/CD pipeline setup

### Day 1 Afternoon (On-call availability)
- Answer questions as needed
- Approve infrastructure decisions
- Provide additional access as required

### Day 2 (1 hour validation)
- Test deployment processes
- Verify everything works
- Final approval and sign-off

## Detailed Setup Steps

### 1. GitHub/GitLab Repository Setup

**Time Required**: 30 minutes

**What you'll do**:
1. Create new repository or provide access to existing one
2. Generate personal access tokens with specific permissions
3. Add repository secrets for deployments
4. Configure branch protection rules

**Information to have ready**:
- Repository naming preference
- Public vs private repository decision
- Team members who need access
- Branching strategy preference

**Common Issues & Solutions**:
- **Token permissions**: Ensure tokens have `repo`, `workflow`, and `packages` scopes
- **2FA complications**: Use personal access tokens, not passwords
- **Organization restrictions**: May need admin approval for GitHub Actions

### 2. Cloud Provider Setup

**Time Required**: 45 minutes

**AWS Setup**:
```
Required Services:
- EC2/ECS for compute
- RDS for database
- S3 for storage
- IAM for access management
- CloudWatch for monitoring

Steps:
1. Create IAM user for deployments
2. Generate access keys
3. Set up VPC and security groups
4. Configure RDS instance
5. Create S3 buckets
```

**Azure Setup**:
```
Required Services:
- App Service or AKS
- Azure Database
- Blob Storage
- Key Vault for secrets
- Application Insights

Steps:
1. Create service principal
2. Set up resource group
3. Configure database
4. Set up storage accounts
5. Configure monitoring
```

**GCP Setup**:
```
Required Services:
- Compute Engine or GKE
- Cloud SQL
- Cloud Storage
- Secret Manager
- Cloud Monitoring

Steps:
1. Create service account
2. Generate JSON key
3. Set up VPC network
4. Configure Cloud SQL
5. Create storage buckets
```

### 3. Database Configuration

**Time Required**: 30 minutes

**Options by Stack**:
```
PostgreSQL:
- AWS RDS PostgreSQL
- Azure Database for PostgreSQL
- Google Cloud SQL for PostgreSQL
- Supabase (managed option)

MySQL:
- AWS RDS MySQL
- Azure Database for MySQL
- Google Cloud SQL for MySQL
- PlanetScale (serverless option)

MongoDB:
- MongoDB Atlas (recommended)
- AWS DocumentDB
- Azure Cosmos DB

Redis (for caching):
- Redis Cloud
- AWS ElastiCache
- Azure Cache for Redis
```

**Setup Steps**:
1. Choose appropriate instance size
2. Configure security groups/firewall
3. Create database and user
4. Note connection string
5. Set up automated backups

### 4. CI/CD Pipeline Configuration

**Time Required**: 30 minutes

**GitHub Actions Setup**:
```yaml
Workflows to be created:
- ci.yml (runs tests on every push)
- deploy-staging.yml (deploys to staging)
- deploy-production.yml (deploys to production)

Secrets needed:
- DEPLOYMENT_TOKEN
- AWS_ACCESS_KEY_ID / AZURE_CLIENT_ID / GCP_KEY
- DATABASE_URL
- API_KEYS (various)
```

**Environment Configuration**:
- Development: Auto-deploy from main branch
- Staging: Manual trigger or PR merge
- Production: Manual approval required

### 5. Domain and SSL Setup

**Time Required**: 20 minutes

**Domain Configuration**:
1. Purchase domain (if needed) from registrar
2. Point to load balancer/server IP
3. Configure DNS records:
   - A record for root domain
   - CNAME for www subdomain
   - MX records if using email

**SSL Certificate**:
- Option 1: Let's Encrypt (free, automatic)
- Option 2: AWS Certificate Manager (free for AWS)
- Option 3: Purchased certificate

### 6. Monitoring and Alerts

**Time Required**: 15 minutes

**Free Monitoring Options**:
```
Basic Setup:
- GitHub Actions notifications
- Uptime Robot (free tier)
- Cloud provider basic metrics

What gets monitored:
- Application uptime
- Response times
- Error rates
- Deployment status
```

**Paid Monitoring Options**:
```
Professional Setup:
- DataDog
- New Relic
- Sentry (error tracking)
- PagerDuty (incident management)
```

## Cost Estimates

### Minimum Budget (Development/MVP)
```
Monthly Costs:
- GitHub: Free (public) or $4/user (private)
- Cloud hosting: $20-50 (small instances)
- Database: $15-25 (small instance)
- Domain: $12/year
- SSL: Free (Let's Encrypt)
- Monitoring: Free tier

Total: ~$50-80/month
```

### Production Budget
```
Monthly Costs:
- GitHub: $4-21/user
- Cloud hosting: $100-500
- Database: $50-200
- CDN: $20-50
- Monitoring: $50-100
- Backups: $20-50

Total: ~$250-900/month
```

## Security Best Practices

### Secrets Management
1. **Never commit secrets to code**
2. **Use environment variables**
3. **Rotate credentials regularly**
4. **Use least privilege principle**
5. **Enable 2FA everywhere**

### Access Control
```
Repository Access:
- Admin: Only owners
- Write: Development team
- Read: Stakeholders

Cloud Access:
- Separate accounts for dev/prod
- IAM roles, not root credentials
- Regular access audits
```

## Troubleshooting Common Issues

### GitHub Actions Issues
```
Problem: "Workflow not running"
Solution: Check Actions are enabled in repository settings

Problem: "Permission denied"
Solution: Verify token has workflow scope

Problem: "Secret not found"
Solution: Secrets are case-sensitive, check spelling
```

### Database Connection Issues
```
Problem: "Connection timeout"
Solution: Check security group/firewall rules

Problem: "Authentication failed"
Solution: Verify username, password, and database name

Problem: "Too many connections"
Solution: Implement connection pooling
```

### Deployment Failures
```
Problem: "Build failed"
Solution: Check logs, usually dependency issue

Problem: "Deploy succeeded but app won't start"
Solution: Check environment variables and database connection

Problem: "Out of memory"
Solution: Increase instance size or optimize code
```

## Stakeholder Responsibilities

### During Sprint 1
1. **Provide timely responses** to setup questions
2. **Make infrastructure decisions** when options are presented
3. **Create accounts and provide access** as needed
4. **Approve costs** for services
5. **Test and validate** setup completion

### Post Sprint 1
1. **Maintain accounts** and billing
2. **Monitor costs** and usage
3. **Approve production deployments**
4. **Manage team access** as it changes
5. **Review security alerts**

## Communication During Setup

### How Agents Will Communicate
```
Format: Clear, step-by-step instructions
Channel: Through Claude Code interface
Style: 
- Checklists for easy tracking
- Options presented clearly
- Time estimates provided
- Help available for issues
```

### What Stakeholders Should Communicate
```
Immediately share:
- Error messages
- Access issues
- Budget constraints
- Time constraints
- Technical preferences
- Existing infrastructure to preserve
```

## Success Criteria

Sprint 1 is successful when:
- [ ] Code automatically builds on commit
- [ ] Tests run automatically
- [ ] Staging deployments work
- [ ] Production deployment process validated
- [ ] Monitoring shows all systems green
- [ ] Team can deploy independently
- [ ] Rollback process tested
- [ ] Documentation complete
- [ ] Stakeholder confident in system

## Next Steps After Sprint 1

1. **Sprint 2**: Begin feature development
2. **Regular deployments**: Using established pipeline
3. **Continuous improvement**: Optimize based on metrics
4. **Scaling preparation**: Plan for growth
5. **Security hardening**: Regular security reviews

## Quick Reference Card

### Essential URLs to Bookmark
```
GitHub Actions: https://github.com/[org]/[repo]/actions
AWS Console: https://console.aws.amazon.com
Azure Portal: https://portal.azure.com
GCP Console: https://console.cloud.google.com
Monitoring Dashboard: [Your monitoring URL]
Staging Environment: [Your staging URL]
Production Environment: [Your production URL]
```

### Emergency Contacts
```
DevOps Issues: [DevOps Agent via Claude Code]
Database Issues: [Cloud provider support]
Domain/DNS: [Registrar support]
Billing Issues: [Cloud provider billing]
```

---

**Created**: 2025-08-11
**Version**: 1.0.0
**Purpose**: Comprehensive guide for stakeholder collaboration during Sprint 1 CI/CD setup