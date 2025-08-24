# AgileAiAgents Dashboard Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build environment
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files
COPY project-dashboard/package*.json ./project-dashboard/

# Install dependencies
WORKDIR /app/project-dashboard
RUN npm ci --only=production

# Copy dashboard source files
COPY project-dashboard/ .

# Stage 2: Production environment
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache tini curl

# Create non-root user
RUN addgroup -g 1001 -S agileai && \
    adduser -S agileai -u 1001

# Set working directory
WORKDIR /app

# Copy entire project structure
COPY --chown=agileai:agileai . .

# Copy node_modules from builder
COPY --from=builder --chown=agileai:agileai /app/project-dashboard/node_modules ./project-dashboard/node_modules

# Create necessary directories
RUN mkdir -p logs project-documents && \
    chown -R agileai:agileai logs project-documents

# Switch to non-root user
USER agileai

# Expose port (default 3001, can be overridden)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${DASHBOARD_PORT:-3001}/api/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the dashboard
CMD ["node", "project-dashboard/server-secure.js"]

# Stage 3: Development environment
FROM node:18-alpine AS development

# Install development dependencies
RUN apk add --no-cache python3 make g++ git bash

# Set working directory
WORKDIR /app

# Copy package files
COPY project-dashboard/package*.json ./project-dashboard/

# Install all dependencies (including dev)
WORKDIR /app/project-dashboard
RUN npm install

# Copy entire project
WORKDIR /app
COPY . .

# Create necessary directories
RUN mkdir -p logs project-documents

# Expose port
EXPOSE 3001

# Development command with hot reload
CMD ["npm", "--prefix", "project-dashboard", "run", "dev:secure"]