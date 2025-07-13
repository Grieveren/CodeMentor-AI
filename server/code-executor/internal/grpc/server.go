package grpc

import (
	"context"
	"fmt"
	"time"

	"code-executor/internal/docker"
	pb "code-executor/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// Server implements the CodeExecutor gRPC service
type Server struct {
	pb.UnimplementedCodeExecutorServer
	dockerManager *docker.Manager
}

// NewServer creates a new gRPC server
func NewServer(dockerManager *docker.Manager) *Server {
	return &Server{
		dockerManager: dockerManager,
	}
}

// Execute implements the Execute RPC method
func (s *Server) Execute(ctx context.Context, req *pb.ExecuteRequest) (*pb.ExecuteResponse, error) {
	// Validate request
	if req.Language == "" {
		return nil, status.Error(codes.InvalidArgument, "language is required")
	}
	if req.Code == "" {
		return nil, status.Error(codes.InvalidArgument, "code is required")
	}

	// Set default values
	timeout := time.Duration(req.TimeoutSeconds) * time.Second
	if timeout == 0 {
		timeout = 30 * time.Second
	}
	if timeout > 120*time.Second {
		timeout = 120 * time.Second // Maximum 2 minutes
	}

	memoryLimit := req.MemoryLimitMb * 1024 * 1024 // Convert MB to bytes
	if memoryLimit == 0 {
		memoryLimit = 128 * 1024 * 1024 // Default 128MB
	}
	if memoryLimit > 1024*1024*1024 {
		memoryLimit = 1024 * 1024 * 1024 // Maximum 1GB
	}

	cpuLimit := req.CpuLimit
	if cpuLimit == 0 {
		cpuLimit = 0.5 // Default 50% CPU
	}
	if cpuLimit > 1.0 {
		cpuLimit = 1.0 // Maximum 100% CPU
	}

	// Ensure Docker image is available
	imageName := getImageName(req.Language)
	if err := s.dockerManager.EnsureImage(ctx, imageName); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to ensure Docker image: %v", err)
	}

	// Execute code
	config := docker.ExecutionConfig{
		Language:    req.Language,
		Code:        req.Code,
		Input:       req.Input,
		Timeout:     timeout,
		MemoryLimit: memoryLimit,
		CPULimit:    cpuLimit,
	}

	result, err := s.dockerManager.Execute(ctx, config)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "execution failed: %v", err)
	}

	// Build response
	response := &pb.ExecuteResponse{
		Stdout:          result.Stdout,
		Stderr:          result.Stderr,
		ExitCode:        int32(result.ExitCode),
		Timeout:         result.Timeout,
		MemoryExceeded:  result.MemoryUsed > memoryLimit,
		ExecutionTimeMs: result.ExecutionTime.Milliseconds(),
		MemoryUsedMb:    result.MemoryUsed / (1024 * 1024),
	}

	return response, nil
}

// Health implements the Health RPC method
func (s *Server) Health(ctx context.Context, req *pb.HealthRequest) (*pb.HealthResponse, error) {
	return &pb.HealthResponse{
		Status:  "healthy",
		Version: "1.0.0",
	}, nil
}

// getImageName returns the appropriate Docker image for the language
func getImageName(language string) string {
	switch language {
	case "python", "python3":
		return "python:3.11-alpine"
	case "javascript", "js", "node":
		return "node:18-alpine"
	case "go", "golang":
		return "golang:1.21-alpine"
	case "java":
		return "openjdk:11-alpine"
	case "c":
		return "gcc:alpine"
	case "cpp", "c++":
		return "gcc:alpine"
	case "rust":
		return "rust:alpine"
	case "ruby":
		return "ruby:3.2-alpine"
	case "php":
		return "php:8.2-alpine"
	default:
		return "python:3.11-alpine"
	}
}

// RegisterServer registers the gRPC server
func RegisterServer(s *grpc.Server, dockerManager *docker.Manager) {
	pb.RegisterCodeExecutorServer(s, NewServer(dockerManager))
}
