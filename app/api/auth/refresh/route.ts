import { NextResponse } from "next/server"

import { fetchCurrentUser, refreshWithBackend, ApiError } from "@/lib/api-client"
import { toSessionUser } from "@/lib/auth"
import {
  clearAuthCookies,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/auth-cookies"

export async function POST() {
  const refreshToken = await getRefreshToken()

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 })
  }

  try {
    const auth = await refreshWithBackend(refreshToken)
    const profile = await fetchCurrentUser(auth.accessToken)
    const user = toSessionUser(profile)

    if (!profile.isActive) {
      await clearAuthCookies()
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 })
    }

    await setAuthCookies(auth, user)
    return NextResponse.json({ user })
  } catch (err) {
    await clearAuthCookies()
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 })
  }
}
