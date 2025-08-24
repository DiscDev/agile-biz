---
title: "Monitoring & Observability - DevOps Agent Context"
type: "agent-context"
agent: "devops"
keywords: ["monitoring", "alerting", "metrics", "observability", "logs", "prometheus", "grafana", "jaeger", "elk"]
token_count: 2686
---

# Monitoring & Observability - DevOps Agent Context

## When to Load This Context
- **Keywords**: monitoring, alerting, metrics, observability, logs, prometheus, grafana, jaeger, elk
- **Tasks**: System monitoring, log analysis, alerting setup, performance tracking, incident detection

## Overview
Monitoring and observability provide comprehensive visibility into system health, performance, and behavior. This context covers metrics collection, log aggregation, distributed tracing, alerting strategies, and observability best practices for modern infrastructure.

## Prometheus Monitoring Stack

### Prometheus Configuration
```yaml
# prometheus-config.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    region: 'us-west-2'

rule_files:
  - "/etc/prometheus/rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
      - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: default;kubernetes;https

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__

  - job_name: 'application-metrics'
    kubernetes_sd_configs:
      - role: endpoints
    relabel_configs:
      - source_labels: [__meta_kubernetes_service_label_app]
        action: keep
        regex: webapp|api|worker
      - source_labels: [__meta_kubernetes_endpoint_port_name]
        action: keep
        regex: metrics
```

### AlertManager Configuration
```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
  - match:
      severity: warning
    receiver: 'warning-alerts'
  - match_re:
      service: ^(webapp|api)$
    receiver: 'app-team'

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://webhook-service:8080/alerts'

- name: 'critical-alerts'
  email_configs:
  - to: 'oncall@example.com'
    subject: 'CRITICAL: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      Labels: {{ .Labels }}
      {{ end }}
  slack_configs:
  - channel: '#critical-alerts'
    title: 'CRITICAL Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

- name: 'warning-alerts'
  slack_configs:
  - channel: '#alerts'
    title: 'Warning Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

- name: 'app-team'
  slack_configs:
  - channel: '#app-team'
    title: 'Application Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'cluster', 'service']
```

### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "Application Performance Dashboard",
    "tags": ["application", "performance"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m]))",
            "legendFormat": "Requests/sec"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "reqps",
            "min": 0,
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 100},
                {"color": "red", "value": 500}
              ]
            }
          }
        }
      },
      {
        "title": "Response Time",
        "type": "timeseries",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "50th percentile"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "99th percentile"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "s",
            "min": 0
          }
        }
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100",
            "legendFormat": "Error Rate %"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "min": 0,
            "max": 100,
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 1},
                {"color": "red", "value": 5}
              ]
            }
          }
        }
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

## Logging and Log Aggregation

### ELK Stack Configuration
```yaml
# elasticsearch.yml
cluster.name: "logging-cluster"
node.name: "elasticsearch-master"
discovery.type: single-node
network.host: 0.0.0.0
http.port: 9200
xpack.security.enabled: false
xpack.monitoring.collection.enabled: true

# logstash.conf
input {
  beats {
    port => 5044
  }
  http {
    port => 8080
    codec => json
  }
}

filter {
  if [fields][service] == "webapp" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
  
  if [fields][service] == "api" {
    json {
      source => "message"
    }
    mutate {
      add_field => { "parsed" => "true" }
    }
  }
  
  # Add environment and service tags
  mutate {
    add_field => { 
      "environment" => "%{[fields][environment]}"
      "service" => "%{[fields][service]}"
    }
  }
  
  # Parse JSON logs
  if [message] =~ /^\{.*\}$/ {
    json {
      source => "message"
    }
  }
  
  # Enrich with Kubernetes metadata
  if [kubernetes] {
    mutate {
      add_field => {
        "k8s_namespace" => "%{[kubernetes][namespace]}"
        "k8s_pod" => "%{[kubernetes][pod][name]}"
        "k8s_container" => "%{[kubernetes][container][name]}"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{[fields][service]}-%{+YYYY.MM.dd}"
  }
  
  # Send critical errors to alerting system
  if [level] == "ERROR" or [level] == "FATAL" {
    http {
      url => "http://alertmanager:9093/api/v1/alerts"
      http_method => "post"
      format => "json"
      mapping => {
        "alerts" => [
          {
            "labels" => {
              "alertname" => "ApplicationError"
              "severity" => "warning"
              "service" => "%{[fields][service]}"
              "environment" => "%{[fields][environment]}"
            },
            "annotations" => {
              "summary" => "Application error detected"
              "description" => "%{message}"
            }
          }
        ]
      }
    }
  }
}

# kibana.yml
server.name: kibana
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://elasticsearch:9200"]
monitoring.ui.container.elasticsearch.enabled: true
```

