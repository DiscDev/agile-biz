---
title: "Security & Compliance - DevOps Agent Context"
type: "agent-context"
agent: "devops"
keywords: ["security", "compliance", "ssl", "certificates", "network", "vault", "secrets", "rbac", "policies"]
token_count: 2916
---

# Security & Compliance - DevOps Agent Context

## When to Load This Context
- **Keywords**: security, compliance, ssl, certificates, network, vault, secrets, rbac, policies
- **Tasks**: Security configuration, compliance automation, certificate management, access control

## Overview
Security and compliance operations focus on implementing robust security controls, maintaining compliance standards, and automating security processes throughout the infrastructure lifecycle. This context covers security automation, compliance frameworks, and operational security practices.

## Infrastructure Security

### Network Security Configuration
```yaml
# network-policies.yml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-tier-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: web
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          tier: api
    ports:
    - protocol: TCP
      port: 3000
  - to: []
    ports:
    - protocol: TCP
      port: 443  # HTTPS outbound
    - protocol: UDP
      port: 53   # DNS

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: api
    ports:
    - protocol: TCP
      port: 5432
```

### Pod Security Standards
```yaml
# pod-security-policy.yml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  allowedCapabilities:
    - NET_BIND_SERVICE
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  supplementalGroups:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  readOnlyRootFilesystem: true
  seLinux:
    rule: 'RunAsAny'

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: restricted-service-account
  namespace: production

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: restricted-role
rules:
- apiGroups: [""]
  resources: ["pods", "configmaps", "secrets"]
  verbs: ["get", "list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: restricted-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: restricted-service-account
  namespace: production
roleRef:
  kind: Role
  name: restricted-role
  apiGroup: rbac.authorization.k8s.io
```

## Secret Management

### HashiCorp Vault Integration
```yaml
# vault-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vault
  namespace: vault
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vault
  template:
    metadata:
      labels:
        app: vault
    spec:
      serviceAccountName: vault
      securityContext:
        runAsNonRoot: true
        runAsUser: 100
        fsGroup: 1000
      containers:
      - name: vault
        image: vault:1.15.0
        ports:
        - containerPort: 8200
          name: vault-port
        - containerPort: 8201
          name: cluster-port
        env:
        - name: VAULT_ADDR
          value: "https://127.0.0.1:8200"
        - name: VAULT_API_ADDR
          value: "https://vault.vault.svc.cluster.local:8200"
        - name: VAULT_CLUSTER_ADDR
          value: "https://vault.vault.svc.cluster.local:8201"
        - name: VAULT_RAFT_NODE_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        volumeMounts:
        - name: vault-config
          mountPath: /vault/config
        - name: vault-data
          mountPath: /vault/data
        - name: vault-tls
          mountPath: /vault/tls
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
            add:
            - IPC_LOCK
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: vault-config
        configMap:
          name: vault-config
      - name: vault-data
        persistentVolumeClaim:
          claimName: vault-data
      - name: vault-tls
        secret:
          secretName: vault-tls

---
# vault-config.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: vault-config
  namespace: vault
data:
  vault.hcl: |
    ui = true
    
    listener "tcp" {
      address = "0.0.0.0:8200"
      tls_cert_file = "/vault/tls/tls.crt"
      tls_key_file = "/vault/tls/tls.key"
    }
    
    storage "raft" {
      path = "/vault/data"
      node_id = "VAULT_RAFT_NODE_ID"
      
      retry_join {
        leader_api_addr = "https://vault-0.vault.vault.svc.cluster.local:8200"
      }
      retry_join {
        leader_api_addr = "https://vault-1.vault.vault.svc.cluster.local:8200"
      }
      retry_join {
        leader_api_addr = "https://vault-2.vault.vault.svc.cluster.local:8200"
      }
    }
    
    seal "gcpckms" {
      project     = "my-project"
      region      = "us-west-2"
      key_ring    = "vault-unseal"
      crypto_key  = "vault-key"
    }
    
    api_addr = "https://vault.vault.svc.cluster.local:8200"
    cluster_addr = "https://vault.vault.svc.cluster.local:8201"
```

