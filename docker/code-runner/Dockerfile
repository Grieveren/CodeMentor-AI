# Base image with Node.js
FROM node:20-alpine AS base

# Install system dependencies for code execution
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    g++ \
    make \
    bash \
    curl \
    git \
    && ln -sf python3 /usr/bin/python

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package manager files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY code-runner/package.json ./code-runner/

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Copy code-runner source code
COPY code-runner/ ./code-runner/

# Set working directory to code-runner
WORKDIR /app/code-runner

# Expose port
EXPOSE 3002

# Start development server with hot reload
CMD ["pnpm", "run", "dev"]

# Build stage
FROM base AS build

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy code-runner source code
COPY code-runner/ ./code-runner/

# Set working directory to code-runner
WORKDIR /app/code-runner

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install system dependencies for code execution
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    g++ \
    make \
    bash \
    curl \
    git \
    dumb-init \
    && ln -sf python3 /usr/bin/python

# Install pnpm
RUN npm install -g pnpm

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY code-runner/package.json ./code-runner/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/code-runner/dist ./code-runner/dist/

# Create directory for code execution with proper permissions
RUN mkdir -p /tmp/code-execution && chown nodejs:nodejs /tmp/code-execution

# Switch to non-root user
USER nodejs

# Set working directory to code-runner
WORKDIR /app/code-runner

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 3002, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
