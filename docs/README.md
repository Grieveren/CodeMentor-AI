# Documentation

This directory contains comprehensive documentation for the CodeMentor-AI project.

## Overview

Complete documentation covering architecture, API references, deployment guides, and development practices.

## Structure

```
docs/
├── api/                  # API documentation
│   ├── endpoints.md
│   ├── authentication.md
│   └── examples.md
├── architecture/         # System architecture
│   ├── overview.md
│   ├── database-design.md
│   └── security.md
├── deployment/           # Deployment guides
│   ├── docker.md
│   ├── production.md
│   └── monitoring.md
├── development/          # Development guides
│   ├── setup.md
│   ├── contributing.md
│   └── testing.md
├── user-guides/          # User documentation
│   ├── getting-started.md
│   ├── features.md
│   └── troubleshooting.md
└── assets/               # Images and diagrams
    ├── architecture/
    └── screenshots/
```

## Documentation Types

### API Documentation

- Complete endpoint references
- Authentication and authorization
- Request/response examples
- Error handling

### Architecture Documentation

- System overview and design decisions
- Database schema and relationships
- Security considerations
- Performance optimization

### Deployment Documentation

- Environment setup
- Docker deployment
- Production deployment
- Monitoring and logging

### Development Documentation

- Local development setup
- Coding standards and best practices
- Testing strategies
- Contributing guidelines

## Building Documentation

```bash
# Generate API docs
npm run docs:api

# Build documentation site
npm run docs:build

# Serve documentation locally
npm run docs:serve
```

## Tools

- Markdown for documentation
- Mermaid for diagrams
- OpenAPI/Swagger for API docs
- DocSaurus or GitBook for documentation sites
