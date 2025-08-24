# Node.js Microservices Architecture

A scalable microservices architecture built with Node.js, Express, MongoDB, and RabbitMQ.

## Architecture Overview

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Client    │────▶│   API Gateway   │────▶│   Services   │
└─────────────┘     └─────────────────┘     └──────────────┘
                             │                       │
                             ▼                       ▼
                    ┌─────────────────┐     ┌──────────────┐
                    │   Auth Service  │     │  RabbitMQ    │
                    └─────────────────┘     └──────────────┘
```

## Services

* **API Gateway** (Port 3000) - Routes requests to appropriate services
* **Auth Service** (Port 3001) - Authentication and authorization
* **User Service** (Port 3002) - User management
* **Product Service** (Port 3003) - Product catalog
* **Order Service** (Port 3004) - Order processing
* **Payment Service** (Port 3005) - Payment processing
* **Notification Service** (Port 3006) - Email/SMS notifications

## Tech Stack

* **Runtime**: Node.js with Express
* **Database**: MongoDB (separate DB per service)
* **Message Broker**: RabbitMQ for async communication
* **Caching**: Redis
* **API Gateway**: Express Gateway / Kong
* **Container**: Docker & Docker Compose
* **Orchestration**: Kubernetes (production)

## Getting Started

### Prerequisites

* Docker and Docker Compose
* Node.js 18+ (for local development)
* Git

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-name>
```

2. Start all services:
```bash
docker-compose up -d
```

3. Check service health:
```bash
docker-compose ps
```

4. View logs:
```bash
docker-compose logs -f [service-name]
```

### Access Points

* API Gateway: http://localhost:3000
* RabbitMQ Management: http://localhost:15672 (admin/admin)
* MailHog (Email Testing): http://localhost:8025
* Prometheus: http://localhost:9090
* Grafana: http://localhost:3030 (admin/admin)

## Development

### Working on a Specific Service

```bash
cd services/[service-name]
npm install
npm run dev
```

### Running Tests

```bash
# Test all services
npm test

# Test specific service
cd services/[service-name]
npm test
```

### Adding a New Service

1. Create service directory:
```bash
mkdir -p services/new-service/src/{controllers,models,routes,services,middleware,utils}
```

2. Initialize package.json:
```bash
cd services/new-service
npm init -y
```

3. Install dependencies:
```bash
npm install express mongoose dotenv cors helmet compression amqplib
npm install -D nodemon jest supertest
```

4. Add service to docker-compose.yml

5. Update API Gateway routes

## Communication Patterns

### Synchronous (HTTP)
Used for:
* Client requests
* Real-time queries
* Simple CRUD operations

### Asynchronous (RabbitMQ)
Used for:
* Event notifications
* Long-running processes
* Service decoupling
* Eventual consistency

### Example Event Flow
```
Order Created → RabbitMQ → Payment Service
                        ↘
                          Notification Service
                        ↘
                          Inventory Service
```

## Project Structure

```
.
├── api-gateway/           # API Gateway service
├── services/              # Microservices
│   ├── auth-service/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── notification-service/
├── shared/                # Shared libraries
│   ├── models/
│   ├── utils/
│   └── middleware/
├── infrastructure/        # IaC and configs
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
├── scripts/              # Utility scripts
└── docker-compose.yml    # Local orchestration
```

## Service Communication

### Internal API Calls
```javascript
// From one service to another
const response = await axios.get('http://user-service:3002/api/users/123');
```

### Publishing Events
```javascript
// Publish to RabbitMQ
await channel.publish('events', 'user.created', Buffer.from(JSON.stringify(userData)));
```

### Subscribing to Events
```javascript
// Subscribe in another service
channel.consume('user.created', (msg) => {
  const userData = JSON.parse(msg.content.toString());
  // Process event
});
```

## Deployment

### Local Development
```bash
docker-compose up -d
```

### Production (Kubernetes)
```bash
kubectl apply -f infrastructure/kubernetes/
```

### CI/CD Pipeline
1. Run tests
2. Build Docker images
3. Push to registry
4. Deploy to Kubernetes
5. Run health checks

## Monitoring

* **Logs**: Centralized logging with ELK stack
* **Metrics**: Prometheus + Grafana
* **Tracing**: Jaeger for distributed tracing
* **Health Checks**: Each service exposes /health endpoint

## Security

* JWT-based authentication
* Service-to-service authentication
* Rate limiting at API Gateway
* CORS configuration
* Helmet.js for security headers

## Best Practices

1. **One database per service** - No shared databases
2. **API versioning** - Support multiple versions
3. **Circuit breakers** - Prevent cascade failures
4. **Event sourcing** - Maintain audit trail
5. **Health checks** - Monitor service health
6. **Centralized logging** - Aggregate logs
7. **Distributed tracing** - Track requests across services

## Troubleshooting

### Service Won't Start
* Check logs: `docker-compose logs [service-name]`
* Verify dependencies are running
* Check environment variables

### Cannot Connect to Service
* Ensure service is in same Docker network
* Use service name, not localhost
* Check firewall rules

### RabbitMQ Connection Issues
* Wait for RabbitMQ to be ready
* Check credentials
* Verify network connectivity

## Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Run linting
5. Submit pull request

## License

[Your License Here]