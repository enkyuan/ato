package repository

import (
	"context"
	"database/sql"

	"github.com/enkyuan/ato/api/internal/models"
)

type GroupRepository interface {
	Create(ctx context.Context, userID int, name string) (*models.Group, error)
	GetByUserID(ctx context.Context, userID int) ([]*models.Group, error)
	UpdateName(ctx context.Context, groupID int, userID int, name string) error
	UpdatePosition(ctx context.Context, groupID int, position int) error
	Delete(ctx context.Context, groupID int, userID int) error
}

type groupRepository struct {
	db *sql.DB
}

func NewGroupRepository(db *sql.DB) GroupRepository {
	return &groupRepository{db: db}
}

func (r *groupRepository) Create(ctx context.Context, userID int, name string) (*models.Group, error) {
	return models.CreateGroup(r.db, userID, name)
}

func (r *groupRepository) GetByUserID(ctx context.Context, userID int) ([]*models.Group, error) {
	return models.GetGroupsByUserID(r.db, userID)
}

func (r *groupRepository) UpdateName(ctx context.Context, groupID int, userID int, name string) error {
	return models.UpdateGroupName(r.db, groupID, userID, name)
}

func (r *groupRepository) UpdatePosition(ctx context.Context, groupID int, position int) error {
	return models.UpdateGroupPosition(r.db, groupID, position)
}

func (r *groupRepository) Delete(ctx context.Context, groupID int, userID int) error {
	return models.DeleteGroup(r.db, groupID, userID)
}
