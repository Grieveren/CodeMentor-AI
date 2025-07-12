# Server

This directory contains the backend API server for CodeMentor-AI.

## Overview

The server application provides RESTful APIs and handles business logic for the CodeMentor-AI platform, including user authentication, AI integration, and data management.

## Structure

```
server/
├── src/
│   ├── controllers/   # Request handlers
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── services/      # Business logic
│   ├── utils/         # Utility functions
│   └── config/        # Configuration files
├── tests/             # Server-side tests
└── docs/              # API documentation
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Generate API documentation
npm run docs
```

## Technologies

- Node.js with Express or Fastify
- TypeScript
- MongoDB or PostgreSQL
- JWT for authentication
- OpenAI API integration
- Jest for testing
