package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"code-executor/internal/docker"
	grpcserver "code-executor/internal/grpc"
	"code-executor/internal/rest"
	"google.golang.org/grpc"
)

func main() {
	var (
		grpcPort = flag.String("grpc-port", "50051", "gRPC server port")
		httpPort = flag.String("http-port", "8080", "HTTP server port")
		mode     = flag.String("mode", "both", "Server mode: grpc, http, or both")
	)
	flag.Parse()

	// Initialize Docker manager
	dockerManager, err := docker.NewManager()
	if err != nil {
		log.Fatalf("Failed to create Docker manager: %v", err)
	}
	defer dockerManager.Close()

	// Create context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle shutdown signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Start servers based on mode
	switch *mode {
	case "grpc":
		startGRPCServer(ctx, *grpcPort, dockerManager)
	case "http":
		startHTTPServer(ctx, *httpPort, dockerManager)
	case "both":
		go startGRPCServer(ctx, *grpcPort, dockerManager)
		go startHTTPServer(ctx, *httpPort, dockerManager)
	default:
		log.Fatalf("Invalid mode: %s. Use 'grpc', 'http', or 'both'", *mode)
	}

	// Wait for shutdown signal
	<-sigChan
	log.Println("Shutting down servers...")
	cancel()

	// Give servers time to shut down gracefully
	time.Sleep(5 * time.Second)
	log.Println("Servers shut down complete")
}

func startGRPCServer(ctx context.Context, port string, dockerManager *docker.Manager) {
	log.Printf("Starting gRPC server on port %s...", port)

	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("Failed to listen on port %s: %v", port, err)
	}

	s := grpc.NewServer()
	grpcserver.RegisterServer(s, dockerManager)

	go func() {
		<-ctx.Done()
		log.Println("Shutting down gRPC server...")
		s.GracefulStop()
	}()

	if err := s.Serve(listener); err != nil {
		log.Printf("gRPC server error: %v", err)
	}
}

func startHTTPServer(ctx context.Context, port string, dockerManager *docker.Manager) {
	log.Printf("Starting HTTP server on port %s...", port)

	restServer := rest.NewServer(dockerManager)
	
	httpServer := &http.Server{
		Addr:    ":" + port,
		Handler: restServer.Handler(),
	}

	go func() {
		<-ctx.Done()
		log.Println("Shutting down HTTP server...")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			log.Printf("HTTP server shutdown error: %v", err)
		}
	}()

	if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Printf("HTTP server error: %v", err)
	}
}
