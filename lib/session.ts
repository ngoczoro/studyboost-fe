import "server-only"

import { cache } from "react"

import { fetchCurrentUser, ApiError } from "./api-client"
import { toSessionUser } from "./auth"
import {
  getAccessToken,
  getRefreshToken,
  readSessionUserFromCookie,
} from "./auth-cookies"
import type { SessionUser } from "./types"

export {
  getAccessToken,
  getRefreshToken,
  readSessionUserFromCookie,
} from "./auth-cookies"

/**
 * Read-only session verification for Server Components.
 * Cookie writes happen in Route Handlers (/api/auth/*) and proxy refresh.
 */
export const verifySession = cache(async (): Promise<SessionUser | null> => {
  const accessToken = await getAccessToken()
  const refreshToken = await getRefreshToken()

  if (!accessToken && !refreshToken) return null

  const cachedUser = await readSessionUserFromCookie()

  if (accessToken) {
    try {
      const profile = await fetchCurrentUser(accessToken)
      return toSessionUser(profile)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        return cachedUser
      }
      return null
    }
  }

  return cachedUser
})
