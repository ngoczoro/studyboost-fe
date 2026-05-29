import "server-only"

import { cookies } from "next/headers"

import type { BackendAuthResponse } from "./auth"
import { parseSessionUserCookie } from "./auth"
import type { SessionUser } from "./types"

export const ACCESS_COOKIE = "access_token"
export const REFRESH_COOKIE = "refresh_token"
export const SESSION_COOKIE = "session_user"

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(ACCESS_COOKIE)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(REFRESH_COOKIE)?.value
}

export async function readSessionUserFromCookie(): Promise<SessionUser | null> {
  const store = await cookies()
  const value = store.get(SESSION_COOKIE)?.value
  if (!value) return null
  return parseSessionUserCookie(value)
}

/** Route Handlers only — mutates cookies via next/headers. */
export async function setAuthCookies(
  auth: BackendAuthResponse,
  user: SessionUser,
) {
  const store = await cookies()
  const accessMaxAge = Math.max(Math.floor(auth.expiresIn / 1000), 60)

  store.set(ACCESS_COOKIE, auth.accessToken, {
    ...cookieBase,
    maxAge: accessMaxAge,
  })
  store.set(REFRESH_COOKIE, auth.refreshToken, {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 7,
  })
  store.set(SESSION_COOKIE, JSON.stringify(user), {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 7,
  })
}

/** Route Handlers only — mutates cookies via next/headers. */
export async function clearAuthCookies() {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
  store.delete(SESSION_COOKIE)
}
