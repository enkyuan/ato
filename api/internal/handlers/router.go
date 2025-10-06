package handlers

import (
	"os"
	"time"

	"github.com/enkyuan/ato/api/cache"
	"github.com/enkyuan/ato/api/database"
	"github.com/enkyuan/ato/api/internal/middleware"
	"github.com/enkyuan/ato/api/internal/repository"
	"github.com/enkyuan/ato/api/internal/service"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type Router struct {
	*chi.Mux
}

func NewRouter(db *database.DB, cache *cache.Cache) *Router {
	r := chi.NewRouter()

	// Setup middleware
	setupMiddleware(r)

	// Initialize dependencies
	userRepo := repository.NewUserRepository(db.DB)
	authService := service.NewAuthService(userRepo, cache)
	authMiddleware := middleware.NewAuthMiddleware(authService)
	authHandler := NewAuthHandler(authService)

	// Setup routes
	r.Route("/api/v1", func(r chi.Router) {
		// Public routes
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)
		r.Post("/auth/refresh", authHandler.Refresh)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.Authenticate)
			r.Post("/auth/logout", authHandler.Logout)
			r.Get("/auth/me", authHandler.Me)
		})
	})

	return &Router{Mux: r}
}

func setupMiddleware(r *chi.Mux) {
	// Basic middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Timeout(60 * time.Second))

	// CORS middleware
	allowedOrigins := []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
}
