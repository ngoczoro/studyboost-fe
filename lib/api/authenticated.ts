import "server-only"

import { getAccessToken } from "@/lib/auth-cookies"
import { backendFetch, ApiError, parseErrorMessage } from "@/lib/api-client"

export async function requireAccessToken(): Promise<string> {
  const token = await getAccessToken()
  if (!token) throw new ApiError(401, "Not authenticated")
  return token
}

export async function authFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const accessToken = await requireAccessToken()
  const res = await backendFetch(path, { ...init, accessToken })

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }

  return res
}

export async function authJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await authFetch(path, init)
  return res.json() as Promise<T>
}
