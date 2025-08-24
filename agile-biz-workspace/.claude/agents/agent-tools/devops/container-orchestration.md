---
title: "Container Orchestration - DevOps Agent Context"
type: "agent-context"
agent: "devops"
keywords: ["kubernetes", "k8s", "orchestration", "helm", "service mesh", "containers", "pods", "deployments"]
token_count: 1369
---

# Container Orchestration - DevOps Agent Context

## When to Load This Context
- **Keywords**: kubernetes, k8s, orchestration, helm, service mesh, containers, pods, deployments
- **Tasks**: Container deployment, Kubernetes management, service mesh configuration, pod orchestration

## Overview
Container orchestration involves managing the deployment, scaling, networking, and availability of containerized applications across clusters of hosts. This context focuses on Kubernetes, service mesh technologies, and container lifecycle management.

## Kubernetes Cluster Management

### Cluster Setup and Configuration
```yaml
# cluster-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-config
  namespace: kube-system
data:
  cluster.properties: |
    cluster.name=production
    cluster.region=us-west-2
    networking.plugin=calico
    storage.class=gp3
```

### Node Management
- **Node Provisioning**: Automated node scaling with cluster autoscaler
- **Node Maintenance**: Rolling updates, cordoning, and draining procedures
- **Resource Management**: CPU/memory allocation and resource quotas
- **Taints and Tolerations**: Workload placement and node specialization

### Networking Configuration
```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: webapp-netpol
spec:
  podSelector:
    matchLabels:
      app: webapp
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

## Service Mesh Implementation

### Istio Configuration
```yaml
# istio-gateway.yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: webapp-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - webapp.example.com
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: webapp-tls
    hosts:
    - webapp.example.com
```

### Virtual Services and Destination Rules
```yaml
# virtual-service.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: webapp-vs
spec:
  hosts:
  - webapp.example.com
  gateways:
  - webapp-gateway
  http:
  - match:
    - uri:
        prefix: "/api/v1"
    route:
    - destination:
        host: api-service
        subset: v1
      weight: 90
    - destination:
        host: api-service
        subset: v2
      weight: 10
  - route:
    - destination:
        host: webapp-service
```

## Helm Chart Management

### Chart Structure
```yaml
# Chart.yaml
apiVersion: v2
name: webapp
description: Web application Helm chart
type: application
version: 1.0.0
appVersion: "2.1.0"
dependencies:
- name: postgresql
  version: 12.1.9
  repository: https://charts.bitnami.com/bitnami
  condition: postgresql.enabled
- name: redis
  version: 17.3.7
  repository: https://charts.bitnami.com/bitnami
  condition: redis.enabled
```

### Values Configuration
```yaml
# values.yaml
replicaCount: 3

image:
  repository: webapp
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: webapp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: webapp-tls
      hosts:
        - webapp.example.com

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

postgresql:
  enabled: true
  auth:
    existingSecret: postgres-secret
    secretKeys:
      adminPasswordKey: password
  primary:
    persistence:
      enabled: true
      size: 20Gi
      storageClass: gp3
```

## Dynamic Port Management

### Port Discovery Configuration
```yaml
# port-discovery-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: port-discovery
data:
  config.yaml: |
    portRange:
      start: 8000
      end: 9000
    services:
      webapp:
        preferredPort: 8080
        fallbackRange: 8080-8090
      api:
        preferredPort: 3000
        fallbackRange: 3000-3010
      database:
        preferredPort: 5432
        fallbackRange: 5432-5442
```

### Service Discovery Integration
```yaml
# service-discovery.yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
  annotations:
    service.alpha.kubernetes.io/tolerate-unready-endpoints: "true"
spec:
  selector:
    app: webapp
  ports:
  - name: http
    port: 80
    targetPort: app-port
    protocol: TCP
  - name: metrics
    port: 9090
    targetPort: metrics-port
    protocol: TCP
```

## Pod and Deployment Management

### Deployment Strategies
```yaml
# rolling-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
        version: v2.1.0
    spec:
      containers:
      - name: webapp
        image: webapp:2.1.0
        ports:
        - name: app-port
          containerPort: 8080
          protocol: TCP
        - name: metrics-port
          containerPort: 9090
          protocol: TCP
        env:
        - name: PORT
          value: "8080"
        - name: METRICS_PORT
          value: "9090"
        livenessProbe:
          httpGet:
            path: /health
            port: app-port
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: app-port
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### StatefulSet Configuration
```yaml
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: database
spec:
  serviceName: database-headless
  replicas: 3
  selector:
    matchLabels:
      app: database
  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
      - name: database
        image: postgres:14
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: webapp
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: gp3
      resources:
        requests:
          storage: 20Gi
```

## Container Security

### Security Contexts
```yaml
# security-context.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-webapp
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: webapp
    image: webapp:secure
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
    volumeMounts:
    - name: tmp
      mountPath: /tmp
    - name: var-run
      mountPath: /var/run
  volumes:
  - name: tmp
    emptyDir: {}
  - name: var-run
    emptyDir: {}
```

### Pod Security Standards
```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## Monitoring and Observability

### Prometheus Integration
```yaml
# service-monitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: webapp-monitor
spec:
  selector:
    matchLabels:
      app: webapp
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
```

### Distributed Tracing
```yaml
# jaeger-sidecar.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-with-tracing
spec:
  template:
    metadata:
      annotations:
        sidecar.istio.io/inject: "true"
    spec:
      containers:
      - name: webapp
        image: webapp:latest
        env:
        - name: JAEGER_AGENT_HOST
          value: localhost
        - name: JAEGER_AGENT_PORT
          value: "6831"
```

## Best Practices

### Resource Management
- **Resource Quotas**: Implement namespace-level resource quotas
- **Limit Ranges**: Set default and maximum resource limits
- **Horizontal Pod Autoscaling**: Automatic scaling based on metrics
- **Vertical Pod Autoscaling**: Right-sizing container resources

### High Availability
- **Pod Disruption Budgets**: Maintain minimum available replicas during updates
- **Anti-Affinity Rules**: Distribute pods across nodes and zones
- **Health Checks**: Comprehensive liveness and readiness probes
- **Circuit Breakers**: Implement failure isolation patterns

### Configuration Management
- **ConfigMaps**: Externalize application configuration
- **Secrets**: Secure storage of sensitive data
- **Environment-Specific**: Separate configurations per environment
- **Version Control**: Track all configuration changes

## Troubleshooting Commands

```bash
# Cluster diagnostics
kubectl cluster-info
kubectl get nodes -o wide
kubectl top nodes

# Pod debugging
kubectl logs -f deployment/webapp --all-containers=true
kubectl describe pod webapp-pod
kubectl exec -it webapp-pod -- /bin/bash

# Network troubleshooting
kubectl get services,endpoints
kubectl describe ingress webapp-ingress
istioctl proxy-config routes webapp-pod

# Resource monitoring
kubectl top pods --all-namespaces
kubectl get events --sort-by=.metadata.creationTimestamp
kubectl get pv,pvc --all-namespaces
```

## Universal Guidelines

*This context follows the Universal Agent Guidelines in CLAUDE.md*

**CRITICAL FOLDER SEPARATION**: All container orchestration configurations MUST be organized by environment (local, development, staging, production) and never mixed between environments.