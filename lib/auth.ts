import type { Role, SessionUser } from "./types"

export interface BackendAuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface BackendUserResponse {
  id: number
  email: string
  fullName: string
  avatarUrl?: string | null
  isActive: boolean
  roles: string[]
}

export function mapBackendRole(roles: string[]): Role {
  const normalized = roles.map(r => r.toUpperCase())
  if (normalized.includes("ADMIN")) return "admin"
  if (normalized.includes("TEACHER")) return "teacher"
  return "student"
}

export function toSessionUser(user: BackendUserResponse): SessionUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: mapBackendRole(user.roles ?? []),
  }
}

export function parseSessionUserCookie(value: string): SessionUser | null {
  try {
    const parsed = JSON.parse(value) as SessionUser
    if (parsed?.id && parsed?.email && parsed?.role) return parsed
    return null
  } catch {
    return null
  }
}
