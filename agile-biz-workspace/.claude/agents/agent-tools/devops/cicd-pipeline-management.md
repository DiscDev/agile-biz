---
title: "CI/CD Pipeline Management - DevOps Agent Context"
type: "agent-context"
agent: "devops"
keywords: ["pipeline", "ci/cd", "build", "deploy", "automation", "jenkins", "github actions", "gitlab ci", "azure pipelines"]
token_count: 2379
---

# CI/CD Pipeline Management - DevOps Agent Context

## When to Load This Context
- **Keywords**: pipeline, ci/cd, build, deploy, automation, jenkins, github actions, gitlab ci, azure pipelines
- **Tasks**: Pipeline design, build automation, deployment strategies, release management

## Overview
CI/CD pipeline management encompasses the design, implementation, and maintenance of automated build, test, and deployment pipelines. This context covers modern pipeline patterns, deployment strategies, and integration with various CI/CD platforms.

## Pipeline Architecture Patterns

### Multi-Stage Pipeline Structure
```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm run lint
    - run: npm run test:unit
    - run: npm run test:integration
    - name: Upload coverage
      uses: codecov/codecov-action@v4

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
    - uses: actions/checkout@v4
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    - name: Login to Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ghcr.io/${{ github.repository }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix=sha-
    - name: Build and push
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: [test, build]
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - name: Deploy to Staging
      run: |
        echo "Deploying ${{ needs.build.outputs.image-tag }} to staging"
        # Deployment commands here

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [test, build]
    runs-on: ubuntu-latest
    environment: production
    steps:
    - name: Deploy to Production
      run: |
        echo "Deploying ${{ needs.build.outputs.image-tag }} to production"
        # Deployment commands here
```

### Jenkins Pipeline Configuration
```groovy
// Jenkinsfile
pipeline {
    agent any
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = 'webapp'
        KUBECONFIG = credentials('kubeconfig')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm ci'
                        sh 'npm run test:unit'
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'test-results.xml'
                        }
                    }
                }
                stage('Security Scan') {
                    steps {
                        sh 'npm audit --audit-level moderate'
                        sh 'docker run --rm -v $(pwd):/app securecodewarrior/docker-security-scan'
                    }
                }
                stage('Code Quality') {
                    steps {
                        sh 'npm run lint'
                        sh 'npm run coverage'
                    }
                    post {
                        always {
                            publishCoverage adapters: [
                                istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')
                            ]
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh """
                    helm upgrade --install webapp-staging ./helm/webapp \\
                        --namespace staging \\
                        --set image.tag=${IMAGE_TAG} \\
                        --set environment=staging \\
                        --wait
                """
            }
        }
        
        stage('Integration Tests') {
            when {
                branch 'develop'
            }
            steps {
                sh 'npm run test:integration:staging'
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                sh """
                    helm upgrade --install webapp-prod ./helm/webapp \\
                        --namespace production \\
                        --set image.tag=${IMAGE_TAG} \\
                        --set environment=production \\
                        --wait
                """
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        failure {
            slackSend(
                color: 'danger',
                message: "Pipeline failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
        success {
            slackSend(
                color: 'good',
                message: "Pipeline succeeded: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
    }
}
```

## Deployment Strategies

### Blue-Green Deployment
```yaml
# blue-green-deployment.yml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: webapp-rollout
spec:
  replicas: 10
  strategy:
    blueGreen:
      activeService: webapp-active
      previewService: webapp-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: webapp-preview
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: webapp-active
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: webapp:latest
        ports:
        - containerPort: 8080
```

### Canary Deployment
```yaml
# canary-deployment.yml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: webapp-canary
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 10
      - pause: {duration: 300s}
      - setWeight: 20
      - pause: {duration: 300s}
      - setWeight: 50
      - pause: {duration: 600s}
      - setWeight: 100
      canaryService: webapp-canary
      stableService: webapp-stable
      analysis:
        templates:
        - templateName: error-rate-analysis
        args:
        - name: service-name
          value: webapp-canary
        - name: error-threshold
          value: "5"
      trafficRouting:
        istio:
          virtualService:
            name: webapp-vs
            routes:
            - primary
          destinationRule:
            name: webapp-dr
            canarySubsetName: canary
            stableSubsetName: stable
```