### External Secrets Operator
```yaml
# external-secrets.yml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: production
spec:
  provider:
    vault:
      server: "https://vault.vault.svc.cluster.local:8200"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "webapp-role"
          serviceAccountRef:
            name: "webapp-sa"

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: webapp-secrets
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: webapp-secrets
    creationPolicy: Owner
  data:
  - secretKey: database-password
    remoteRef:
      key: secret/webapp/database
      property: password
  - secretKey: api-key
    remoteRef:
      key: secret/webapp/external-api
      property: key
  - secretKey: jwt-secret
    remoteRef:
      key: secret/webapp/auth
      property: jwt-secret

---
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-west-2
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
            namespace: external-secrets-system
```

## Certificate Management

### Cert-Manager Configuration
```yaml
# cert-manager-issuer.yml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
          podTemplate:
            spec:
              nodeSelector:
                kubernetes.io/arch: amd64
    - dns01:
        route53:
          region: us-west-2
          accessKeyID: AKIAIOSFODNN7EXAMPLE
          secretAccessKeySecretRef:
            name: route53-credentials-secret
            key: secret-access-key

---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: webapp-tls
  namespace: production
spec:
  secretName: webapp-tls-secret
  duration: 2160h # 90d
  renewBefore: 360h # 15d before expiry
  subject:
    organizations:
    - example-org
  commonName: webapp.example.com
  dnsNames:
  - webapp.example.com
  - api.example.com
  - "*.api.example.com"
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
    group: cert-manager.io

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - webapp.example.com
    - api.example.com
    secretName: webapp-tls-secret
  rules:
  - host: webapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webapp-service
            port:
              number: 80
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

## Compliance Automation

### CIS Benchmarks Implementation
```yaml
# cis-benchmark-policy.yml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: cis-benchmark-controls
  annotations:
    policies.kyverno.io/title: CIS Kubernetes Benchmark
    policies.kyverno.io/category: Security
    policies.kyverno.io/severity: medium
    policies.kyverno.io/description: >-
      Implements CIS Kubernetes Benchmark security controls
spec:
  validationFailureAction: enforce
  background: true
  rules:
  - name: check-seccomp-profile
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Seccomp profile is required for all pods"
      pattern:
        spec:
          securityContext:
            seccompProfile:
              type: RuntimeDefault
  
  - name: check-readonly-root-filesystem
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Root filesystem must be read-only"
      pattern:
        spec:
          containers:
          - securityContext:
              readOnlyRootFilesystem: true
  
  - name: check-non-root-user
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Container must run as non-root user"
      pattern:
        spec:
          securityContext:
            runAsNonRoot: true
          containers:
          - securityContext:
              runAsNonRoot: true

---
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: restrict-privileged-containers
spec:
  validationFailureAction: enforce
  rules:
  - name: check-privileged
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Privileged containers are not allowed"
      pattern:
        spec:
          containers:
          - securityContext:
              privileged: false
  
  - name: check-capabilities
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Containers must drop ALL capabilities"
      pattern:
        spec:
          containers:
          - securityContext:
              capabilities:
                drop:
                - ALL
```

### GDPR Compliance Automation
```yaml
# gdpr-compliance.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gdpr-data-retention-policy
  namespace: compliance
data:
  policy.yaml: |
    retention_policies:
      user_data:
        retention_period: "7 years"
        deletion_method: "secure_wipe"
        anonymization_fields: ["email", "ip_address", "device_id"]
      
      audit_logs:
        retention_period: "10 years"
        compression_enabled: true
        encryption_required: true
      
      session_data:
        retention_period: "30 days"
        auto_cleanup: true
      
      marketing_data:
        retention_period: "2 years"
        consent_required: true
        opt_out_enabled: true

