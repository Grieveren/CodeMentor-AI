# CodeMentor-AI

A comprehensive specification-based development learning platform that teaches developers the complete workflow of spec-driven development methodology. The platform combines AI-powered guidance, interactive lessons, collaborative tools, and hands-on exercises to provide practical experience with specification-based development from requirements gathering through implementation.

## Project Structure

```
CodeMentor-AI/
├── client/          # Frontend React application with TypeScript
├── server/          # Backend API server with specification services
├── code-runner/     # Code execution service
├── database/        # Database schemas and migrations
├── docker/          # Docker configurations
├── docs/            # Project documentation
├── packages/        # Shared packages and utilities
├── .kiro/           # Kiro specifications and project configuration
├── README.md        # This file
└── LICENSE          # MIT License
```

## Features

### Specification-Based Development Learning
- **Requirements Engineering**: Interactive lessons on creating EARS-format requirements and user stories
- **Design Documentation**: Guided creation of architecture documents, component specifications, and data models
- **Task Breakdown**: Structured approach to breaking down designs into implementable tasks
- **Implementation Tracking**: Code-to-specification traceability and validation

### AI-Powered Assistance
- **Specification Review**: AI analysis of requirements, design, and task documents for quality and completeness
- **Methodology Coaching**: Interactive AI tutor specialized in specification-based development practices
- **Code Validation**: Automated checking of implementation against original specifications
- **Best Practice Guidance**: Real-time suggestions for improving specification quality

### Collaborative Development
- **Real-time Collaboration**: Multi-user editing of specification documents with conflict resolution
- **Review Workflows**: Structured approval processes for specification documents
- **Team Progress Tracking**: Analytics on specification methodology adoption and team effectiveness
- **Template Library**: Comprehensive collection of specification templates and examples

### Learning and Progress
- **Methodology Curriculum**: Step-by-step lessons on specification-based development principles
- **Hands-on Workshops**: Practical exercises simulating real-world specification scenarios
- **Skill Assessment**: Progress tracking for specification creation and methodology mastery
- **Business Impact Education**: Understanding ROI and organizational benefits of spec-driven development

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/CodeMentor-AI.git
   cd CodeMentor-AI
   ```

2. Install dependencies:

   ```bash
   pnpm install
   # or
   npm install
   ```

3. Set up environment variables:

   ```bash
   # Client environment
   cp client/.env.example client/.env.local
   
   # Server environment
   cp server/.env.example server/.env
   
   # Code runner environment
   cp code-runner/.env.example code-runner/.env
   ```

4. Start the development environment:
   ```bash
   # Start all services with Docker
   docker-compose up -d
   
   # Start development servers
   pnpm run dev
   ```

### Quick Start Guide

1. **Access the Application**: Navigate to `http://localhost:5173` for the client application
2. **Create Your First Specification Project**: Use the guided project creation wizard
3. **Follow the Methodology**: Progress through Requirements → Design → Tasks → Implementation phases
4. **Get AI Feedback**: Request AI review at each phase for quality improvement
5. **Collaborate**: Invite team members for real-time collaborative specification development

## Development

### Code Quality

This project uses pre-commit hooks to ensure code quality:

- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- Jest for testing
- Husky for git hooks

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## Scripts

### Development
- `pnpm run dev` - Start all development servers (client, server, code-runner)
- `pnpm run dev:client` - Start client development server only
- `pnpm run dev:server` - Start server development server only
- `pnpm run dev:code-runner` - Start code execution service only

### Building
- `pnpm run build` - Build all applications for production
- `pnpm run build:client` - Build client application
- `pnpm run build:server` - Build server application

### Testing
- `pnpm run test` - Run all tests
- `pnpm run test:client` - Run client tests
- `pnpm run test:server` - Run server tests
- `pnpm run test:e2e` - Run end-to-end tests

### Code Quality
- `pnpm run lint` - Run linter across all packages
- `pnpm run format` - Format code with Prettier
- `pnpm run type-check` - Run TypeScript type checking

### Database
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:seed` - Seed database with sample data
- `pnpm run db:reset` - Reset database and reseed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue on GitHub or contact the maintainers.