### Fluentd Configuration
```yaml
# fluentd.conf
<source>
  @type tail
  @id input_tail
  path /var/log/containers/*.log
  pos_file /var/log/fluentd-containers.log.pos
  tag kubernetes.*
  read_from_head true
  <parse>
    @type json
    time_format %Y-%m-%dT%H:%M:%S.%NZ
    time_key time
    keep_time_key true
  </parse>
</source>

<filter kubernetes.**>
  @type kubernetes_metadata
  @id filter_kube_metadata
  kubernetes_url "#{ENV['KUBERNETES_SERVICE_HOST']}:#{ENV['KUBERNETES_SERVICE_PORT_HTTPS']}"
  verify_ssl true
  ca_file /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
  bearer_token_file /var/run/secrets/kubernetes.io/serviceaccount/token
</filter>

<filter kubernetes.**>
  @type grep
  <regexp>
    key $.kubernetes.container_name
    pattern ^(webapp|api|worker)$
  </regexp>
</filter>

<match kubernetes.**>
  @type elasticsearch
  @id out_es
  host elasticsearch.logging.svc.cluster.local
  port 9200
  scheme http
  ssl_verify false
  index_name logs-${kubernetes.namespace_name}
  type_name _doc
  <buffer>
    @type file
    path /var/log/fluentd-buffers/kubernetes.system.buffer
    flush_mode interval
    retry_type exponential_backoff
    flush_thread_count 2
    flush_interval 5s
    retry_forever
    retry_max_interval 30
    chunk_limit_size 2M
    queue_limit_length 8
    overflow_action block
  </buffer>
</match>
```

## Distributed Tracing

### Jaeger Configuration
```yaml
# jaeger-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger-all-in-one
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:latest
        ports:
        - containerPort: 16686
          name: ui
        - containerPort: 14268
          name: jaeger-http
        - containerPort: 6831
          name: jaeger-agent
          protocol: UDP
        env:
        - name: COLLECTOR_ZIPKIN_HOST_PORT
          value: ":9411"
        - name: SPAN_STORAGE_TYPE
          value: "elasticsearch"
        - name: ES_SERVER_URLS
          value: "http://elasticsearch:9200"
        - name: ES_INDEX_PREFIX
          value: "jaeger"
```

### OpenTelemetry Configuration
```yaml
# otel-collector-config.yml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  
  jaeger:
    protocols:
      grpc:
        endpoint: 0.0.0.0:14250
      thrift_http:
        endpoint: 0.0.0.0:14268
  
  zipkin:
    endpoint: 0.0.0.0:9411

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  
  resource:
    attributes:
    - key: environment
      value: production
      action: upsert
    - key: service.version
      from_attribute: service_version
      action: insert

exporters:
  jaeger:
    endpoint: jaeger-collector:14250
    tls:
      insecure: true
  
  prometheus:
    endpoint: "0.0.0.0:8889"
    metric_expiration: 180m
    send_timestamps: true
  
  elasticsearch:
    endpoints: ["http://elasticsearch:9200"]
    index: "otel-spans"

service:
  pipelines:
    traces:
      receivers: [otlp, jaeger, zipkin]
      processors: [batch, resource]
      exporters: [jaeger, elasticsearch]
    
    metrics:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [prometheus]
```

## Application Instrumentation

### Node.js Application Monitoring
```javascript
// monitoring.js
const prometheus = require('prom-client');
const express = require('express');
const opentelemetry = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/auto-instrumentations-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Prometheus metrics
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections'
});

const businessMetrics = new prometheus.Counter({
  name: 'business_events_total',
  help: 'Total business events',
  labelNames: ['event_type', 'status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(businessMetrics);

// OpenTelemetry setup
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'webapp',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Middleware for metrics collection
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
    activeConnections.dec();
  });
  
  next();
};

// Health check endpoint
const healthCheck = (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.APP_VERSION || '1.0.0'
  };
  
  res.json(healthData);
};

// Business metrics tracking
const trackBusinessEvent = (eventType, status = 'success') => {
  businessMetrics.inc({ event_type: eventType, status });
  
  // Create custom span for business events
  const span = opentelemetry.trace.getActiveSpan();
  if (span) {
    span.addEvent('business.event', {
      'event.type': eventType,
      'event.status': status
    });
  }
};

module.exports = {
  register,
  metricsMiddleware,
  healthCheck,
  trackBusinessEvent
};
```

