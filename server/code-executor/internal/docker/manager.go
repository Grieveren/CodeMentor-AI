package docker

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
)

// Manager handles Docker container operations
type Manager struct {
	client *client.Client
}

// NewManager creates a new Docker manager
func NewManager() (*Manager, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("failed to create Docker client: %w", err)
	}

	return &Manager{client: cli}, nil
}

// ExecutionResult contains the results of code execution
type ExecutionResult struct {
	Stdout        string
	Stderr        string
	ExitCode      int
	Timeout       bool
	MemoryUsed    int64
	ExecutionTime time.Duration
}

// ExecutionConfig contains configuration for code execution
type ExecutionConfig struct {
	Language      string
	Code          string
	Input         string
	Timeout       time.Duration
	MemoryLimit   int64 // in bytes
	CPULimit      float64
}

// Execute runs code in a secure Docker container
func (m *Manager) Execute(ctx context.Context, config ExecutionConfig) (*ExecutionResult, error) {
	imageName := m.getImageName(config.Language)
	
	// Create execution context with timeout
	execCtx, cancel := context.WithTimeout(ctx, config.Timeout)
	defer cancel()

	// Create container configuration
	containerConfig := &container.Config{
		Image:        imageName,
		AttachStdout: true,
		AttachStderr: true,
		AttachStdin:  true,
		OpenStdin:    true,
		StdinOnce:    true,
		Tty:          false,
		NetworkDisabled: true, // Disable network access
		Cmd:          m.getCommand(config.Language, config.Code),
		WorkingDir:   "/tmp",
	}

	// Host configuration with resource limits
	hostConfig := &container.HostConfig{
		Memory:     config.MemoryLimit,
		CPUQuota:   int64(config.CPULimit * 100000), // CPUQuota is in microseconds
		CPUPeriod:  100000,
		NetworkMode: "none", // No network access
		ReadonlyRootfs: true, // Read-only filesystem
		TmpfsOptions: map[string]string{
			"/tmp": "rw,noexec,nosuid,size=100m", // Writable /tmp with limits
		},
		SecurityOpt: []string{
			"no-new-privileges:true", // Prevent privilege escalation
		},
		CapDrop: []string{"ALL"}, // Drop all capabilities
		AutoRemove: true, // Auto-remove container when done
	}

	// Create container
	resp, err := m.client.ContainerCreate(execCtx, containerConfig, hostConfig, nil, nil, "")
	if err != nil {
		return nil, fmt.Errorf("failed to create container: %w", err)
	}

	// Ensure container is cleaned up
	defer func() {
		if err := m.client.ContainerRemove(context.Background(), resp.ID, container.RemoveOptions{
			Force: true,
		}); err != nil {
			// Log error but don't fail the execution
			fmt.Printf("Warning: failed to remove container %s: %v\n", resp.ID, err)
		}
	}()

	// Start container
	if err := m.client.ContainerStart(execCtx, resp.ID, container.StartOptions{}); err != nil {
		return nil, fmt.Errorf("failed to start container: %w", err)
	}

	// Send input to container if provided
	if config.Input != "" {
		hijackedResp, err := m.client.ContainerAttach(execCtx, resp.ID, container.AttachOptions{
			Stream: true,
			Stdin:  true,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to attach to container: %w", err)
		}
		
		go func() {
			defer hijackedResp.Close()
			hijackedResp.Conn.Write([]byte(config.Input))
			hijackedResp.CloseWrite()
		}()
	}

	// Wait for container to finish
	start := time.Now()
	statusCh, errCh := m.client.ContainerWait(execCtx, resp.ID, container.WaitConditionNotRunning)
	
	var exitCode int64
	var timeout bool
	
	select {
	case err := <-errCh:
		if err != nil {
			return nil, fmt.Errorf("container wait error: %w", err)
		}
	case result := <-statusCh:
		exitCode = result.StatusCode
	case <-execCtx.Done():
		timeout = true
		// Force kill the container
		m.client.ContainerKill(context.Background(), resp.ID, "SIGKILL")
	}

	executionTime := time.Since(start)

	// Get container logs
	logs, err := m.client.ContainerLogs(context.Background(), resp.ID, container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get container logs: %w", err)
	}
	defer logs.Close()

	// Read stdout and stderr
	stdout, stderr, err := m.parseLogs(logs)
	if err != nil {
		return nil, fmt.Errorf("failed to parse logs: %w", err)
	}

	// Get memory usage statistics
	stats, err := m.client.ContainerStats(context.Background(), resp.ID, false)
	var memoryUsed int64
	if err == nil {
		defer stats.Body.Close()
		// Note: In a real implementation, you'd parse the JSON stats
		// For now, we'll set a placeholder value
		memoryUsed = 0
	}

	return &ExecutionResult{
		Stdout:        stdout,
		Stderr:        stderr,
		ExitCode:      int(exitCode),
		Timeout:       timeout,
		MemoryUsed:    memoryUsed,
		ExecutionTime: executionTime,
	}, nil
}

// getImageName returns the appropriate Docker image for the language
func (m *Manager) getImageName(language string) string {
	switch strings.ToLower(language) {
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
		return "python:3.11-alpine" // Default fallback
	}
}

// getCommand returns the appropriate command to execute code for the language
func (m *Manager) getCommand(language, code string) []string {
	switch strings.ToLower(language) {
	case "python", "python3":
		return []string{"python3", "-c", code}
	case "javascript", "js", "node":
		return []string{"node", "-e", code}
	case "go", "golang":
		return []string{"sh", "-c", fmt.Sprintf("echo '%s' > main.go && go run main.go", code)}
	case "java":
		return []string{"sh", "-c", fmt.Sprintf("echo '%s' > Main.java && javac Main.java && java Main", code)}
	case "c":
		return []string{"sh", "-c", fmt.Sprintf("echo '%s' > main.c && gcc main.c -o main && ./main", code)}
	case "cpp", "c++":
		return []string{"sh", "-c", fmt.Sprintf("echo '%s' > main.cpp && g++ main.cpp -o main && ./main", code)}
	case "rust":
		return []string{"sh", "-c", fmt.Sprintf("echo '%s' > main.rs && rustc main.rs && ./main", code)}
	case "ruby":
		return []string{"ruby", "-e", code}
	case "php":
		return []string{"php", "-r", code}
	default:
		return []string{"python3", "-c", code}
	}
}

// parseLogs separates stdout and stderr from Docker logs
func (m *Manager) parseLogs(logs io.Reader) (string, string, error) {
	var stdout, stderr strings.Builder
	
	// Docker logs format: 8-byte header + payload
	// Header: [STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4]
	// STREAM_TYPE: 0=stdin, 1=stdout, 2=stderr
	
	buffer := make([]byte, 8)
	for {
		n, err := logs.Read(buffer)
		if err != nil {
			if err == io.EOF {
				break
			}
			return "", "", err
		}
		
		if n < 8 {
			break
		}
		
		streamType := buffer[0]
		size := uint32(buffer[4])<<24 | uint32(buffer[5])<<16 | uint32(buffer[6])<<8 | uint32(buffer[7])
		
		payload := make([]byte, size)
		n, err = logs.Read(payload)
		if err != nil && err != io.EOF {
			return "", "", err
		}
		
		switch streamType {
		case 1: // stdout
			stdout.Write(payload[:n])
		case 2: // stderr
			stderr.Write(payload[:n])
		}
	}
	
	return stdout.String(), stderr.String(), nil
}

// Close closes the Docker client
func (m *Manager) Close() error {
	return m.client.Close()
}

// EnsureImage ensures the Docker image is available
func (m *Manager) EnsureImage(ctx context.Context, imageName string) error {
	_, _, err := m.client.ImageInspectWithRaw(ctx, imageName)
	if err != nil {
		// Image doesn't exist, pull it
		reader, err := m.client.ImagePull(ctx, imageName, image.PullOptions{})
		if err != nil {
			return fmt.Errorf("failed to pull image %s: %w", imageName, err)
		}
		defer reader.Close()
		
		// Read the response to complete the pull
		io.Copy(io.Discard, reader)
	}
	
	return nil
}