### Feature Flags Integration
```yaml
# feature-flag-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-feature-flags
spec:
  template:
    spec:
      containers:
      - name: webapp
        image: webapp:latest
        env:
        - name: FEATURE_FLAGS_ENDPOINT
          value: "https://flags.example.com/api/v1"
        - name: FEATURE_FLAGS_API_KEY
          valueFrom:
            secretKeyRef:
              name: feature-flags-secret
              key: api-key
        - name: ENVIRONMENT
          value: "production"
        volumeMounts:
        - name: feature-config
          mountPath: /app/config/features
      volumes:
      - name: feature-config
        configMap:
          name: feature-flags-config
```

## Build Optimization

### Multi-Stage Docker Builds
```dockerfile
# Dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development dependencies stage
FROM node:18-alpine AS dev-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM dev-deps AS build
COPY . .
RUN npm run build
RUN npm run test
RUN npm prune --production

# Security scanning stage
FROM build AS security
RUN npm audit --audit-level moderate
RUN npx snyk test --severity-threshold=high

# Production stage
FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

USER nextjs
EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/server.js"]
```

### Build Cache Optimization
```yaml
# build-cache.yml
name: Optimized Build
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Cache Docker layers
      uses: actions/cache@v3
      with:
        path: /tmp/.buildx-cache
        key: ${{ runner.os }}-buildx-${{ github.sha }}
        restore-keys: |
          ${{ runner.os }}-buildx-
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Build with cache
      uses: docker/build-push-action@v5
      with:
        context: .
        cache-from: type=local,src=/tmp/.buildx-cache
        cache-to: type=local,dest=/tmp/.buildx-cache-new
        tags: webapp:latest
    
    - name: Move cache
      run: |
        rm -rf /tmp/.buildx-cache
        mv /tmp/.buildx-cache-new /tmp/.buildx-cache
```

## Dynamic Port Management in Pipelines

### Port Discovery Configuration
```yaml
# pipeline-port-config.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pipeline-port-config
data:
  config.yaml: |
    environments:
      staging:
        portRange: "8000-8099"
        services:
          webapp:
            basePort: 8080
          api:
            basePort: 3000
          database:
            basePort: 5432
      production:
        portRange: "8100-8199"
        services:
          webapp:
            basePort: 8180
          api:
            basePort: 3100
          database:
            basePort: 5532
```

### Dynamic Port Assignment
```bash
#!/bin/bash
# deploy-with-dynamic-ports.sh

ENVIRONMENT=${1:-staging}
SERVICE_NAME=${2:-webapp}

# Get available port from range
get_available_port() {
    local start_port=$1
    local end_port=$2
    
    for port in $(seq $start_port $end_port); do
        if ! netstat -tuln | grep -q ":$port "; then
            echo $port
            return 0
        fi
    done
    
    echo "No available ports in range $start_port-$end_port" >&2
    return 1
}

# Load port configuration
RANGE_START=$(yq ".environments.${ENVIRONMENT}.portRange" pipeline-port-config.yml | cut -d'-' -f1)
RANGE_END=$(yq ".environments.${ENVIRONMENT}.portRange" pipeline-port-config.yml | cut -d'-' -f2)
BASE_PORT=$(yq ".environments.${ENVIRONMENT}.services.${SERVICE_NAME}.basePort" pipeline-port-config.yml)

# Try base port first, then find available
if netstat -tuln | grep -q ":$BASE_PORT "; then
    ASSIGNED_PORT=$(get_available_port $RANGE_START $RANGE_END)
else
    ASSIGNED_PORT=$BASE_PORT
fi

# Deploy with assigned port
helm upgrade --install ${SERVICE_NAME}-${ENVIRONMENT} ./helm/${SERVICE_NAME} \
    --namespace ${ENVIRONMENT} \
    --set service.port=${ASSIGNED_PORT} \
    --set environment=${ENVIRONMENT} \
    --wait

echo "Deployed ${SERVICE_NAME} to ${ENVIRONMENT} on port ${ASSIGNED_PORT}"
```

## Pipeline Security

### Secret Management
```yaml
# secret-management.yml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: pipeline-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: pipeline-secrets
    creationPolicy: Owner
  data:
  - secretKey: api-key
    remoteRef:
      key: secret/pipeline
      property: api-key
  - secretKey: database-password
    remoteRef:
      key: secret/database
      property: password
```

### Image Scanning
```yaml
# image-security-scan.yml
name: Security Scan
on:
  push:
    branches: [main, develop]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Build image
      run: docker build -t webapp:${{ github.sha }} .
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: webapp:${{ github.sha }}
        format: sarif
        output: trivy-results.sarif
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: trivy-results.sarif
    
    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/docker@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        image: webapp:${{ github.sha }}
        args: --severity-threshold=high
```

## Monitoring and Observability

