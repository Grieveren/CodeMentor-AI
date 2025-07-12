# Docker

This directory contains Docker configurations for CodeMentor-AI deployment and development.

## Overview

Docker containerization setup for consistent development and production environments across all services.

## Structure

```
docker/
├── docker-compose.yml          # Main compose file
├── docker-compose.dev.yml      # Development overrides
├── docker-compose.prod.yml     # Production overrides
├── Dockerfile.client           # Client application
├── Dockerfile.server           # Server application
├── Dockerfile.database         # Database setup
├── nginx/                      # Nginx configuration
│   ├── nginx.conf
│   └── ssl/
└── scripts/                    # Docker utility scripts
    ├── build.sh
    ├── deploy.sh
    └── cleanup.sh
```

## Development

```bash
# Start all services
docker-compose up

# Start in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Build all images
docker-compose build

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down
```

## Production

```bash
# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose up --scale server=3

# Update services
docker-compose pull && docker-compose up -d
```

## Services

- **client**: Frontend React/Next.js application
- **server**: Backend Node.js API
- **database**: PostgreSQL/MongoDB database
- **nginx**: Reverse proxy and static file serving
- **redis**: Caching and session storage (optional)
