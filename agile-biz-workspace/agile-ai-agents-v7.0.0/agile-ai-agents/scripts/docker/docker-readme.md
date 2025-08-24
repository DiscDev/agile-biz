# AgileAiAgents Docker Deployment

## 🐳 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB free RAM
- 5GB free disk space

### 1. Quick Production Start
```bash
# Copy environment file
cp .env_example .env
# Edit .env with your credentials

# Build and start
./docker-run.sh build
./docker-run.sh start
```

Dashboard will be available at http://localhost:3001

### 2. Development Mode
```bash
# Start with hot reload
./docker-run.sh start development

# View logs
./docker-run.sh logs
```

## 📦 Docker Images

### Production Image
- Based on Node.js 18 Alpine
- Multi-stage build for minimal size
- Non-root user for security
- Health checks included
- ~150MB total size

### Development Image
- Includes development dependencies
- Volume mounts for hot reload
- Full debugging capabilities

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│    Nginx    │────▶│  Dashboard  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                     │
                           ▼                     ▼
                    ┌─────────────┐     ┌─────────────┐
                    │    Redis    │     │   Volumes   │
                    │  (optional) │     │   - logs    │
                    └─────────────┘     │   - docs    │
                                       └─────────────┘
```

## 🚀 Deployment Commands

### Basic Operations
```bash
# Start containers
./docker-run.sh start [production|development|prod-nginx]

# Stop containers
./docker-run.sh stop

# Restart containers
./docker-run.sh restart

# View logs
./docker-run.sh logs

# Check status
./docker-run.sh status

# Open shell in container
./docker-run.sh shell

# Clean up everything
./docker-run.sh clean
```

### Manual Docker Compose
```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production with Nginx
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f dashboard

# Stop
docker-compose down
```

## 🔧 Configuration

### Environment Variables
Key variables for Docker deployment:
```env
# Port mapping
DASHBOARD_PORT=3001

# Security
DASHBOARD_AUTH_ENABLED=true
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=secure_password_here

# Node environment
NODE_ENV=production
LOG_LEVEL=info

# Resource limits (optional)
NODE_OPTIONS=--max-old-space-size=1536
```

### Volume Mounts
- `./project-documents:/app/project-documents` - Agent documents
- `./logs:/app/logs` - Application logs
- `./.env:/app/.env:ro` - Environment configuration (read-only)

### Profiles
Docker Compose profiles for optional services:
- `with-redis` - Includes Redis for caching
- `with-database` - Includes PostgreSQL
- `production-nginx` - Includes Nginx reverse proxy

Enable profiles:
```bash
docker-compose --profile with-redis up -d
```

## 🔒 Security Considerations

### Production Checklist
- ✅ Change default passwords in `.env`
- ✅ Enable authentication (`DASHBOARD_AUTH_ENABLED=true`)
- ✅ Use HTTPS with Nginx (see SSL section)
- ✅ Set proper file permissions
- ✅ Regular security updates

### SSL/TLS with Nginx
1. Place certificates in `nginx/ssl/`:
   - `cert.pem` - SSL certificate
   - `key.pem` - Private key

2. Uncomment HTTPS section in `nginx/nginx.conf`

3. Update `docker-compose.prod.yml`:
```yaml
nginx:
  ports:
    - "80:80"
    - "443:443"
```

## 📊 Monitoring

### Health Checks
```bash
# Check health endpoint
curl http://localhost:3001/api/health

# Docker health status
docker inspect agileai-dashboard --format='{{.State.Health.Status}}'
```

### Resource Usage
```bash
# Container stats
docker stats agileai-dashboard

# Disk usage
docker system df
```

### Logs
```bash
# Application logs
docker-compose logs dashboard

# Nginx logs (if using)
docker-compose logs nginx

# Export logs
docker-compose logs dashboard > dashboard.log
```

## 🛠️ Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs dashboard

# Verify image built
docker images | grep agileai

# Check port availability
lsof -i :3001
```

### Permission Issues
```bash
# Fix volume permissions
docker-compose exec dashboard chown -R agileai:agileai /app/logs /app/project-documents
```

### Memory Issues
```bash
# Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
```

### Network Issues
```bash
# Inspect network
docker network inspect agileai-network

# Test connectivity
docker-compose exec dashboard ping nginx
```

## 🔄 Updates and Maintenance

### Update Process
```bash
# 1. Pull latest code
git pull

# 2. Rebuild images
./docker-run.sh build production nocache

# 3. Restart containers
docker-compose down
docker-compose up -d
```

### Backup
```bash
# Backup volumes
docker run --rm -v agileai_project-documents:/data -v $(pwd):/backup alpine tar czf /backup/documents-backup.tar.gz -C /data .
docker run --rm -v agileai_logs:/data -v $(pwd):/backup alpine tar czf /backup/logs-backup.tar.gz -C /data .
```

### Cleanup
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

## 🚢 Production Deployment

### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml agileai
```

### Kubernetes
See `kubernetes/` directory for K8s manifests (future feature).

### Cloud Deployments
- **AWS ECS**: Use Dockerfile with ECS task definitions
- **Google Cloud Run**: Direct container deployment
- **Azure Container Instances**: Use docker-compose for ACI

## 📝 Best Practices

1. **Always use specific image tags in production**
2. **Set resource limits to prevent runaway containers**
3. **Use secrets management for sensitive data**
4. **Regular backups of volumes**
5. **Monitor logs and health endpoints**
6. **Keep images updated for security**

---

For more help, see main [readme.md](./readme.md) or run `./docker-run.sh help`