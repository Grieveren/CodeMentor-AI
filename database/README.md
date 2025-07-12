# Database

This directory contains database schemas, migrations, and related configurations for CodeMentor-AI.

## Overview

Database management for CodeMentor-AI including schema definitions, migration scripts, seeders, and backup configurations.

## Structure

```
database/
├── migrations/        # Database migration files
├── seeders/          # Database seed data
├── schemas/          # Database schema definitions
├── backups/          # Database backup scripts
└── config/           # Database configuration
```

## Database Schema

### Core Tables

- `users` - User accounts and profiles
- `mentoring_sessions` - AI mentoring sessions
- `code_reviews` - Code review data
- `learning_paths` - Personalized learning tracks
- `exercises` - Coding exercises and challenges
- `progress` - User progress tracking

## Development

```bash
# Run migrations
npm run migrate

# Seed database
npm run seed

# Create new migration
npm run migration:create

# Rollback migrations
npm run migrate:rollback
```

## Technologies

- PostgreSQL or MongoDB
- Prisma ORM or Mongoose
- Migration tools (Knex.js, Flyway, etc.)
- Database versioning and backup strategies
