package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/enkyuan/ato/api/dto"
	"github.com/enkyuan/ato/api/middleware"
	"github.com/enkyuan/ato/api/response"
	"github.com/enkyuan/ato/api/service"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate input
	if req.Name == "" || req.Email == "" || req.Password == "" {
		response.Error(w, http.StatusBadRequest, "Name, email, and password are required")
		return
	}

	if len(req.Password) < 8 {
		response.Error(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	authResp, err := h.authService.Register(r.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrEmailExists) {
			response.Error(w, http.StatusConflict, "Email already exists")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	response.JSON(w, http.StatusCreated, authResp)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		response.Error(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	authResp, err := h.authService.Login(r.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			response.Error(w, http.StatusUnauthorized, "Invalid credentials")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to authenticate")
		return
	}

	response.JSON(w, http.StatusOK, authResp)
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req dto.RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.RefreshToken == "" {
		response.Error(w, http.StatusBadRequest, "Refresh token is required")
		return
	}

	authResp, err := h.authService.Refresh(r.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrTokenRevoked) {
			response.Error(w, http.StatusUnauthorized, "Token has been revoked")
			return
		}
		if errors.Is(err, service.ErrUserNotFound) {
			response.Error(w, http.StatusUnauthorized, "User not found")
			return
		}
		response.Error(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	response.JSON(w, http.StatusOK, authResp)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	tokenString := extractToken(r)
	if tokenString == "" {
		response.Error(w, http.StatusUnauthorized, "No token provided")
		return
	}

	if err := h.authService.Logout(r.Context(), tokenString); err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to logout")
		return
	}

	response.Success(w, http.StatusOK, "Successfully logged out")
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserContextKey).(int)

	user, err := h.authService.GetCurrentUser(r.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			response.Error(w, http.StatusNotFound, "User not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to get user")
		return
	}

	response.JSON(w, http.StatusOK, user)
}

func extractToken(r *http.Request) string {
	bearerToken := r.Header.Get("Authorization")
	parts := strings.Split(bearerToken, " ")
	if len(parts) == 2 && parts[0] == "Bearer" {
		return parts[1]
	}
	return ""
}