### Python Application Monitoring
```python
# monitoring.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest, REGISTRY
from opentelemetry import trace, metrics
from opentelemetry.auto_instrumentation import sitecustomize
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.semconv.resource import ResourceAttributes
import time
import logging

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

ACTIVE_REQUESTS = Gauge(
    'http_requests_active',
    'Active HTTP requests'
)

BUSINESS_EVENTS = Counter(
    'business_events_total',
    'Business events',
    ['event_type', 'status']
)

# OpenTelemetry setup
resource = Resource.create({
    ResourceAttributes.SERVICE_NAME: "api-service",
    ResourceAttributes.SERVICE_VERSION: "1.0.0",
    ResourceAttributes.DEPLOYMENT_ENVIRONMENT: "production"
})

trace.set_tracer_provider(TracerProvider(resource=resource))
tracer = trace.get_tracer(__name__)

jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger-agent",
    agent_port=6831,
)

span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

class MonitoringMiddleware:
    def __init__(self, app):
        self.app = app
    
    def __call__(self, environ, start_response):
        start_time = time.time()
        method = environ['REQUEST_METHOD']
        path = environ['PATH_INFO']
        
        ACTIVE_REQUESTS.inc()
        
        with tracer.start_as_current_span(f"{method} {path}") as span:
            span.set_attribute("http.method", method)
            span.set_attribute("http.url", path)
            
            def custom_start_response(status, response_headers, exc_info=None):
                status_code = int(status.split()[0])
                span.set_attribute("http.status_code", status_code)
                
                duration = time.time() - start_time
                REQUEST_LATENCY.labels(method=method, endpoint=path).observe(duration)
                REQUEST_COUNT.labels(method=method, endpoint=path, status=status_code).inc()
                ACTIVE_REQUESTS.dec()
                
                return start_response(status, response_headers, exc_info)
            
            return self.app(environ, custom_start_response)

def track_business_event(event_type, status='success'):
    """Track custom business events"""
    BUSINESS_EVENTS.labels(event_type=event_type, status=status).inc()
    
    current_span = trace.get_current_span()
    if current_span:
        current_span.add_event('business.event', {
            'event.type': event_type,
            'event.status': status
        })

def get_metrics():
    """Return Prometheus metrics"""
    return generate_latest(REGISTRY)

def health_check():
    """Health check endpoint data"""
    return {
        'status': 'healthy',
        'timestamp': time.time(),
        'version': '1.0.0'
    }
```

## Alert Rules

### Infrastructure Alerts
```yaml
# infrastructure-alerts.yml
groups:
- name: infrastructure.rules
  rules:
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage on {{ $labels.instance }}"
      description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"
  
  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage on {{ $labels.instance }}"
      description: "Memory usage is {{ $value }}% on {{ $labels.instance }}"
  
  - alert: DiskSpaceLow
    expr: (node_filesystem_avail_bytes * 100) / node_filesystem_size_bytes < 10
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Low disk space on {{ $labels.instance }}"
      description: "Disk space is {{ $value }}% full on {{ $labels.instance }} ({{ $labels.mountpoint }})"
  
  - alert: PodCrashLooping
    expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
    for: 0m
    labels:
      severity: warning
    annotations:
      summary: "Pod {{ $labels.pod }} is crash looping"
      description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is restarting frequently"
  
  - alert: PodNotReady
    expr: kube_pod_status_ready{condition="false"} > 0
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Pod {{ $labels.pod }} not ready"
      description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} has been not ready for more than 10 minutes"
```

### Application Alerts
```yaml
# application-alerts.yml
groups:
- name: application.rules
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 5
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }}% which is above the 5% threshold"
  
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }}s"
  
  - alert: DatabaseConnectionFailures
    expr: rate(database_connection_errors_total[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failures"
      description: "Database connection failure rate: {{ $value }} errors/sec"
  
  - alert: QueueBacklog
    expr: rabbitmq_queue_messages > 1000
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Queue backlog detected"
      description: "Queue {{ $labels.queue }} has {{ $value }} messages pending"
```

## Best Practices

### Monitoring Strategy
- **Four Golden Signals**: Latency, Traffic, Errors, Saturation
- **SLI/SLO Definition**: Define Service Level Indicators and Objectives
- **Alert Fatigue Prevention**: Meaningful alerts with proper thresholds
- **Runbook Documentation**: Automated response procedures
- **Capacity Planning**: Proactive resource scaling based on trends

### Log Management
- **Structured Logging**: JSON format with consistent field names
- **Log Levels**: Appropriate use of DEBUG, INFO, WARN, ERROR levels
- **Correlation IDs**: Track requests across service boundaries
- **Log Retention**: Appropriate retention policies for different log types
- **Security Considerations**: No sensitive data in logs

### Observability Design
- **Instrumentation**: Comprehensive application instrumentation
- **Distributed Tracing**: End-to-end request tracing
- **Custom Metrics**: Business-specific metrics alongside technical metrics
- **Synthetic Monitoring**: Proactive health checks and user journey testing
- **Real User Monitoring**: Track actual user experience

## Universal Guidelines

*This context follows the Universal Agent Guidelines in CLAUDE.md*

**CRITICAL FOLDER SEPARATION**: All monitoring configurations and dashboards MUST be environment-specific and never shared between production and non-production environments.