### Pipeline Metrics
```yaml
# pipeline-monitoring.yml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: pipeline-metrics
spec:
  selector:
    matchLabels:
      app: jenkins
  endpoints:
  - port: http
    path: /prometheus
    interval: 30s
---
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: pipeline-alerts
spec:
  groups:
  - name: pipeline.rules
    rules:
    - alert: PipelineFailureRate
      expr: rate(jenkins_builds_failure_total[5m]) > 0.1
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: High pipeline failure rate
        description: "Pipeline failure rate is {{ $value }} failures per second"
    
    - alert: LongRunningPipeline
      expr: jenkins_builds_duration_milliseconds > 1800000  # 30 minutes
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: Pipeline running too long
        description: "Pipeline {{ $labels.job }} has been running for {{ $value }}ms"
```

### Deployment Tracking
```yaml
# deployment-tracking.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: deployment-tracker
data:
  track-deployment.sh: |
    #!/bin/bash
    DEPLOYMENT_ID=$(date +%Y%m%d-%H%M%S)-${GITHUB_SHA:0:8}
    
    # Record deployment start
    curl -X POST $TRACKING_ENDPOINT/deployments \
      -H "Content-Type: application/json" \
      -d "{
        \"id\": \"$DEPLOYMENT_ID\",
        \"environment\": \"$ENVIRONMENT\",
        \"version\": \"$IMAGE_TAG\",
        \"status\": \"started\",
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
      }"
    
    # Deploy application
    helm upgrade --install $SERVICE_NAME ./helm/$SERVICE_NAME \
      --namespace $ENVIRONMENT \
      --set image.tag=$IMAGE_TAG \
      --wait
    
    DEPLOYMENT_STATUS=$?
    
    # Record deployment completion
    curl -X PUT $TRACKING_ENDPOINT/deployments/$DEPLOYMENT_ID \
      -H "Content-Type: application/json" \
      -d "{
        \"status\": \"$([ $DEPLOYMENT_STATUS -eq 0 ] && echo completed || echo failed)\",
        \"endTime\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
      }"
```

## Best Practices

### Pipeline Design Principles
- **Fail Fast**: Run fastest tests first, expensive operations last
- **Parallel Execution**: Run independent stages concurrently
- **Immutable Artifacts**: Build once, deploy everywhere
- **Environment Parity**: Consistent environments across pipeline stages
- **Rollback Strategy**: Always maintain ability to rollback deployments

### Security Practices
- **Least Privilege**: Minimal required permissions for pipeline execution
- **Secret Rotation**: Regular rotation of API keys and credentials
- **Audit Logging**: Comprehensive logging of all pipeline activities
- **Approval Gates**: Manual approval for production deployments
- **Vulnerability Scanning**: Automated security scanning at every stage

### Performance Optimization
- **Build Caching**: Aggressive caching of build artifacts and dependencies
- **Incremental Builds**: Only rebuild changed components
- **Resource Allocation**: Right-size pipeline runners and workers
- **Artifact Management**: Efficient storage and retrieval of build artifacts
- **Pipeline Parallelization**: Maximum concurrent execution

## Troubleshooting

### Common Pipeline Issues
```bash
# Pipeline debugging commands
kubectl logs -f deployment/jenkins-controller
kubectl describe pod jenkins-agent-pod
kubectl get events --sort-by=.metadata.creationTimestamp

# Build failure analysis
docker history webapp:latest
docker run --rm webapp:latest /bin/sh -c "npm test"
docker exec -it build-container /bin/bash

# Deployment troubleshooting
helm status webapp-staging
helm get values webapp-staging
kubectl rollout status deployment/webapp
kubectl rollout undo deployment/webapp
```

### Pipeline Recovery Procedures
```bash
#!/bin/bash
# pipeline-recovery.sh

# Check pipeline status
check_pipeline_health() {
    kubectl get pods -n jenkins
    kubectl top pods -n jenkins
    kubectl get pvc -n jenkins
}

# Restart failed pipeline
restart_pipeline() {
    kubectl scale deployment jenkins-controller --replicas=0
    sleep 30
    kubectl scale deployment jenkins-controller --replicas=1
    kubectl wait --for=condition=ready pod -l app=jenkins --timeout=300s
}

# Clean up build artifacts
cleanup_artifacts() {
    docker system prune -f
    docker volume prune -f
    kubectl delete pod -l job-name=cleanup-job
}
```

## Universal Guidelines

*This context follows the Universal Agent Guidelines in CLAUDE.md*

**CRITICAL FOLDER SEPARATION**: All CI/CD configurations and deployment scripts MUST be organized by environment and never mix production and development pipelines.