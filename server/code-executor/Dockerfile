FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/main.go

FROM alpine:latest

# Install ca-certificates for HTTPS requests and wget for health check
RUN apk --no-cache add ca-certificates wget

# Add non-root user
RUN addgroup -g 1001 appuser && adduser -D -u 1001 -G appuser appuser

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Change ownership
RUN chown appuser:appuser main

USER appuser

# Expose ports
EXPOSE 8080 50051

# Run the application
CMD ["./main"]
