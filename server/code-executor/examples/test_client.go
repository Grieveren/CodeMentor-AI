package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// ExecuteRequest represents the REST API request for code execution
type ExecuteRequest struct {
	Language      string  `json:"language"`
	Code          string  `json:"code"`
	Input         string  `json:"input,omitempty"`
	TimeoutSeconds int32  `json:"timeout_seconds,omitempty"`
	MemoryLimitMB int64   `json:"memory_limit_mb,omitempty"`
	CPULimit      float64 `json:"cpu_limit,omitempty"`
}

// ExecuteResponse represents the REST API response for code execution
type ExecuteResponse struct {
	Stdout          string `json:"stdout"`
	Stderr          string `json:"stderr"`
	ExitCode        int    `json:"exit_code"`
	Timeout         bool   `json:"timeout"`
	MemoryExceeded  bool   `json:"memory_exceeded"`
	ExecutionTimeMs int64  `json:"execution_time_ms"`
	MemoryUsedMB    int64  `json:"memory_used_mb"`
}

func main() {
	baseURL := "http://localhost:8080"
	
	// Test different languages
	tests := []ExecuteRequest{
		{
			Language: "python",
			Code:     "print('Hello from Python!')\nprint('1 + 1 =', 1 + 1)",
		},
		{
			Language: "javascript",
			Code:     "console.log('Hello from JavaScript!');\nconsole.log('1 + 1 =', 1 + 1);",
		},
		{
			Language: "go",
			Code:     "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello from Go!\")\n    fmt.Println(\"1 + 1 =\", 1 + 1)\n}",
		},
		{
			Language: "python",
			Code:     "name = input('Enter your name: ')\nprint(f'Hello, {name}!')",
			Input:    "Alice\n",
		},
	}
	
	// Test health endpoint
	fmt.Println("Testing health endpoint...")
	resp, err := http.Get(baseURL + "/health")
	if err != nil {
		fmt.Printf("Health check failed: %v\n", err)
		return
	}
	defer resp.Body.Close()
	
	if resp.StatusCode == http.StatusOK {
		fmt.Println("✓ Health check passed")
	} else {
		fmt.Printf("✗ Health check failed with status: %d\n", resp.StatusCode)
	}
	
	// Test code execution
	fmt.Println("\nTesting code execution...")
	
	for i, test := range tests {
		fmt.Printf("\nTest %d: %s\n", i+1, test.Language)
		fmt.Printf("Code: %s\n", test.Code)
		if test.Input != "" {
			fmt.Printf("Input: %s", test.Input)
		}
		
		result, err := executeCode(baseURL, test)
		if err != nil {
			fmt.Printf("✗ Execution failed: %v\n", err)
			continue
		}
		
		fmt.Printf("✓ Execution successful\n")
		fmt.Printf("  Exit Code: %d\n", result.ExitCode)
		fmt.Printf("  Execution Time: %dms\n", result.ExecutionTimeMs)
		fmt.Printf("  Stdout: %s", result.Stdout)
		if result.Stderr != "" {
			fmt.Printf("  Stderr: %s", result.Stderr)
		}
		if result.Timeout {
			fmt.Printf("  ⚠️  Execution timed out\n")
		}
		if result.MemoryExceeded {
			fmt.Printf("  ⚠️  Memory limit exceeded\n")
		}
	}
}

func executeCode(baseURL string, req ExecuteRequest) (*ExecuteResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}
	
	resp, err := http.Post(baseURL+"/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	var result ExecuteResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}
	
	return &result, nil
}
