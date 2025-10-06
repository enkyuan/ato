package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/enkyuan/ato/api/cache"
	"github.com/enkyuan/ato/api/internal/dto"
	"github.com/enkyuan/ato/api/internal/models"
	"github.com/enkyuan/ato/api/internal/repository"
	"github.com/enkyuan/ato/api/pkg/auth"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailExists        = errors.New("email already exists")
	ErrUserNotFound       = errors.New("user not found")
	ErrTokenRevoked       = errors.New("token has been revoked")
)

type AuthService interface {
	Register(ctx context.Context, req dto.RegisterRequest) (*dto.AuthResponse, error)
	Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error)
	Refresh(ctx context.Context, req dto.RefreshRequest) (*dto.AuthResponse, error)
	Logout(ctx context.Context, token string) error
	GetCurrentUser(ctx context.Context, userID int) (*models.User, error)
	ValidateToken(ctx context.Context, token string) (*auth.Claims, error)
}

type authService struct {
	userRepo repository.UserRepository
	cache    *cache.Cache
}

func NewAuthService(userRepo repository.UserRepository, cache *cache.Cache) AuthService {
	return &authService{
		userRepo: userRepo,
		cache:    cache,
	}
}

func (s *authService) Register(ctx context.Context, req dto.RegisterRequest) (*dto.AuthResponse, error) {
	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user, err := s.userRepo.Create(req.Email, hashedPassword, req.Name)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return nil, ErrEmailExists
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Generate tokens
	tokenPair, err := auth.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &dto.AuthResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		User:         user,
	}, nil
}

func (s *authService) Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Verify password
	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	// Generate tokens
	tokenPair, err := auth.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &dto.AuthResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		User:         user,
	}, nil
}

func (s *authService) Refresh(ctx context.Context, req dto.RefreshRequest) (*dto.AuthResponse, error) {
	// Validate refresh token
	claims, err := auth.ValidateToken(req.RefreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Check if token is blacklisted
	blacklistKey := fmt.Sprintf("blacklist:%s", req.RefreshToken)
	_, err = s.cache.Get(ctx, blacklistKey)
	if err == nil {
		return nil, ErrTokenRevoked
	}

	// Get user to ensure they still exist
	user, err := s.userRepo.GetByID(claims.UserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Generate new token pair
	tokenPair, err := auth.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	// Blacklist old refresh token
	expiresAt := time.Unix(claims.ExpiresAt.Unix(), 0)
	ttl := time.Until(expiresAt)
	if ttl > 0 {
		if err := s.cache.Set(ctx, blacklistKey, "1", ttl); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Failed to blacklist old refresh token: %v\n", err)
		}
	}

	return &dto.AuthResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		User:         user,
	}, nil
}

func (s *authService) Logout(ctx context.Context, token string) error {
	// Validate token to get expiry
	claims, err := auth.ValidateToken(token)
	if err != nil {
		return fmt.Errorf("invalid token: %w", err)
	}

	// Blacklist the token
	expiresAt := time.Unix(claims.ExpiresAt.Unix(), 0)
	ttl := time.Until(expiresAt)
	if ttl > 0 {
		blacklistKey := fmt.Sprintf("blacklist:%s", token)
		if err := s.cache.Set(ctx, blacklistKey, "1", ttl); err != nil {
			return fmt.Errorf("failed to blacklist token: %w", err)
		}
	}

	return nil
}

func (s *authService) GetCurrentUser(ctx context.Context, userID int) (*models.User, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

func (s *authService) ValidateToken(ctx context.Context, token string) (*auth.Claims, error) {
	// Check if token is blacklisted
	blacklistKey := fmt.Sprintf("blacklist:%s", token)
	_, err := s.cache.Get(ctx, blacklistKey)
	if err == nil {
		return nil, ErrTokenRevoked
	}

	// Validate token
	claims, err := auth.ValidateToken(token)
	if err != nil {
		return nil, err
	}

	return claims, nil
}
