# CodeMentor AI - Frontend Client

This directory contains the React frontend application for the CodeMentor AI specification-based development learning platform.

## Overview

The client application is built with React 18 and TypeScript, providing an intuitive interface for learning and practicing specification-based development methodology. It features interactive document editors, AI-powered assistance, collaborative tools, and comprehensive learning resources.

## Key Features

### Specification Document Editing
- **Monaco Editor Integration**: Custom specification language with syntax highlighting for requirements (EARS format), design documents, and task lists
- **Real-time Validation**: Live document structure validation with error markers and suggestions
- **Auto-completion**: Context-aware suggestions for specification formats, templates, and best practices
- **Hover Assistance**: Interactive tooltips providing guidance on specification formats and patterns

### Learning Platform
- **Methodology Lessons**: Interactive curriculum teaching specification-based development principles
- **Hands-on Workshops**: Practical exercises for creating requirements, design documents, and implementation tasks
- **Progress Tracking**: Skill development monitoring and methodology mastery assessment
- **Template Library**: Comprehensive collection of specification templates and examples

### Collaboration Tools
- **Real-time Editing**: Multi-user collaborative document editing with conflict resolution
- **Review Workflows**: Structured approval processes for specification documents
- **Team Analytics**: Progress tracking and methodology adoption metrics

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI components (Button, Input, etc.)
│   │   ├── layout/         # Layout components (AppLayout, Navigation)
│   │   ├── specifications/ # Specification document components
│   │   ├── lessons/        # Learning and lesson components
│   │   └── forms/          # Form components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions and configurations
│   └── styles/             # Global styles and Tailwind config
├── public/                 # Static assets
├── dist/                   # Build output
└── tests/                  # Test files
```

## Development

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test

# Run linting
pnpm run lint

# Format code
pnpm run format
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_AI_ASSISTANCE=true
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_REAL_TIME_EDITING=true

# Monaco Editor Configuration
VITE_MAX_DOCUMENT_SIZE=1048576
VITE_AUTO_SAVE_INTERVAL=30000
VITE_VALIDATION_DEBOUNCE=1000

# OAuth Configuration (optional)
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Technology Stack

### Core Framework
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast build tool with hot module replacement

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful hand-crafted SVG icons
- **Class Variance Authority**: Type-safe component variants

### State Management and Data
- **Zustand**: Lightweight state management with persistence
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation
- **Axios**: HTTP client with interceptors and retry logic

### Code Editing and Documentation
- **Monaco Editor**: VS Code editor with custom specification language support
- **Unified/Remark**: Markdown processing for specification documents
- **React Router**: Client-side routing with nested routes

### Development Tools
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **Husky**: Git hooks for code quality

## Architecture

### Component Architecture
- **Atomic Design**: Components organized by complexity (atoms, molecules, organisms)
- **Compound Components**: Complex components with sub-components (Card, Modal)
- **Custom Hooks**: Reusable logic for state management and API calls
- **Context Providers**: Global state for authentication and application settings

### State Management
- **Zustand Stores**: Separate stores for different domains (auth, lessons, specifications)
- **Persistence**: Automatic state persistence to localStorage
- **Optimistic Updates**: Immediate UI updates with error rollback

### API Integration
- **Service Layer**: Abstracted API calls with error handling and retry logic
- **Type Safety**: Full TypeScript coverage for API requests and responses
- **Authentication**: JWT token management with automatic refresh
- **Error Handling**: Centralized error handling with user-friendly messages

## Testing

### Unit Tests
- Component testing with React Testing Library
- Hook testing with custom test utilities
- Service layer testing with mocked APIs
- Utility function testing

### Integration Tests
- End-to-end user workflows
- API integration testing
- Monaco Editor integration testing
- Specification document validation testing

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Run specific test file
pnpm run test -- --testNamePattern="Monaco"
```

## Build and Deployment

### Production Build

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Build Optimization
- **Code Splitting**: Automatic route-based and component-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image compression and format optimization
- **Bundle Analysis**: Size analysis and optimization recommendations

## Contributing

1. Follow the established component patterns and TypeScript conventions
2. Write tests for new components and features
3. Use semantic commit messages
4. Ensure all linting and formatting checks pass
5. Update documentation for significant changes

## Documentation

- [Specification Environment Setup](./SPECIFICATION_ENVIRONMENT_SETUP.md) - Development environment configuration
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Current implementation status
- [Component Documentation](./src/components/README.md) - Component usage and examples
