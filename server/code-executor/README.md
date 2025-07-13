# Secure Code Execution Service

A secure, multi-language code execution service that runs untrusted code in ephemeral Docker containers with strict resource limits and security isolation.

## Features

- **Multi-language Support**: Python, JavaScript/Node.js, Go, Java, C, C++, Rust, Ruby, PHP
- **Secure Execution**: Ephemeral Docker containers with network isolation and read-only filesystems
- **Resource Limits**: CPU, memory, and execution time limits
- **Dual API**: Both gRPC and REST APIs
- **Security**: No network access, dropped capabilities, non-root execution
- **Auto-cleanup**: Containers are automatically removed after execution

## Security Features

- **Network Isolation**: Containers run with `--network=none`
- **Read-only Filesystem**: Root filesystem is read-only
- **No Privileges**: All capabilities dropped, no new privileges
- **Resource Limits**: CPU and memory limits enforced
- **Timeout Protection**: Execution timeouts prevent long-running processes
- **Ephemeral Containers**: Each execution uses a fresh container

## Quick Start

### Using Docker Compose

```bash
# Start the service
docker-compose up -d

# Check health
curl http://localhost:8080/health
```

### Using Go

```bash
# Install dependencies
go mod download

# Run the service
go run cmd/main.go

# Run with specific mode
go run cmd/main.go -mode=http -http-port=8080
go run cmd/main.go -mode=grpc -grpc-port=50051
go run cmd/main.go -mode=both -http-port=8080 -grpc-port=50051
```

## API Documentation

### REST API

#### Execute Code

```bash
POST /api/v1/execute
Content-Type: application/json

{
  "language": "python",
  "code": "print('Hello, World!')",
  "input": "",
  "timeout_seconds": 30,
  "memory_limit_mb": 128,
  "cpu_limit": 0.5
}
```

**Response:**
```json
{
  "stdout": "Hello, World!\n",
  "stderr": "",
  "exit_code": 0,
  "timeout": false,
  "memory_exceeded": false,
  "execution_time_ms": 125,
  "memory_used_mb": 12
}
```

#### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### gRPC API

The service also exposes a gRPC API defined in `proto/executor.proto`.

#### Example gRPC Client (Go)

```go
import (
    "context"
    "google.golang.org/grpc"
    pb "code-executor/proto"
)

conn, err := grpc.Dial("localhost:50051", grpc.WithInsecure())
if err != nil {
    log.Fatal(err)
}
defer conn.Close()

client := pb.NewCodeExecutorClient(conn)

req := &pb.ExecuteRequest{
    Language: "python",
    Code:     "print('Hello from gRPC!')",
    TimeoutSeconds: 30,
    MemoryLimitMb: 128,
    CpuLimit: 0.5,
}

resp, err := client.Execute(context.Background(), req)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Output: %s\n", resp.Stdout)
```

## Supported Languages

| Language | Image | Notes |
|----------|-------|-------|
| Python | `python:3.11-alpine` | Python 3.11 |
| JavaScript/Node.js | `node:18-alpine` | Node.js 18 |
| Go | `golang:1.21-alpine` | Go 1.21 |
| Java | `openjdk:11-alpine` | OpenJDK 11 |
| C | `gcc:alpine` | GCC compiler |
| C++ | `gcc:alpine` | G++ compiler |
| Rust | `rust:alpine` | Rust compiler |
| Ruby | `ruby:3.2-alpine` | Ruby 3.2 |
| PHP | `php:8.2-alpine` | PHP 8.2 |

## Usage Examples

### Python

```bash
curl -X POST http://localhost:8080/api/v1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "import sys\nprint(f\"Python version: {sys.version}\")\nprint(\"Hello, World!\")"
  }'
```

### JavaScript

```bash
curl -X POST http://localhost:8080/api/v1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "console.log(\"Node.js version:\", process.version);\nconsole.log(\"Hello, World!\");"
  }'
```

### Go

```bash
curl -X POST http://localhost:8080/api/v1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "go",
    "code": "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}"
  }'
```

### With Input

```bash
curl -X POST http://localhost:8080/api/v1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "name = input(\"Enter your name: \")\nprint(f\"Hello, {name}!\")",
    "input": "Alice\n"
  }'
```

## Configuration

### Environment Variables

- `DOCKER_HOST`: Docker daemon socket (default: `unix:///var/run/docker.sock`)

### Command Line Flags

- `-grpc-port`: gRPC server port (default: `50051`)
- `-http-port`: HTTP server port (default: `8080`)
- `-mode`: Server mode - `grpc`, `http`, or `both` (default: `both`)

### Resource Limits

- **Default Timeout**: 30 seconds (max: 120 seconds)
- **Default Memory**: 128MB (max: 1GB)
- **Default CPU**: 50% (max: 100%)

## Development

### Prerequisites

- Go 1.21+
- Docker
- Protocol Buffers compiler (`protoc`)

### Building

```bash
# Generate protobuf code
protoc --proto_path=proto --go_out=. --go-grpc_out=. proto/executor.proto

# Build the application
go build -o code-executor cmd/main.go

# Run tests
go test ./...
```

### Docker Build

```bash
# Build image
docker build -t code-executor .

# Run container
docker run -p 8080:8080 -p 50051:50051 -v /var/run/docker.sock:/var/run/docker.sock code-executor
```

## Production Deployment

### Security Considerations

1. **Docker Socket Access**: The service needs access to Docker socket to create containers
2. **Image Management**: Pre-pull required images for faster execution
3. **Resource Monitoring**: Monitor CPU and memory usage
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Logging**: Enable structured logging for security auditing

### Example Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: code-executor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: code-executor
  template:
    metadata:
      labels:
        app: code-executor
    spec:
      containers:
      - name: code-executor
        image: code-executor:latest
        ports:
        - containerPort: 8080
        - containerPort: 50051
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        volumeMounts:
        - name: docker-sock
          mountPath: /var/run/docker.sock
      volumes:
      - name: docker-sock
        hostPath:
          path: /var/run/docker.sock
```

## Monitoring

### Health Checks

The service provides health endpoints:
- HTTP: `GET /health`
- gRPC: `Health` RPC method

### Metrics

Consider adding metrics for:
- Execution count by language
- Average execution time
- Memory usage
- Error rates
- Container creation/cleanup times

## Troubleshooting

### Common Issues

1. **Docker permission denied**: Ensure the service has access to Docker socket
2. **Image pull failures**: Check Docker registry access and image names
3. **Container timeout**: Increase timeout limits or check for infinite loops
4. **Memory limits**: Increase memory limits for memory-intensive code

### Logs

Enable debug logging:
```bash
go run cmd/main.go -v=2
```

## License

This project is licensed under the MIT License.
