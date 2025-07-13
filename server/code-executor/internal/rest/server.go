package rest

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"code-executor/internal/docker"
	"github.com/gin-gonic/gin"
)

// Server implements the REST API server
type Server struct {
	dockerManager  *docker.Manager
	router         *gin.Engine
	submissionRepo *SubmissionsRepository
}

// ReviewRequest represents the REST API request for code review
type ReviewRequest struct {
	Code string `json:"code" binding:"required"`
}

// ReviewResponse represents the REST API response for the code review
type ReviewResponse struct {
	ReviewResult string `json:"review_result"`
	Cached       bool   `json:"cached"`
}

// ExecuteRequest represents the REST API request for code execution
type ExecuteRequest struct {
	Language      string  `json:"language" binding:"required"`
	Code          string  `json:"code" binding:"required"`
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

// HealthResponse represents the health check response
type HealthResponse struct {
	Status  string `json:"status"`
	Version string `json:"version"`
}

// NewServer creates a new REST API server
func NewServer(dockerManager *docker.Manager) *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	
	server := &Server{
		dockerManager:  dockerManager,
		router:         router,
		submissionRepo: NewSubmissionsRepository(),
	}
	
	server.setupRoutes()
	return server
}

// setupRoutes configures the API routes
func (s *Server) setupRoutes() {
	// Add CORS middleware
	s.router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// API routes
	v1 := s.router.Group("/api/v1")
	{
		v1.POST("/execute", s.execute)
	v1.GET("/health", s.health)
		v1.POST("/review", s.review)
	}
	
	// Root health check
	s.router.GET("/health", s.health)
}

// execute handles code execution requests
func (s *Server) execute(c *gin.Context) {
	var req ExecuteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default values
	timeout := time.Duration(req.TimeoutSeconds) * time.Second
	if timeout == 0 {
		timeout = 30 * time.Second
	}
	if timeout > 120*time.Second {
		timeout = 120 * time.Second // Maximum 2 minutes
	}

	memoryLimit := req.MemoryLimitMB * 1024 * 1024 // Convert MB to bytes
	if memoryLimit == 0 {
		memoryLimit = 128 * 1024 * 1024 // Default 128MB
	}
	if memoryLimit > 1024*1024*1024 {
		memoryLimit = 1024 * 1024 * 1024 // Maximum 1GB
	}

	cpuLimit := req.CPULimit
	if cpuLimit == 0 {
		cpuLimit = 0.5 // Default 50% CPU
	}
	if cpuLimit > 1.0 {
		cpuLimit = 1.0 // Maximum 100% CPU
	}

	// Ensure Docker image is available
	imageName := getImageName(req.Language)
	if err := s.dockerManager.EnsureImage(c.Request.Context(), imageName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to ensure Docker image: " + err.Error()})
		return
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

	result, err := s.dockerManager.Execute(c.Request.Context(), config)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "execution failed: " + err.Error()})
		return
	}

	// Build response
	response := ExecuteResponse{
		Stdout:          result.Stdout,
		Stderr:          result.Stderr,
		ExitCode:        result.ExitCode,
		Timeout:         result.Timeout,
		MemoryExceeded:  result.MemoryUsed > memoryLimit,
		ExecutionTimeMs: result.ExecutionTime.Milliseconds(),
		MemoryUsedMB:    result.MemoryUsed / (1024 * 1024),
	}

	c.JSON(http.StatusOK, response)
}

// review handles code review requests
func (s *Server) review(c *gin.Context) {
	var req ReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check cache for submission
	if result, cached := s.submissionRepo.Get(req.Code); cached {
		c.JSON(http.StatusOK, ReviewResponse{ReviewResult: result, Cached: true})
		return
	}

	// Send to Claude API (mocked for the purpose of this implementation)
	reviewResult := "Style: Good\nCorrectness: Needs improvement\nSuggestions: Consider refactoring."

	// Store to cache
	s.submissionRepo.Store(req.Code, reviewResult)

	c.JSON(http.StatusOK, ReviewResponse{ReviewResult: reviewResult, Cached: false})
}

// health handles health check requests
func (s *Server) health(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status:  "healthy",
		Version: "1.0.0",
	})
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

// Start starts the REST API server
func (s *Server) Start(address string) error {
	return s.router.Run(address)
}

// Handler returns the HTTP handler for the REST API
func (s *Server) Handler() http.Handler {
	return s.router
}
