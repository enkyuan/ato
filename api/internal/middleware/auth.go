package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/enkyuan/ato/api/internal/service"
	"github.com/enkyuan/ato/api/pkg/response"
)

type contextKey string

const UserContextKey contextKey = "user"

type AuthMiddleware struct {
	authService service.AuthService
}

func NewAuthMiddleware(authService service.AuthService) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := extractToken(r)
		if tokenString == "" {
			response.Error(w, http.StatusUnauthorized, "No token provided")
			return
		}

		// Validate token
		claims, err := m.authService.ValidateToken(r.Context(), tokenString)
		if err != nil {
			response.Error(w, http.StatusUnauthorized, "Invalid or revoked token")
			return
		}

		// Add user ID to context
		ctx := context.WithValue(r.Context(), UserContextKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func extractToken(r *http.Request) string {
	bearerToken := r.Header.Get("Authorization")
	parts := strings.Split(bearerToken, " ")
	if len(parts) == 2 && parts[0] == "Bearer" {
		return parts[1]
	}
	return ""
}
