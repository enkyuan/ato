package server

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/enkyuan/ato/api/internal/auth"
	"github.com/enkyuan/ato/api/internal/cache"
	"github.com/enkyuan/ato/api/internal/database"
	"github.com/enkyuan/ato/api/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type Server struct {
	Router *chi.Mux
	DB     *database.DB
	Cache  *cache.Cache
}

type contextKey string

const userContextKey contextKey = "user"

func New(db *database.DB, cache *cache.Cache) *Server {
	s := &Server{
		Router: chi.NewRouter(),
		DB:     db,
		Cache:  cache,
	}

	s.setupMiddleware()
	s.setupRoutes()

	return s
}

func (s *Server) setupMiddleware() {
	// Basic middleware
	s.Router.Use(middleware.Logger)
	s.Router.Use(middleware.Recoverer)
	s.Router.Use(middleware.RequestID)
	s.Router.Use(middleware.RealIP)
	s.Router.Use(middleware.Timeout(60 * time.Second))

	// CORS middleware
	s.Router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{os.Getenv("FRONTEND_URL")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
}

func (s *Server) setupRoutes() {
	s.Router.Route("/api/v1", func(r chi.Router) {
		// Public routes
		r.Post("/auth/register", s.handleRegister)
		r.Post("/auth/login", s.handleLogin)
		r.Post("/auth/refresh", s.handleRefresh)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(s.authMiddleware)
			r.Post("/auth/logout", s.handleLogout)
			r.Get("/auth/me", s.handleMe)
		})
	})
}

// Request/Response types
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	User         *models.User `json:"user"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

// Handlers
func (s *Server) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate input
	if req.Name == "" || req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Name, email, and password are required")
		return
	}

	if len(req.Password) < 8 {
		respondError(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to process password")
		return
	}

	// Create user
	user, err := models.CreateUser(s.DB.DB, req.Name, req.Email, hashedPassword)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			respondError(w, http.StatusConflict, "Email already exists")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Generate tokens
	tokenPair, err := auth.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate tokens")
		return
	}

	respondJSON(w, http.StatusCreated, AuthResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		User:         user,
	})
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	// Get user by email
	user, err := models.GetUserByEmail(s.DB.DB, req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			respondError(w, http.StatusUnauthorized, "Invalid credentials")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to authenticate")
		return
	}

	// Verify password
	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		respondError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Generate tokens
	tokenPair, err := auth.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate tokens")
		return
	}

	respondJSON(w, http.StatusOK, AuthResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		User:         user,
	})
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request) {
	// Get token from header
	tokenString := extractToken(r)
	if tokenString == "" {
		respondError(w, http.StatusUnauthorized, "No token provided")
		return
	}

	// Validate token to get expiry
	claims, err := auth.ValidateToken(tokenString)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	// Blacklist the token
	expiresAt := time.Unix(claims.ExpiresAt.Unix(), 0)
	ttl := time.Until(expiresAt)
	if ttl > 0 {
		blacklistKey := fmt.Sprintf("blacklist:%s", tokenString)
		if err := s.Cache.Set(r.Context(), blacklistKey, "1", ttl); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to logout")
			return
		}
	}

	respondJSON(w, http.StatusOK, MessageResponse{
		Message: "Successfully logged out",
	})
}

func (s *Server) handleRefresh(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.RefreshToken == "" {
		respondError(w, http.StatusBadRequest, "Refresh token is required")
		return
	}

	// Validate refresh token
	claims, err := auth.ValidateToken(req.RefreshToken)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	// Check if token is blacklisted
	blacklistKey := fmt.Sprintf("blacklist:%s", req.RefreshToken)
	_, err = s.Cache.Get(r.Context(), blacklistKey)
	if err == nil {
		respondError(w, http.StatusUnauthorized, "Token has been revoked")
		return
	}

	// Get user to ensure they still exist
	user, err := models.GetUserByID(s.DB.DB, claims.UserID)
	if err != nil {
		if err == sql.ErrNoRows {
			respondError(w, http.StatusUnauthorized, "User not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to refresh token")
		return
	}

	// Generate new token pair
	tokenPair, err := auth.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate tokens")
		return
	}

	// Blacklist old refresh token
	expiresAt := time.Unix(claims.ExpiresAt.Unix(), 0)
	ttl := time.Until(expiresAt)
	if ttl > 0 {
		if err := s.Cache.Set(r.Context(), blacklistKey, "1", ttl); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Failed to blacklist old refresh token: %v\n", err)
		}
	}

	respondJSON(w, http.StatusOK, AuthResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		User:         user,
	})
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(userContextKey).(int)

	user, err := models.GetUserByID(s.DB.DB, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			respondError(w, http.StatusNotFound, "User not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to get user")
		return
	}

	respondJSON(w, http.StatusOK, user)
}

// Middleware
func (s *Server) authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := extractToken(r)
		if tokenString == "" {
			respondError(w, http.StatusUnauthorized, "No token provided")
			return
		}

		// Check if token is blacklisted
		blacklistKey := fmt.Sprintf("blacklist:%s", tokenString)
		_, err := s.Cache.Get(r.Context(), blacklistKey)
		if err == nil {
			respondError(w, http.StatusUnauthorized, "Token has been revoked")
			return
		}

		// Validate token
		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			respondError(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		// Add user ID to context
		ctx := context.WithValue(r.Context(), userContextKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Helper functions
func extractToken(r *http.Request) string {
	bearerToken := r.Header.Get("Authorization")
	if len(strings.Split(bearerToken, " ")) == 2 {
		return strings.Split(bearerToken, " ")[1]
	}
	return ""
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, ErrorResponse{Error: message})
}
