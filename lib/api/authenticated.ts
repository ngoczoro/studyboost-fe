import "server-only"

import { getAccessToken, getRefreshToken, setAuthCookies } from "@/lib/auth-cookies"
import { backendFetch, ApiError, parseErrorMessage, fetchCurrentUser, refreshWithBackend } from "@/lib/api-client"
import { toSessionUser } from "@/lib/auth"
import { isAccessTokenExpired } from "@/lib/auth-tokens"

async function resolveAccessToken(): Promise<string> {
  let token = await getAccessToken()

  if (token && !isAccessTokenExpired(token)) {
    return token
  }

  const refreshToken = await getRefreshToken()
  if (!refreshToken) {
    throw new ApiError(401, "Not authenticated")
  }

  const auth = await refreshWithBackend(refreshToken)
  const profile = await fetchCurrentUser(auth.accessToken)
  if (!profile.isActive) {
    throw new ApiError(403, "Account is inactive")
  }

  await setAuthCookies(auth, toSessionUser(profile))
  return auth.accessToken
}

export async function requireAccessToken(): Promise<string> {
  return resolveAccessToken()
}

export async function authFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const accessToken = await resolveAccessToken()
  let res = await backendFetch(path, { ...init, accessToken })

  if (res.status === 401) {
    const refreshToken = await getRefreshToken()
    if (refreshToken) {
      try {
        const auth = await refreshWithBackend(refreshToken)
        const profile = await fetchCurrentUser(auth.accessToken)
        await setAuthCookies(auth, toSessionUser(profile))
        res = await backendFetch(path, { ...init, accessToken: auth.accessToken })
      } catch {
        throw new ApiError(401, "Not authenticated")
      }
    }
  }

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
