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
