# Changelog

All notable changes to the CodeMentor-AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive specification-based development learning platform features
- Monaco Editor integration with custom specification language support
- RequirementsEditor component for creating and validating requirement documents
- EARS format (Easy Approach to Requirements Syntax) support with validation
- User story templates and auto-completion
- Real-time document validation with diagnostic markers
- Hover providers for specification format guidance
- Custom Monaco theme optimized for specification documents
- Comprehensive TypeScript type definitions for specifications
- Test infrastructure for Monaco Editor and specification components

### Changed

- Migrated from npm/npx to pnpm for package management consistency
- Updated Husky pre-commit hooks to use `pnpm lint-staged` instead of `npx lint-staged`
- Updated Husky pre-push hooks to use `pnpm test` instead of `npm test`
- Enhanced project focus from general coding education to specification-based development methodology
- Improved test infrastructure with proper monaco-editor mocking

### Fixed

- Removed conflicting package-lock.json file (project uses pnpm)
- Fixed failing tests for monaco-editor imports by adding proper mocks
- Fixed MockEditor initialization error in RequirementsEditor tests
- Fixed validateSpecificationDocument function to handle tasks with leading whitespace
- Updated test assertions to match actual component rendering

### Documentation

- Updated client/README.md to reflect specification-based development focus
- Updated client/IMPLEMENTATION_SUMMARY.md to include Monaco Editor implementation
- Created comprehensive documentation for specification environment setup
- Added detailed type definitions documentation

## [0.1.0] - 2024-01-21

### Initial Development Phase

- Project initialization with monorepo structure
- Basic infrastructure setup with Docker and TypeScript
- Authentication system with JWT and OAuth support
- AI integration layer with Claude API
- Code execution service with security isolation
- Database schema design with Prisma
- Frontend scaffolding with React 18 and Vite
- UI component library with Tailwind CSS
- Layout components and navigation structure
