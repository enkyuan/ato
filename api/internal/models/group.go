package models

import (
	"database/sql"
	"time"
)

type Group struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Name      string    `json:"name"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func CreateGroup(db *sql.DB, userID int, name string) (*Group, error) {
	var group Group

	// Get the next position for this user's groups
	var maxPosition sql.NullInt64
	err := db.QueryRow(`
		SELECT COALESCE(MAX(position), -1) FROM groups WHERE user_id = $1
	`, userID).Scan(&maxPosition)
	if err != nil {
		return nil, err
	}

	nextPosition := 0
	if maxPosition.Valid {
		nextPosition = int(maxPosition.Int64) + 1
	}

	err = db.QueryRow(`
		INSERT INTO groups (user_id, name, position)
		VALUES ($1, $2, $3)
		RETURNING id, user_id, name, position, created_at, updated_at
	`, userID, name, nextPosition).Scan(
		&group.ID,
		&group.UserID,
		&group.Name,
		&group.Position,
		&group.CreatedAt,
		&group.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &group, nil
}

func GetGroupsByUserID(db *sql.DB, userID int) ([]*Group, error) {
	rows, err := db.Query(`
		SELECT id, user_id, name, position, created_at, updated_at
		FROM groups
		WHERE user_id = $1
		ORDER BY position ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	groups := []*Group{}
	for rows.Next() {
		var group Group
		err := rows.Scan(
			&group.ID,
			&group.UserID,
			&group.Name,
			&group.Position,
			&group.CreatedAt,
			&group.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		groups = append(groups, &group)
	}

	return groups, nil
}

func UpdateGroupName(db *sql.DB, groupID int, userID int, name string) error {
	_, err := db.Exec(`
		UPDATE groups SET name = $1 WHERE id = $2 AND user_id = $3
	`, name, groupID, userID)
	return err
}

func UpdateGroupPosition(db *sql.DB, groupID int, position int) error {
	_, err := db.Exec(`
		UPDATE groups SET position = $1 WHERE id = $2
	`, position, groupID)
	return err
}

func DeleteGroup(db *sql.DB, groupID int, userID int) error {
	_, err := db.Exec(`
		DELETE FROM groups WHERE id = $1 AND user_id = $2
	`, groupID, userID)
	return err
}
