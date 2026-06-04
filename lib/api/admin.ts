import "server-only"
import { backendFetch, ApiError, parseErrorMessage } from "@/lib/api-client"

// ── Types ──────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number
  email: string
  fullName: string
  avatarUrl?: string | null
  isActive: boolean
  roles: string[]
}

export interface AdminUserListResponse {
  users: AdminUser[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface AdminStats {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalAdmins: number
  totalCourses: number
  totalEnrollments: number
}

export interface CreateUserPayload {
  email: string
  fullName: string
  password: string
  role?: string
}

export interface UpdateUserPayload {
  fullName?: string
  avatarUrl?: string
  isActive?: boolean
  role?: string
}

// ── API Functions ──────────────────────────────────────────────────────

export async function listAdminUsers(
  params: { q?: string; page?: number; size?: number },
  token: string,
): Promise<AdminUserListResponse> {
  const qs = new URLSearchParams()
  if (params.q) qs.set("q", params.q)
  qs.set("page", String(params.page ?? 0))
  qs.set("size", String(params.size ?? 20))

  const res = await backendFetch(`/api/admin/users?${qs.toString()}`, {
    accessToken: token,
  })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json() as Promise<AdminUserListResponse>
}

export async function createAdminUser(
  data: CreateUserPayload,
  token: string,
): Promise<AdminUser> {
  const res = await backendFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
    accessToken: token,
  })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json() as Promise<AdminUser>
}

export async function updateAdminUser(
  id: number,
  data: UpdateUserPayload,
  token: string,
): Promise<AdminUser> {
  const res = await backendFetch(`/api/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    accessToken: token,
  })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json() as Promise<AdminUser>
}

export async function deactivateAdminUser(
  id: number,
  token: string,
): Promise<void> {
  const res = await backendFetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    accessToken: token,
  })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  const res = await backendFetch("/api/admin/stats", { accessToken: token })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json() as Promise<AdminStats>
}

// ── Broadcasts ─────────────────────────────────────────────────────────

export interface BroadcastPayload {
  type: string
  title: string
  course?: string
  message: string
}

export interface BroadcastHistoryItem {
  id: number
  data: string
  createdAt: string
}

export async function sendBroadcast(
  payload: BroadcastPayload,
  token: string,
): Promise<{ message: string }> {
  const res = await backendFetch("/api/admin/notifications/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken: token,
  })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json()
}

export async function getRecentBroadcasts(token: string): Promise<BroadcastHistoryItem[]> {
  const res = await backendFetch("/api/admin/notifications/broadcasts", {
    accessToken: token,
  })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json() as Promise<BroadcastHistoryItem[]>
}

// ── Roles ──────────────────────────────────────────────────────────────

export interface RoleInfo {
  name: string
  description: string
  permissions: string[]
  userCount: number
  protected: boolean
}

export async function listRoles(token: string): Promise<RoleInfo[]> {
  const res = await backendFetch("/api/admin/roles", { accessToken: token })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json() as Promise<RoleInfo[]>
}

export async function createRole(
  data: { name: string; description?: string },
  token: string,
): Promise<RoleInfo> {
  const res = await backendFetch("/api/admin/roles", {
    method: "POST",
    body: JSON.stringify(data),
    accessToken: token,
  })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json() as Promise<RoleInfo>
}

export async function deleteRole(roleName: string, token: string): Promise<void> {
  const res = await backendFetch(`/api/admin/roles/${roleName}`, {
    method: "DELETE",
    accessToken: token,
  })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
}

// ── Role Permissions ───────────────────────────────────────────────────

/** { "ADMIN": ["courses.view", ...], "TEACHER": [...], "STUDENT": [...] } */
export type PermissionMatrix = Record<string, string[]>

export async function getPermissionMatrix(token: string): Promise<PermissionMatrix> {
  const res = await backendFetch("/api/admin/roles/matrix", { accessToken: token })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json() as Promise<PermissionMatrix>
}

export async function updateRolePermissions(
  roleName: string,
  permissions: string[],
  token: string,
): Promise<{ role: string; permissions: string[] }> {
  const res = await backendFetch(`/api/admin/roles/${roleName}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissions }),
    accessToken: token,
  })
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
  return res.json()
}
