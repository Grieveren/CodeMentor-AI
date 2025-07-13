# Base image with Node.js
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package manager files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Copy client source code
COPY client/ ./client/

# Set working directory to client
WORKDIR /app/client

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]

# Build stage
FROM base AS build

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy client source code
COPY client/ ./client/

# Set working directory to client
WORKDIR /app/client

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY docker/client/nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/client/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx
RUN adduser -S nginx -u 1001

# Set ownership of nginx files
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chown -R nginx:nginx /var/cache/nginx
RUN chown -R nginx:nginx /var/log/nginx
RUN chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
