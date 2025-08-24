# AgileAiAgents Production Deployment Guide

## 🚀 Overview

This guide covers deploying AgileAiAgents Dashboard in production environments using various methods including PM2, systemd, Docker, and cloud platforms.

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [PM2 Deployment](#pm2-deployment)
3. [Systemd Service](#systemd-service)
4. [Nginx Configuration](#nginx-configuration)
5. [SSL/TLS Setup](#ssltls-setup)
6. [Backup Procedures](#backup-procedures)
7. [Monitoring Setup](#monitoring-setup)
8. [Scaling Considerations](#scaling-considerations)
9. [Cloud Deployments](#cloud-deployments)
10. [Troubleshooting](#troubleshooting)

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords in `.env`
- [ ] Enable authentication (`DASHBOARD_AUTH_ENABLED=true`)
- [ ] Configure proper API keys (remove placeholders)
- [ ] Set `NODE_ENV=production`
- [ ] Test health endpoint locally
- [ ] Review security settings
- [ ] Plan backup strategy
- [ ] Prepare monitoring solution
- [ ] Document deployment process

## 🔧 PM2 Deployment

PM2 is a production process manager for Node.js applications.

### Install PM2
```bash
npm install -g pm2
pm2 install pm2-logrotate  # Optional: log rotation
```

### Create ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'agileai-dashboard',
    script: './project-dashboard/server-secure.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      DASHBOARD_PORT: 3001
    },
    
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    
    // Advanced features
    autorestart: true,
    max_restarts: 10,
    restart_delay: 4000,
    
    // Graceful reload
    wait_ready: true,
    listen_timeout: 3000,
    kill_timeout: 5000
  }]
};
```

### PM2 Commands
```bash
# Start application
pm2 start ecosystem.config.js --env production

# View status
pm2 status

# View logs
pm2 logs agileai-dashboard

# Monitor resources
pm2 monit

# Reload with zero downtime
pm2 reload agileai-dashboard

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup

# Stop application
pm2 stop agileai-dashboard

# Delete from PM2
pm2 delete agileai-dashboard
```

### PM2 Cluster Mode
For high availability:
```bash
# Start in cluster mode with 4 instances
pm2 start ecosystem.config.js -i 4

# Scale to 8 instances
pm2 scale agileai-dashboard 8
```

## 🐧 Systemd Service

For Linux systems using systemd.

### Create Service File
`/etc/systemd/system/agileai-dashboard.service`:
```ini
[Unit]
Description=AgileAiAgents Dashboard
Documentation=https://github.com/your-repo/agile-ai-agents
After=network.target

[Service]
Type=simple
User=agileai
WorkingDirectory=/opt/agile-ai-agents
ExecStart=/usr/bin/node project-dashboard/server-secure.js
Restart=always
RestartSec=10

# Environment
Environment="NODE_ENV=production"
Environment="DASHBOARD_PORT=3001"
EnvironmentFile=/opt/agile-ai-agents/.env

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/agile-ai-agents/logs /opt/agile-ai-agents/project-documents

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096
MemoryLimit=2G
CPUQuota=200%

# Logging
StandardOutput=append:/var/log/agileai/dashboard.log
StandardError=append:/var/log/agileai/error.log

[Install]
WantedBy=multi-user.target
```

### Systemd Commands
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (auto-start on boot)
sudo systemctl enable agileai-dashboard

# Start service
sudo systemctl start agileai-dashboard

# Check status
sudo systemctl status agileai-dashboard

# View logs
sudo journalctl -u agileai-dashboard -f

# Restart service
sudo systemctl restart agileai-dashboard

# Stop service
sudo systemctl stop agileai-dashboard
```

## 🌐 Nginx Configuration

Production-ready Nginx configuration.

### Install Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### Nginx Site Configuration
`/etc/nginx/sites-available/agileai-dashboard`:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/agileai-access.log;
    error_log /var/log/nginx/agileai-error.log;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket specific
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
        proxy_pass http://localhost:3001;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/agileai-dashboard /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔒 SSL/TLS Setup

### Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run

# Setup auto-renewal cron
echo "0 3 * * * root certbot renew --quiet" | sudo tee /etc/cron.d/certbot
```

### Self-Signed Certificate (Development)
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/agileai.key \
  -out /etc/ssl/certs/agileai.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## 💾 Backup Procedures

### Automated Backup Script
Create `/opt/agile-ai-agents/scripts/bash/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backup/agileai"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/opt/agile-ai-agents"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup project documents
tar -czf $BACKUP_DIR/documents_$DATE.tar.gz -C $PROJECT_DIR project-documents

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz -C $PROJECT_DIR logs

# Backup configuration
cp $PROJECT_DIR/.env $BACKUP_DIR/env_$DATE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron Schedule
```bash
# Add to crontab
0 2 * * * /opt/agile-ai-agents/scripts/bash/backup.sh >> /var/log/agileai-backup.log 2>&1
```

### Database Backup (if using)
```bash
# PostgreSQL backup
pg_dump -U agileai -h localhost agileai > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql
```

## 📊 Monitoring Setup

### Prometheus + Grafana

#### Prometheus Configuration
`prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'agileai-dashboard'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/api/metrics'
```

#### Add Metrics Endpoint
Add to `server-secure.js`:
```javascript
const promClient = require('prom-client');
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/api/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});
```

### Health Monitoring Script
```bash
#!/bin/bash
# health-check.sh
HEALTH_URL="http://localhost:3001/api/health"
ALERT_EMAIL="admin@example.com"

# Check health
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
  echo "Health check failed with status: $RESPONSE" | mail -s "AgileAI Alert" $ALERT_EMAIL
  # Attempt restart
  systemctl restart agileai-dashboard
fi
```

### Add to cron
```bash
*/5 * * * * /opt/agile-ai-agents/health-check.sh
```

## 📈 Scaling Considerations

### Horizontal Scaling

#### Load Balancer Configuration (HAProxy)
```
global
    maxconn 4096

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend web_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/agileai.pem
    redirect scheme https if !{ ssl_fc }
    default_backend web_servers

backend web_servers
    balance roundrobin
    option httpchk GET /api/health
    server web1 192.168.1.10:3001 check
    server web2 192.168.1.11:3001 check
    server web3 192.168.1.12:3001 check
```

### Vertical Scaling
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" node server-secure.js

# PM2 with increased memory
pm2 start ecosystem.config.js --node-args="--max-old-space-size=4096"
```

### Session Management (Redis)
```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const redisClient = redis.createClient({
  host: 'redis-server',
  port: 6379,
  password: process.env.REDIS_PASSWORD
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

## ☁️ Cloud Deployments

### AWS EC2

#### Launch Script
```bash
#!/bin/bash
# user-data.sh
yum update -y
yum install -y nodejs npm git nginx

# Clone repository
git clone https://github.com/your-repo/agile-ai-agents.git /opt/agile-ai-agents
cd /opt/agile-ai-agents

# Install dependencies
npm install --prefix project-dashboard

# Setup environment
cp .env_example .env
# Configure .env with AWS Secrets Manager or Parameter Store

# Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Google Cloud Platform

#### App Engine (app.yaml)
```yaml
runtime: nodejs18
env: standard

instance_class: F2

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10

env_variables:
  NODE_ENV: "production"
  DASHBOARD_PORT: "8080"

handlers:
- url: /.*
  script: auto
  secure: always
```

### Azure App Service

#### Deployment Script
```bash
# Deploy to Azure
az webapp create --resource-group AgileAI --plan AgileAIPlan --name agileai-dashboard --runtime "NODE|18-lts"

# Configure environment
az webapp config appsettings set --resource-group AgileAI --name agileai-dashboard --settings NODE_ENV=production

# Deploy code
az webapp deployment source config --name agileai-dashboard --resource-group AgileAI --repo-url https://github.com/your-repo/agile-ai-agents --branch main
```

### Kubernetes

#### Deployment YAML
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agileai-dashboard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agileai-dashboard
  template:
    metadata:
      labels:
        app: agileai-dashboard
    spec:
      containers:
      - name: dashboard
        image: agileaiagents/dashboard:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: agileai-service
spec:
  selector:
    app: agileai-dashboard
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

## 🔧 Troubleshooting

### Troubleshooting

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001
# or
netstat -tulpn | grep 3001

# Kill process
kill -9 <PID>
```

#### Permission Denied
```bash
# Fix ownership
chown -R agileai:agileai /opt/agile-ai-agents

# Fix permissions
chmod -R 755 /opt/agile-ai-agents
chmod -R 775 /opt/agile-ai-agents/logs
chmod -R 775 /opt/agile-ai-agents/project-documents
```

#### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart with memory limit
pm2 restart agileai-dashboard --max-memory-restart 1G

# Analyze heap dump
node --inspect project-dashboard/server-secure.js
```

#### Slow Performance
```bash
# Enable Node.js profiling
NODE_ENV=production node --prof project-dashboard/server-secure.js

# Process profiling data
node --prof-process isolate-*.log > profile.txt

# Check for memory leaks
node --trace-gc project-dashboard/server-secure.js
```

### Debugging Production Issues

#### Enable Debug Logging
```bash
# Temporarily enable debug logs
LOG_LEVEL=debug pm2 restart agileai-dashboard

# View debug logs
pm2 logs agileai-dashboard --lines 1000
```

#### Core Dumps
```bash
# Enable core dumps
ulimit -c unlimited

# Set core dump location
echo '/tmp/core.%e.%p' | sudo tee /proc/sys/kernel/core_pattern

# Analyze with lldb/gdb
lldb node /tmp/core.node.12345
```

## 📋 Post-Deployment Checklist

- [ ] Verify health endpoint responds correctly
- [ ] Test authentication works
- [ ] Check SSL certificate is valid
- [ ] Confirm backups are running
- [ ] Monitor initial resource usage
- [ ] Test log rotation
- [ ] Verify email alerts work
- [ ] Document server access credentials
- [ ] Create runbook for common issues
- [ ] Schedule security updates

## 🔄 Maintenance

### Regular Tasks
- **Daily**: Check logs for errors
- **Weekly**: Review resource usage trends
- **Monthly**: Update dependencies, review security patches
- **Quarterly**: Test disaster recovery procedures

### Update Procedure
```bash
# Backup current deployment
scripts/bash/backup.sh

# Pull latest code
git pull origin main

# Install dependencies
npm install --prefix project-dashboard

# Run tests
npm test --prefix project-dashboard

# Reload application (zero downtime)
pm2 reload agileai-dashboard

# Verify health
curl http://localhost:3001/api/health
```

---

For Docker deployments, see [docker-readme.md](../scripts/docker/docker-readme.md).
For troubleshooting, see [troubleshooting.md](./troubleshooting.md).