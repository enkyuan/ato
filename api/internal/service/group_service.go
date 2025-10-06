package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/enkyuan/ato/api/cache"
	"github.com/enkyuan/ato/api/internal/models"
	"github.com/enkyuan/ato/api/internal/repository"
)

type GroupService interface {
	CreateGroup(ctx context.Context, userID int, name string) (*models.Group, error)
	GetUserGroups(ctx context.Context, userID int) ([]*models.Group, error)
	UpdateGroupName(ctx context.Context, groupID int, userID int, name string) error
	UpdateGroupPosition(ctx context.Context, groupID int, position int) error
	DeleteGroup(ctx context.Context, groupID int, userID int) error
}

type groupService struct {
	groupRepo repository.GroupRepository
	cache     *cache.Cache
}

func NewGroupService(groupRepo repository.GroupRepository, cache *cache.Cache) GroupService {
	return &groupService{
		groupRepo: groupRepo,
		cache:     cache,
	}
}

func (s *groupService) CreateGroup(ctx context.Context, userID int, name string) (*models.Group, error) {
	group, err := s.groupRepo.Create(ctx, userID, name)
	if err != nil {
		return nil, err
	}

	// Invalidate user's groups cache
	s.cache.DeletePattern(ctx, fmt.Sprintf("groups:user:%d", userID))

	return group, nil
}

func (s *groupService) GetUserGroups(ctx context.Context, userID int) ([]*models.Group, error) {
	// Try to get from cache
	cacheKey := fmt.Sprintf("groups:user:%d", userID)
	if cached, err := s.cache.Get(ctx, cacheKey); err == nil {
		var groups []*models.Group
		if err := json.Unmarshal([]byte(cached), &groups); err == nil {
			return groups, nil
		}
	}

	groups, err := s.groupRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(groups); err == nil {
		s.cache.Set(ctx, cacheKey, string(data), 3600*time.Second) // 1 hour TTL
	}

	return groups, nil
}

func (s *groupService) UpdateGroupName(ctx context.Context, groupID int, userID int, name string) error {
	if err := s.groupRepo.UpdateName(ctx, groupID, userID, name); err != nil {
		return err
	}

	// Invalidate cache
	s.cache.DeletePattern(ctx, fmt.Sprintf("groups:user:%d", userID))

	return nil
}

func (s *groupService) UpdateGroupPosition(ctx context.Context, groupID int, position int) error {
	if err := s.groupRepo.UpdatePosition(ctx, groupID, position); err != nil {
		return err
	}

	// Invalidate cache - we don't have direct access to userID here, so invalidate all
	s.cache.DeletePattern(ctx, "groups:user:*")

	return nil
}

func (s *groupService) DeleteGroup(ctx context.Context, groupID int, userID int) error {
	if err := s.groupRepo.Delete(ctx, groupID, userID); err != nil {
		return err
	}

	// Invalidate cache
	s.cache.DeletePattern(ctx, fmt.Sprintf("groups:user:%d", userID))

	return nil
}
