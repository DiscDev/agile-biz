---
title: "Docker Containerization - Shared Tool"
type: "shared-tool"
keywords: ["docker", "container", "image", "dockerfile", "compose", "build", "deploy", "containerize"]
agents: ["developer", "devops", "testing", "api"]
token_count: 1479
---

# Docker Containerization - Shared Tool

## When to Load This Context
- **Keywords**: docker, container, image, dockerfile, compose, build, deploy, containerize
- **Patterns**: "containerize application", "docker setup", "build image", "docker compose"
- **Shared by**: Developer, DevOps, Testing, DBA, API agents

## Docker Overview

**Docker**: Containerization platform for consistent application deployment
- **Capabilities**: Application isolation, consistent environments, easy scaling
- **Tools Available**: `docker build`, `docker run`, `docker-compose`, container registries
- **Benefits**: Environment consistency, easy deployment, resource efficiency, scalability

## Agent-Specific Usage

### For Developer Agents
- Containerize applications for development
- Create development environments with Docker Compose
- Build and test containers locally
- Ensure consistent development environments

### For DevOps Agents
- Build production container images
- Manage container orchestration (Kubernetes)
- Configure container registries and deployment pipelines
- Monitor container performance and scaling

### For Testing Agents
- Create isolated test environments
- Run tests in containerized environments
- Test container builds and deployments
- Validate cross-platform compatibility

### For DBA Agents
- Containerize database instances
- Create database migration containers
- Set up database testing environments
- Manage database backups in containers

### For API Agents
- Containerize API applications
- Configure API gateway containers
- Set up service mesh configurations
- Manage API versioning through containers

## Core Docker Concepts

### Dockerfile Best Practices

#### Multi-Stage Builds
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["npm", "start"]
```

#### Optimized Layer Caching
```dockerfile
# Good: Copy dependency files first for better caching
FROM node:18-alpine
WORKDIR /app

# Copy package files first (changes less frequently)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code (changes more frequently)
COPY . .

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose Configurations

#### Development Environment
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "${FRONTEND_PORT:-5173}:5173"
      - "${BACKEND_PORT:-3000}:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp_dev
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "${DATABASE_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### Production Environment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: myorg/myapp:latest
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

## Common Workflows

### Development Workflow
```bash
# 1. Build development image
docker build -f Dockerfile.dev -t myapp:dev .

# 2. Start development environment
docker-compose -f docker-compose.dev.yml up -d

# 3. View logs
docker-compose -f docker-compose.dev.yml logs -f

# 4. Execute commands in container
docker-compose -f docker-compose.dev.yml exec app npm test

# 5. Stop environment
docker-compose -f docker-compose.dev.yml down
```

### Production Deployment Workflow
```bash
# 1. Build production image
docker build -f Dockerfile -t myapp:latest .

# 2. Tag for registry
docker tag myapp:latest myregistry.com/myapp:v1.2.3
docker tag myapp:latest myregistry.com/myapp:latest

# 3. Push to registry
docker push myregistry.com/myapp:v1.2.3
docker push myregistry.com/myapp:latest

# 4. Deploy to production
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Testing Workflow
```bash
# 1. Build test image
docker build -f Dockerfile.test -t myapp:test .

# 2. Run unit tests
docker run --rm myapp:test npm test

# 3. Run integration tests with dependencies
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# 4. Cleanup test containers
docker-compose -f docker-compose.test.yml down -v
```

## Security Best Practices

### Dockerfile Security
```dockerfile
# Use specific version tags, not 'latest'
FROM node:18.17-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Use HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Environment Variable Management
```yaml
# Use .env files for development
# .env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/myapp_dev
JWT_SECRET=dev-secret-key

# Use secrets for production
version: '3.8'
services:
  app:
    image: myapp:latest
    environment:
      - NODE_ENV=production
    secrets:
      - database_url
      - jwt_secret
    
secrets:
  database_url:
    external: true
  jwt_secret:
    external: true
```

## Performance Optimization

### Image Size Optimization
```dockerfile
# Multi-stage build to reduce final image size
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs
EXPOSE 3000
CMD ["npm", "start"]
```

### Resource Limits
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

## Monitoring and Logging

### Health Checks
```dockerfile
# Application health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

```javascript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    await db.query('SELECT 1');
    
    // Check Redis connectivity
    await redis.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### Logging Configuration
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "production"
```

## Troubleshooting

### Common Issues
```bash
# View container logs
docker logs <container-id>
docker-compose logs <service-name>

# Debug running container
docker exec -it <container-id> /bin/sh

# Check container resource usage
docker stats

# Inspect container configuration
docker inspect <container-id>

# Clean up unused resources
docker system prune -a
```

### Build Optimization
```bash
# Use BuildKit for better performance
export DOCKER_BUILDKIT=1
docker build .

# Build with cache from registry
docker build --cache-from myregistry.com/myapp:latest .

# Analyze image layers
docker history myapp:latest
```

## Registry Management

### Common Registries
- **Docker Hub**: Public and private repositories
- **Amazon ECR**: AWS container registry
- **Google Container Registry**: GCP container registry
- **Azure Container Registry**: Azure container registry
- **GitLab Container Registry**: Integrated with GitLab CI/CD

### Push/Pull Commands
```bash
# Login to registry
docker login myregistry.com

# Tag and push
docker tag myapp:latest myregistry.com/myapp:v1.2.3
docker push myregistry.com/myapp:v1.2.3

# Pull and run
docker pull myregistry.com/myapp:v1.2.3
docker run -d myregistry.com/myapp:v1.2.3
```