# CodeMentor AI - API Documentation

## Overview

The CodeMentor AI backend is built with Node.js, Express, and TypeScript following a modular architecture with feature-based folders. It includes express-async-errors, helmet, CORS, Winston logger, and global error handling.

## Architecture

### Folder Structure

```
src/
├── config/
│   └── logger.ts           # Winston logger configuration
├── middleware/
│   └── errorHandler.ts     # Global error handler
├── features/
│   ├── auth/               # Authentication module
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── middleware.ts
│   │   ├── validation.ts
│   │   └── routes.ts
│   ├── lessons/            # Lessons module
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── validation.ts
│   │   └── routes.ts
│   ├── progress/           # Progress tracking module
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   └── routes.ts
│   ├── ai/                 # AI-powered features
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   └── routes.ts
│   └── execution/          # Code execution module
│       ├── controller.ts
│       ├── service.ts
│       └── routes.ts
├── app.ts                  # Main application configuration
└── index.ts                # Server entry point
```

### Key Features

- **Modular Architecture**: Each feature is self-contained with its own controller, service, routes, and validation
- **Security**: Helmet middleware for security headers, CORS configuration
- **Error Handling**: Global error handler with custom error classes
- **Logging**: Winston logger with console and file transports
- **Authentication**: JWT-based authentication with middleware
- **Validation**: Joi validation schemas for request data
- **Database**: Prisma ORM for database operations

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - User logout (protected)

### Lessons (`/api/lessons`)

- `GET /api/lessons` - Get all lessons (with pagination and filters)
- `GET /api/lessons/:id` - Get lesson by ID
- `GET /api/lessons/category/:category` - Get lessons by category
- `POST /api/lessons` - Create lesson (admin only)
- `PUT /api/lessons/:id` - Update lesson (admin only)
- `DELETE /api/lessons/:id` - Delete lesson (admin only)

### Progress (`/api/progress`)

- `GET /api/progress` - Get user progress (protected)
- `PUT /api/progress/lesson/:lessonId` - Update lesson progress (protected)
- `GET /api/progress/stats` - Get progress statistics (protected)

### AI Features (`/api/ai`)

- `POST /api/ai/hint` - Generate hint for exercise (protected)
- `POST /api/ai/explain` - Explain programming concept (protected)
- `POST /api/ai/review` - Review code (protected)
- `POST /api/ai/exercise` - Generate exercise (protected)
- `GET /api/ai/recommendations` - Get personalized recommendations (protected)

### Code Execution (`/api/execution`)

- `POST /api/execution/execute` - Execute code (protected)
- `POST /api/execution/test` - Test code with test cases (protected)
- `POST /api/execution/validate` - Validate solution (protected)
- `GET /api/execution/history` - Get execution history (protected)

## Security Features

### Helmet Configuration
- Content Security Policy
- XSS Protection
- Frame Options
- HSTS Headers

### CORS Configuration
- Configurable origins
- Credential support
- Method restrictions

### Authentication
- JWT tokens
- Protected routes
- Role-based authorization

## Error Handling

### Custom Error Classes
- `CustomError` - Operational errors
- `AppError` - Application errors

### Global Error Handler
- Development vs Production error responses
- Error logging
- HTTP status code mapping

## Logging

### Winston Logger
- Console transport (development)
- File transport (production)
- Error-specific logs
- Request logging middleware

## Environment Variables

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
DATABASE_URL=your-database-url
```

## Development

### Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Testing
npm test
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Database
npm run db:generate
npm run db:push
npm run db:migrate
```

### Testing

The project uses Jest for testing with TypeScript support and ESM configuration.

## Production Considerations

### Code Execution Security
The current code execution feature uses placeholders. In production, implement:
- Docker containers for sandboxed execution
- Resource limits (CPU, memory, time)
- Language-specific runtime environments
- Security scanning

### AI Integration
The AI features use placeholders. For production:
- Integrate with OpenAI API or similar
- Implement rate limiting
- Add caching for common requests
- Handle API failures gracefully

### Database
- Use connection pooling
- Implement database migrations
- Add indexes for performance
- Regular backups

### Monitoring
- Add application monitoring
- Implement health checks
- Set up alerting
- Track performance metrics
