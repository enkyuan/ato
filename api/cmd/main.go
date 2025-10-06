package main

import (
	"log"
	"net/http"
	"os"

	"github.com/enkyuan/ato/api/internal/cache"
	"github.com/enkyuan/ato/api/internal/database"
	"github.com/enkyuan/ato/api/internal/server"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize database
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	db, err := database.New(databaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize cache
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Fatal("REDIS_URL environment variable is required")
	}

	cache, err := cache.New(redisURL)
	if err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}
	defer cache.Close()

	// Create and configure server
	srv := server.New(db, cache)

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, srv.Router); err != nil {
		log.Fatal(err)
	}
}
