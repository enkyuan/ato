package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/enkyuan/ato/api/internal/middleware"
	"github.com/enkyuan/ato/api/internal/service"
	"github.com/enkyuan/ato/api/pkg/response"
	"github.com/go-chi/chi/v5"
)

type GroupHandler struct {
	groupService service.GroupService
}

func NewGroupHandler(groupService service.GroupService) *GroupHandler {
	return &GroupHandler{
		groupService: groupService,
	}
}

type CreateGroupRequest struct {
	Name string `json:"name"`
}

type UpdateGroupPositionRequest struct {
	Position int `json:"position"`
}

type UpdateGroupNameRequest struct {
	Name string `json:"name"`
}

func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserContextKey).(int)

	var req CreateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Allow empty names for Notion-style "create first, name later" UX
	group, err := h.groupService.CreateGroup(r.Context(), userID, req.Name)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to create group")
		return
	}

	response.JSON(w, http.StatusCreated, group)
}

func (h *GroupHandler) GetUserGroups(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserContextKey).(int)

	groups, err := h.groupService.GetUserGroups(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to fetch groups")
		return
	}

	response.JSON(w, http.StatusOK, groups)
}

func (h *GroupHandler) UpdateGroupName(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserContextKey).(int)
	groupID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid group ID")
		return
	}

	var req UpdateGroupNameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" {
		response.Error(w, http.StatusBadRequest, "Name is required")
		return
	}

	if err := h.groupService.UpdateGroupName(r.Context(), groupID, userID, req.Name); err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to update group name")
		return
	}

	groups, err := h.groupService.GetUserGroups(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to fetch updated group")
		return
	}

	for _, group := range groups {
		if group.ID == groupID {
			response.JSON(w, http.StatusOK, group)
			return
		}
	}

	response.Error(w, http.StatusNotFound, "Group not found")
}

func (h *GroupHandler) UpdateGroupPosition(w http.ResponseWriter, r *http.Request) {
	groupID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid group ID")
		return
	}

	var req UpdateGroupPositionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.groupService.UpdateGroupPosition(r.Context(), groupID, req.Position); err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to update group position")
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "Position updated"})
}

func (h *GroupHandler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserContextKey).(int)
	groupID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid group ID")
		return
	}

	if err := h.groupService.DeleteGroup(r.Context(), groupID, userID); err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to delete group")
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "Group deleted"})
}