---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: gdpr-data-cleanup
  namespace: compliance
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cleanup-job
            image: gdpr-cleanup:latest
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: url
            - name: RETENTION_POLICY_CONFIG
              value: "/config/policy.yaml"
            volumeMounts:
            - name: policy-config
              mountPath: /config
            command:
            - /bin/sh
            - -c
            - |
              echo "Starting GDPR compliance cleanup..."
              python /app/gdpr_cleanup.py --config /config/policy.yaml
              echo "GDPR compliance cleanup completed"
          volumes:
          - name: policy-config
            configMap:
              name: gdpr-data-retention-policy
          restartPolicy: OnFailure
```

## Security Scanning and Vulnerability Management

### Container Security Scanning
```yaml
# security-scanning-pipeline.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: security-scan-config
data:
  scan-config.yaml: |
    scanners:
      trivy:
        enabled: true
        severity_threshold: "MEDIUM"
        ignore_unfixed: false
        formats: ["json", "sarif"]
      
      snyk:
        enabled: true
        severity_threshold: "high"
        monitor: true
        fail_on: "high"
      
      clair:
        enabled: true
        minimum_priority: "Medium"
      
    policies:
      fail_build_on_high_severity: true
      max_critical_vulnerabilities: 0
      max_high_vulnerabilities: 5
      whitelist_cves: []

---
apiVersion: batch/v1
kind: Job
metadata:
  name: security-scan-job
spec:
  template:
    spec:
      containers:
      - name: security-scanner
        image: security-tools:latest
        env:
        - name: IMAGE_TO_SCAN
          value: "webapp:latest"
        - name: SCAN_CONFIG
          value: "/config/scan-config.yaml"
        volumeMounts:
        - name: scan-config
          mountPath: /config
        - name: docker-socket
          mountPath: /var/run/docker.sock
        command:
        - /bin/bash
        - -c
        - |
          set -e
          
          echo "Scanning image: $IMAGE_TO_SCAN"
          
          # Trivy scan
          trivy image --format json --output /tmp/trivy-results.json $IMAGE_TO_SCAN
          trivy image --format sarif --output /tmp/trivy-results.sarif $IMAGE_TO_SCAN
          
          # Snyk scan
          snyk container test $IMAGE_TO_SCAN --json > /tmp/snyk-results.json
          
          # Check results against policy
          python /app/evaluate_scan_results.py \
            --trivy-results /tmp/trivy-results.json \
            --snyk-results /tmp/snyk-results.json \
            --policy /config/scan-config.yaml
          
          echo "Security scan completed successfully"
      volumes:
      - name: scan-config
        configMap:
          name: security-scan-config
      - name: docker-socket
        hostPath:
          path: /var/run/docker.sock
      restartPolicy: Never
```

### Runtime Security Monitoring
```yaml
# falco-security-monitoring.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: falco-config
  namespace: falco-system
data:
  falco.yaml: |
    rules_file:
      - /etc/falco/falco_rules.yaml
      - /etc/falco/k8s_audit_rules.yaml
      - /etc/falco/custom_rules.yaml
    
    time_format_iso_8601: true
    json_output: true
    json_include_output_property: true
    
    outputs:
      rate: 1
      max_burst: 1000
    
    syslog_output:
      enabled: false
    
    file_output:
      enabled: true
      keep_alive: false
      filename: /var/log/falco_events.log
    
    stdout_output:
      enabled: true
    
    webserver:
      enabled: true
      listen_port: 8765
      k8s_healthz_endpoint: /healthz
      ssl_enabled: false
    
    grpc:
      enabled: true
      bind_address: "0.0.0.0:5060"
      threadiness: 0
    
    grpc_output:
      enabled: true

  custom_rules.yaml: |
    - rule: Suspicious Network Activity
      desc: Detect suspicious network connections
      condition: >
        spawned_process and proc.name in (nc, ncat, netcat, wget, curl) and
        proc.args contains "reverse" or proc.args contains "shell"
      output: >
        Suspicious network activity detected (user=%user.name command=%proc.cmdline
        container=%container.name image=%container.image)
      priority: WARNING
      tags: [network, mitre_command_and_control]
    
    - rule: Cryptocurrency Mining Activity
      desc: Detect potential cryptocurrency mining
      condition: >
        spawned_process and proc.name in (xmrig, minerd, cpuminer, stratum) or
        proc.args contains "stratum+tcp" or proc.args contains "mining"
      output: >
        Potential cryptocurrency mining detected (user=%user.name command=%proc.cmdline
        container=%container.name image=%container.image)
      priority: CRITICAL
      tags: [mining, malware]
    
    - rule: Sensitive File Access
      desc: Monitor access to sensitive files
      condition: >
        open_read and (fd.name startswith "/etc/passwd" or fd.name startswith "/etc/shadow" or
        fd.name startswith "/etc/ssh/" or fd.name contains "/.ssh/")
      output: >
        Sensitive file accessed (user=%user.name file=%fd.name command=%proc.cmdline
        container=%container.name)
      priority: WARNING
      tags: [filesystem, credentials]

