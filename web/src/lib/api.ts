const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"

export interface User {
  id: number
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Group {
  id: number
  user_id: number
  name: string
  position: number
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

class ApiClient {
  private baseURL: string
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.loadTokens()
  }

  private loadTokens() {
    // Try localStorage first (remember me enabled)
    this.accessToken = localStorage.getItem("access_token")
    this.refreshToken = localStorage.getItem("refresh_token")

    // If not found, try sessionStorage (remember me disabled)
    if (!this.accessToken) {
      this.accessToken = sessionStorage.getItem("access_token")
      this.refreshToken = sessionStorage.getItem("refresh_token")
    }
  }

  private saveTokens(accessToken: string, refreshToken: string, rememberMe: boolean = true) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken

    const storage = rememberMe ? localStorage : sessionStorage

    // Clear tokens from the other storage
    const otherStorage = rememberMe ? sessionStorage : localStorage
    otherStorage.removeItem("access_token")
    otherStorage.removeItem("refresh_token")
    otherStorage.removeItem("user")

    // Save to the chosen storage
    storage.setItem("access_token", accessToken)
    storage.setItem("refresh_token", refreshToken)
  }

  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    sessionStorage.removeItem("access_token")
    sessionStorage.removeItem("refresh_token")
    sessionStorage.removeItem("user")
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    }

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle 401 - try to refresh token
      if (response.status === 401 && this.refreshToken && endpoint !== "/auth/refresh") {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Retry the original request with new token
          headers["Authorization"] = `Bearer ${this.accessToken}`
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          })
          return this.handleResponse<T>(retryResponse)
        } else {
          this.clearTokens()
          throw new ApiError("Session expired", 401)
        }
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError("Network error", 0, error)
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    const data = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      throw new ApiError(data?.message || data || "Request failed", response.status, data)
    }

    return data as T
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      })

      if (!response.ok) return false

      const data: AuthResponse = await response.json()
      // Preserve the remember me preference when refreshing
      const wasRemembered = localStorage.getItem("access_token") !== null
      this.saveTokens(data.access_token, data.refresh_token, wasRemembered)
      const storage = wasRemembered ? localStorage : sessionStorage
      storage.setItem("user", JSON.stringify(data.user))
      return true
    } catch {
      return false
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest, rememberMe: boolean = true): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
    this.saveTokens(response.access_token, response.refresh_token, rememberMe)
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem("user", JSON.stringify(response.user))
    return response
  }

  async login(data: LoginRequest, rememberMe: boolean = true): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
    this.saveTokens(response.access_token, response.refresh_token, rememberMe)
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem("user", JSON.stringify(response.user))
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      })
    } finally {
      this.clearTokens()
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me")
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  getUser(): User | null {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  }

  // Group endpoints
  async createGroup(name: string): Promise<Group> {
    return this.request<Group>("/groups", {
      method: "POST",
      body: JSON.stringify({ name }),
    })
  }

  async getGroups(): Promise<Group[]> {
    return this.request<Group[]>("/groups")
  }

  async updateGroupName(groupId: number, name: string): Promise<Group> {
    return this.request<Group>(`/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    })
  }

  async updateGroupPosition(groupId: number, position: number): Promise<void> {
    await this.request(`/groups/${groupId}/position`, {
      method: "PUT",
      body: JSON.stringify({ position }),
    })
  }

  async deleteGroup(groupId: number): Promise<void> {
    await this.request(`/groups/${groupId}`, {
      method: "DELETE",
    })
  }
}

export const api = new ApiClient(API_URL)
export { ApiError }
