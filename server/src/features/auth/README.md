# Authentication & Authorization System

This authentication system provides comprehensive JWT-based authentication with role-based access control and OAuth integration.

## Features

### 🔐 JWT Authentication
- **Access/Refresh Token Pair**: Short-lived access tokens (15min) with long-lived refresh tokens (7 days)
- **Secure Token Storage**: Refresh tokens stored in database with expiry tracking
- **Token Rotation**: Automatic token refresh with rotation for enhanced security

### 🛡️ Enhanced Password Security
- **bcrypt Hashing**: Configurable salt rounds (default: 12)
- **Password Strength Validation**: Enforces strong password requirements
- **Automatic Rehashing**: Updates password hashes when salt rounds increase
- **Password Strength Scoring**: Real-time password strength assessment

### 👥 Role-Based Access Control
- **User Roles**: Student, Instructor, Admin
- **Granular Permissions**: Fine-grained access control middleware
- **Resource-Based Access**: Self-or-admin access patterns
- **Optional Authentication**: Support for public/private hybrid endpoints

### 🔗 OAuth Integration
- **GitHub OAuth**: Ready-to-use GitHub authentication
- **Google OAuth**: Ready-to-use Google authentication
- **Extensible**: Easy to add more OAuth providers

## Architecture

```
auth/
├── controller.ts     # Authentication endpoints
├── service.ts        # Database operations
├── middleware.ts     # Authentication & authorization middleware
├── jwt.ts           # JWT token management
├── password.ts      # Password security utilities
├── oauth.ts         # OAuth configuration & handlers
├── routes.ts        # Route definitions
└── validation.ts    # Input validation schemas
```

## API Endpoints

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "name": "John Doe",
  "username": "johndoe"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

#### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer your-access-token-here
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer your-access-token-here
```

#### Logout All Devices
```
POST /api/auth/logout-all
Authorization: Bearer your-access-token-here
```

### OAuth Endpoints

#### GitHub OAuth
```
GET /api/auth/github
```

#### Google OAuth
```
GET /api/auth/google
```

### Role-Based Demo Endpoints

#### Admin Only
```
GET /api/auth/admin-only
Authorization: Bearer your-access-token-here
```

#### Instructor or Admin
```
GET /api/auth/instructor-or-admin
Authorization: Bearer your-access-token-here
```

#### Student Access (All Roles)
```
GET /api/auth/student-access
Authorization: Bearer your-access-token-here
```

## Middleware Usage

### Authentication Middleware
```typescript
import { authenticate } from './features/auth/middleware.js';

// Protect routes requiring authentication
router.get('/protected', authenticate, yourHandler);
```

### Role-Based Authorization
```typescript
import { authorize, adminOnly, instructorOrAdmin, studentAccess } from './features/auth/middleware.js';

// Specific roles
router.get('/admin', authenticate, adminOnly, handler);
router.get('/teaching', authenticate, instructorOrAdmin, handler);
router.get('/learning', authenticate, studentAccess, handler);

// Custom role combinations
router.get('/custom', authenticate, authorize('ADMIN', 'INSTRUCTOR'), handler);
```

### Self-or-Admin Access
```typescript
import { selfOrAdmin } from './features/auth/middleware.js';

// Users can access their own resources, admins can access any
router.get('/users/:userId/profile', authenticate, selfOrAdmin, handler);
```

### Optional Authentication
```typescript
import { optionalAuth } from './features/auth/middleware.js';

// Public endpoint with optional user context
router.get('/public-content', optionalAuth, handler);
```

## Environment Configuration

Copy the environment variables from `.env.example` and configure:

```bash
# JWT Configuration
JWT_ACCESS_SECRET=your-very-secure-access-token-secret-key-here
JWT_REFRESH_SECRET=your-very-secure-refresh-token-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Password Security
BCRYPT_SALT_ROUNDS=12

# OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Client Configuration
CLIENT_URL=http://localhost:3000
```

## Database Schema

The authentication system uses these database fields:

```prisma
model User {
  id                 String    @id @default(cuid())
  email              String    @unique
  username           String    @unique
  name               String?
  role               UserRole  @default(STUDENT)
  
  // Authentication
  passwordHash       String?
  emailVerified      Boolean   @default(false)
  refreshToken       String?
  refreshTokenExpiry DateTime?
  
  // ... other fields
}

enum UserRole {
  STUDENT
  INSTRUCTOR
  ADMIN
}
```

## Security Best Practices

### JWT Security
- **Separate Secrets**: Different secrets for access and refresh tokens
- **Short Access Token Lifetime**: 15 minutes reduces exposure window
- **Token Rotation**: Refresh tokens are rotated on each use
- **Secure Storage**: Refresh tokens stored securely in database

### Password Security
- **Strong Hashing**: bcrypt with configurable salt rounds
- **Password Validation**: Enforces complexity requirements
- **Automatic Rehashing**: Updates old hashes when security improves
- **No Plain Text Storage**: Passwords are never stored in plain text

### OAuth Security
- **State Validation**: CSRF protection for OAuth flows
- **Secure Callbacks**: Proper redirect URL validation
- **Token Exchange**: Secure token exchange after OAuth success

## Error Handling

The system provides comprehensive error handling:

- **Authentication Errors**: 401 Unauthorized for invalid/missing tokens
- **Authorization Errors**: 403 Forbidden for insufficient permissions
- **Validation Errors**: 400 Bad Request for invalid input
- **OAuth Errors**: Proper error handling with user-friendly redirects

## Testing

Example test cases for authentication:

```typescript
// Test user registration
describe('POST /auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'StrongPassword123!',
        name: 'Test User',
        username: 'testuser'
      });

    expect(response.status).toBe(201);
    expect(response.body.data.tokens.accessToken).toBeDefined();
    expect(response.body.data.tokens.refreshToken).toBeDefined();
  });
});

// Test role-based access
describe('Role-based access control', () => {
  it('should allow admin access to admin routes', async () => {
    const adminToken = await getTokenForRole('ADMIN');
    const response = await request(app)
      .get('/api/auth/admin-only')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should deny student access to admin routes', async () => {
    const studentToken = await getTokenForRole('STUDENT');
    const response = await request(app)
      .get('/api/auth/admin-only')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
  });
});
```

## Future Enhancements

### Planned Features
- **Two-Factor Authentication**: SMS/TOTP support
- **Email Verification**: Account verification flow
- **Password Reset**: Secure password reset via email
- **Rate Limiting**: Brute force protection
- **Account Lockout**: Temporary account suspension
- **Audit Logging**: Authentication event tracking

### OAuth Extensions
- **Additional Providers**: LinkedIn, Twitter, Microsoft
- **OAuth Scopes**: Fine-grained permission requests
- **Account Linking**: Link multiple OAuth accounts

### Advanced Security
- **Device Fingerprinting**: Enhanced session security
- **Geo-location Tracking**: Suspicious login detection
- **JWT Blacklisting**: Revoked token tracking
- **Security Headers**: Enhanced HTTP security headers

## Support

For questions or issues with the authentication system:

1. Check the error logs for detailed error messages
2. Verify environment variables are correctly configured
3. Ensure database migrations are up to date
4. Review the middleware setup in your routes

The authentication system is designed to be secure, scalable, and easy to integrate with your application's existing architecture.
