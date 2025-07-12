# CodeMentor-AI

A comprehensive AI-powered coding mentor platform that provides personalized guidance, code reviews, and learning resources for developers.

## Project Structure

```
CodeMentor-AI/
├── client/          # Frontend application
├── server/          # Backend API server
├── database/        # Database schemas and migrations
├── docker/          # Docker configurations
├── docs/            # Project documentation
├── README.md        # This file
└── LICENSE          # MIT License
```

## Features

- AI-powered code reviews and suggestions
- Personalized learning paths
- Interactive coding exercises
- Real-time mentorship
- Progress tracking and analytics

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/CodeMentor-AI.git
   cd CodeMentor-AI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development environment:
   ```bash
   docker-compose up -d
   npm run dev
   ```

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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue on GitHub or contact the maintainers.