---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: falco
  namespace: falco-system
spec:
  selector:
    matchLabels:
      app: falco
  template:
    metadata:
      labels:
        app: falco
    spec:
      serviceAccount: falco
      containers:
      - name: falco
        image: falcosecurity/falco:latest
        securityContext:
          privileged: true
        args:
          - /usr/bin/falco
          - --cri=/run/containerd/containerd.sock
          - --k8s-api-url=https://kubernetes.default.svc.cluster.local
        volumeMounts:
        - mountPath: /etc/falco
          name: falco-config
        - mountPath: /host/var/run/docker.sock
          name: docker-socket
        - mountPath: /host/dev
          name: dev-fs
        - mountPath: /host/proc
          name: proc-fs
          readOnly: true
        - mountPath: /host/boot
          name: boot-fs
          readOnly: true
        - mountPath: /host/lib/modules
          name: lib-modules
          readOnly: true
        - mountPath: /host/usr
          name: usr-fs
          readOnly: true
        - mountPath: /host/etc
          name: etc-fs
          readOnly: true
        resources:
          limits:
            memory: 1Gi
            cpu: 1000m
          requests:
            memory: 512Mi
            cpu: 100m
      volumes:
      - name: falco-config
        configMap:
          name: falco-config
      - name: docker-socket
        hostPath:
          path: /var/run/docker.sock
      - name: dev-fs
        hostPath:
          path: /dev
      - name: proc-fs
        hostPath:
          path: /proc
      - name: boot-fs
        hostPath:
          path: /boot
      - name: lib-modules
        hostPath:
          path: /lib/modules
      - name: usr-fs
        hostPath:
          path: /usr
      - name: etc-fs
        hostPath:
          path: /etc
      hostNetwork: true
      hostPID: true
