# API Service Layer

This directory contains the API service layer for the CodeMentor AI frontend application. The service layer provides a clean, type-safe interface for communicating with the backend API.

## Architecture

### Core Components

1. **ApiClient** (`apiClient.ts`) - Base HTTP client with Axios
   - Authentication token management
   - Request/response interceptors
   - Error handling and retry logic
   - Request/response logging (development mode)

2. **Service Classes** - Domain-specific API services
   - `AuthService` - Authentication and user management
   - `LessonsService` - Lesson and track management
   - `AIService` - AI-powered features (chat, code review, hints)
   - `ExecutionService` - Code execution and testing
   - `ProgressService` - User progress tracking and analytics

### Features

#### Authentication & Security
- Automatic JWT token attachment to requests
- Token refresh on 401 responses
- Secure token storage integration
- OAuth provider support (GitHub, Google)

#### Error Handling
- Standardized error format (`ApiError`)
- Network error detection and retry
- User-friendly error messages
- Development-mode error logging

#### Request Management
- Configurable retry logic for failed requests
- Request/response logging in development
- Timeout handling
- Request cancellation support

#### Type Safety
- Full TypeScript support
- Strongly typed request/response interfaces
- Generic API response wrapper
- Comprehensive type definitions

## Usage Examples

### Basic API Calls

```typescript
import { api } from '@/services';

// Authentication
const authData = await api.auth.login({ email, password });
const user = await api.auth.getCurrentUser();

// Lessons
const lessons = await api.lessons.getLessons({ category: 'javascript' });
const lesson = await api.lessons.getLessonById('lesson-id');

// Code Execution
const result = await api.execution.executeCode({
  code: 'console.log("Hello World");',
  language: 'javascript'
});

// AI Features
const review = await api.ai.reviewCode({
  code: 'function add(a, b) { return a + b; }',
  language: 'javascript'
});

// Progress Tracking
const progress = await api.progress.getUserProgress();
await api.progress.completeLesson('lesson-id', 300); // 300 seconds
```

### Using Individual Services

```typescript
import { authService, lessonsService } from '@/services';

// Direct service usage
const user = await authService.getCurrentUser();
const lessons = await lessonsService.getFeaturedLessons(6);
```

### Error Handling

```typescript
import { api } from '@/services';
import type { ApiError } from '@/types';

try {
  const result = await api.execution.executeCode(request);
} catch (error) {
  const apiError = error as ApiError;
  console.error('Execution failed:', apiError.message);
  
  if (apiError.status === 429) {
    // Handle rate limiting
  }
}
```

### Configuration

The API client uses configuration from `@/utils/config`:

```typescript
// Environment variables
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEBUG=true
```

## Integration with Zustand Stores

The services integrate seamlessly with Zustand stores:

```typescript
// In auth store
import { authService } from '@/services/authService';

const useAuthStore = create<AuthStore>((set, get) => ({
  login: async (credentials) => {
    const authData = await authService.login(credentials);
    set({ user: authData.user, token: authData.token });
  },
}));
```

## Development Features

### Request/Response Logging
When `VITE_ENABLE_DEBUG=true`, all API requests and responses are logged to the console with detailed information.

### Retry Configuration
The retry behavior can be customized:

```typescript
import { apiClient } from '@/services';

apiClient.setRetryConfig({
  retries: 5,
  retryDelay: 2000,
  retryCondition: (error) => error.response?.status >= 500
});
```

## API Endpoints

The services map to the following backend endpoints:

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `POST /refresh` - Token refresh
- `GET /me` - Current user profile
- `POST /oauth/github` - GitHub OAuth
- `POST /oauth/google` - Google OAuth

### Lessons (`/api/lessons`, `/api/tracks`)
- `GET /lessons` - List lessons with filtering
- `GET /lessons/:id` - Get lesson details
- `GET /tracks` - List learning tracks
- `GET /tracks/:id` - Get track details

### AI Features (`/api/ai`)
- `POST /review` - Code review
- `POST /chat` - AI chat
- `POST /hint` - Get hints
- `POST /explain` - Concept explanations

### Code Execution (`/api/execution`)
- `POST /run` - Execute code
- `POST /challenge` - Submit challenge solution
- `POST /test` - Run test cases

### Progress (`/api/progress`)
- `GET /` - User progress overview
- `POST /lessons/:id` - Update lesson progress
- `GET /stats` - Progress statistics
- `GET /achievements` - User achievements

## Error Types

The service layer handles various error scenarios:

- **Network Errors** - Connection issues, timeouts
- **Authentication Errors** - Invalid tokens, expired sessions
- **Validation Errors** - Invalid request data
- **Rate Limiting** - Too many requests
- **Server Errors** - Backend failures

All errors are transformed to the standard `ApiError` format for consistent handling throughout the application.