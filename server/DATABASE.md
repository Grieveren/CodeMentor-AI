# Database Schema & Setup

This document describes the database schema design and setup process for the CodeMentor AI application.

## Overview

The application uses PostgreSQL as the primary database with Prisma ORM for type-safe database operations. The schema is designed to support:

- User management and authentication
- Learning tracks and lessons
- Interactive coding challenges
- Progress tracking
- AI-powered chat history
- Code submissions and evaluations

## Database Schema

### Core Tables

#### Users
- **Purpose**: User authentication and profile management
- **Key Fields**: email, username, role (STUDENT/INSTRUCTOR/ADMIN), profile info
- **Relations**: One-to-many with Progress, Submissions, ChatHistory

#### Tracks
- **Purpose**: Learning paths (e.g., "Web Development", "Python Programming")
- **Key Fields**: title, description, difficulty, tags, publishing status
- **Relations**: One-to-many with Lessons, Progress

#### Lessons
- **Purpose**: Individual learning units within tracks
- **Key Fields**: title, content (markdown), difficulty, estimated time
- **Relations**: Belongs to Track, one-to-many with Challenges, Progress

#### Challenges
- **Purpose**: Coding exercises within lessons
- **Key Fields**: instructions, starting code, solution, test cases
- **Relations**: Belongs to Lesson, one-to-many with Submissions

#### Submissions
- **Purpose**: User code submissions for challenges
- **Key Fields**: code, language, execution results, test results, scoring
- **Relations**: Belongs to User and Challenge

#### Progress
- **Purpose**: Track user progress through tracks and lessons
- **Key Fields**: status, score, time spent, completion timestamps
- **Relations**: Belongs to User, optionally to Track or Lesson

#### ChatHistory
- **Purpose**: AI mentor conversation history
- **Key Fields**: message, role (USER/ASSISTANT), context
- **Relations**: Belongs to User

### Enums

- **UserRole**: STUDENT, INSTRUCTOR, ADMIN
- **DifficultyLevel**: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- **ProgrammingLanguage**: JAVASCRIPT, TYPESCRIPT, PYTHON, JAVA, etc.
- **SubmissionStatus**: PENDING, RUNNING, COMPLETED, FAILED, TIMEOUT
- **ProgressStatus**: NOT_STARTED, IN_PROGRESS, COMPLETED, PAUSED
- **ChatRole**: USER, ASSISTANT

## Setup Instructions

### Prerequisites

1. **PostgreSQL Database**
   - Install PostgreSQL locally or use a cloud service
   - Create a database named `codementor_ai`
   - Note connection details (host, port, username, password)

2. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database connection string
   DATABASE_URL="postgresql://username:password@localhost:5432/codementor_ai"
   ```

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

3. **Setup Database Schema**
   ```bash
   # For development (creates and applies migrations)
   npm run db:migrate

   # Or for quick prototyping (pushes schema directly)
   npm run db:push
   ```

4. **Seed Sample Data**
   ```bash
   npm run db:seed
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:migrate:prod` | Deploy migrations to production |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:reset` | Reset database and run migrations |

### Migration Utility

For more advanced database operations, use the migration utility:

```bash
# Check database connection
tsx src/lib/migrate.ts check

# Validate schema
tsx src/lib/migrate.ts validate

# Full database setup
tsx src/lib/migrate.ts setup

# Create new migration
tsx src/lib/migrate.ts create add-user-preferences

# Check migration status
tsx src/lib/migrate.ts status
```

## Sample Data

The seed script creates:

- **2 Users**: 1 student, 1 instructor
- **3 Tracks**: Web Development, React, Python
- **5 Lessons**: HTML, CSS, JavaScript, React Components, Python Basics
- **3 Challenges**: HTML page creation, JavaScript calculator, Python list operations
- **Progress Records**: Sample user progress
- **Submissions**: Sample code submissions
- **Chat History**: Sample AI mentor conversations

### Sample Users

```typescript
// Student Account
{
  email: 'student@example.com',
  username: 'student1',
  name: 'John Doe',
  role: 'STUDENT'
}

// Instructor Account
{
  email: 'instructor@example.com',
  username: 'instructor1',
  name: 'Jane Smith',
  role: 'INSTRUCTOR'
}
```

## Database Administration

### Prisma Studio

Launch the visual database browser:
```bash
npm run db:studio
```

### Backup & Restore

```bash
# Backup
pg_dump codementor_ai > backup.sql

# Restore
psql codementor_ai < backup.sql
```

### Production Deployment

1. **Set Environment Variables**
   ```bash
   DATABASE_URL="postgresql://..."
   NODE_ENV=production
   ```

2. **Deploy Migrations**
   ```bash
   npm run db:migrate:prod
   ```

3. **Generate Client**
   ```bash
   npm run db:generate
   ```

## Schema Design Principles

### Data Integrity
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate users/slugs
- Cascade deletes maintain consistency

### Flexibility
- JSON fields for dynamic data (test cases, context)
- Enum types for consistent categorization
- Optional fields for extensibility

### Performance
- Indexed fields for common queries
- Efficient relationship modeling
- Proper data types for storage optimization

### Security
- No sensitive data in plain text
- Proper authentication field handling
- Role-based access control support

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify DATABASE_URL format
   - Check PostgreSQL service status
   - Confirm database exists

2. **Migration Failures**
   - Check for conflicting schema changes
   - Verify database permissions
   - Review migration logs

3. **Type Errors**
   - Regenerate Prisma client after schema changes
   - Check for enum value mismatches
   - Verify import paths

### Getting Help

- Check Prisma documentation: https://www.prisma.io/docs
- Review migration logs in `prisma/migrations/`
- Use `npx prisma validate` to check schema syntax
- Test database connection with `tsx src/lib/migrate.ts check`