```

## Access Control and RBAC

### Advanced RBAC Configuration
```yaml
# rbac-advanced.yml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: security-administrator
rules:
- apiGroups: [""]
  resources: ["secrets", "configmaps"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
- apiGroups: [""]
  resources: ["pods", "services", "endpoints"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["networkpolicies"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
- apiGroups: ["policy"]
  resources: ["podsecuritypolicies"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
- apiGroups: ["rbac.authorization.k8s.io"]
  resources: ["roles", "rolebindings", "clusterroles", "clusterrolebindings"]
  verbs: ["get", "list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: application-manager
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch", "create", "update", "patch"]
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: [""]
  resources: ["pods/log", "pods/exec"]
  verbs: ["get", "list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: read-only-auditor
rules:
- apiGroups: [""]
  resources: ["*"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps", "extensions", "networking.k8s.io"]
  resources: ["*"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["secrets"]
  verbs: []  # No access to secrets

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: security-admin-sa
  namespace: kube-system

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: security-admin-binding
subjects:
- kind: ServiceAccount
  name: security-admin-sa
  namespace: kube-system
roleRef:
  kind: ClusterRole
  name: security-administrator
  apiGroup: rbac.authorization.k8s.io
```

## Security Incident Response

### Automated Incident Response
```yaml
# incident-response-automation.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: incident-response-playbook
data:
  playbook.yaml: |
    incident_types:
      malware_detection:
        severity: critical
        actions:
          - isolate_pod
          - capture_forensics
          - alert_security_team
          - create_incident_ticket
        
      suspicious_network_activity:
        severity: high
        actions:
          - block_network_traffic
          - capture_network_logs
          - alert_security_team
        
      unauthorized_access:
        severity: high
        actions:
          - revoke_access_tokens
          - force_password_reset
          - audit_access_logs
          - alert_security_team
    
    automation_scripts:
      isolate_pod: |
        kubectl patch deployment $DEPLOYMENT_NAME -p '{"spec":{"replicas":0}}'
        kubectl label pod $POD_NAME quarantine=true
        kubectl annotate pod $POD_NAME incident.timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
      
      capture_forensics: |
        kubectl cp $POD_NAME:/tmp/forensics-$(date +%s).tar.gz /forensics/
        kubectl exec $POD_NAME -- ps aux > /forensics/processes-$(date +%s).txt
        kubectl logs $POD_NAME --previous > /forensics/logs-$(date +%s).txt

---
apiVersion: batch/v1
kind: Job
metadata:
  name: security-incident-handler
spec:
  template:
    spec:
      serviceAccountName: incident-response-sa
      containers:
      - name: incident-handler
        image: incident-response:latest
        env:
        - name: INCIDENT_TYPE
          value: "malware_detection"
        - name: AFFECTED_POD
          value: "webapp-pod-xyz"
        - name: SLACK_WEBHOOK_URL
          valueFrom:
            secretKeyRef:
              name: incident-secrets
              key: slack-webhook
        volumeMounts:
        - name: playbook-config
          mountPath: /config
        command:
        - /bin/bash
        - -c
        - |
          set -e
          
          INCIDENT_ID=$(date +%Y%m%d-%H%M%S)-$(openssl rand -hex 4)
          echo "Processing security incident: $INCIDENT_ID"
          
          # Execute incident response playbook
          python /app/incident_response.py \
            --incident-type "$INCIDENT_TYPE" \
            --affected-resource "$AFFECTED_POD" \
            --incident-id "$INCIDENT_ID" \
            --config /config/playbook.yaml
          
          # Send alert
          curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Security Incident $INCIDENT_ID: $INCIDENT_TYPE detected on $AFFECTED_POD\"}"
          
          echo "Incident response completed for: $INCIDENT_ID"
      volumes:
      - name: playbook-config
        configMap:
          name: incident-response-playbook
      restartPolicy: Never
```

## Best Practices

### Security Automation Principles
- **Zero Trust Architecture**: Never trust, always verify
- **Defense in Depth**: Multiple layers of security controls
- **Principle of Least Privilege**: Minimal required access
- **Security by Design**: Build security into every component
- **Continuous Monitoring**: Real-time threat detection and response

### Compliance Management
- **Automated Compliance Checks**: Continuous compliance monitoring
- **Documentation Automation**: Automated generation of compliance reports
- **Evidence Collection**: Systematic collection of compliance evidence
- **Regular Audits**: Scheduled compliance assessments
- **Remediation Tracking**: Automated tracking of security improvements

### Incident Response
- **Rapid Detection**: Automated threat detection and alerting
- **Containment Procedures**: Immediate threat containment
- **Forensic Collection**: Systematic evidence preservation
- **Communication Protocols**: Clear incident communication procedures
- **Recovery Procedures**: Rapid system recovery and restoration

## Universal Guidelines

*This context follows the Universal Agent Guidelines in CLAUDE.md*

**CRITICAL SECURITY SEPARATION**: All security configurations, secrets, and compliance data MUST be strictly separated by environment and access level. Production security configurations must never be accessible from non-production environments.