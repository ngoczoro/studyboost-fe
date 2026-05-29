import { NextResponse } from "next/server"

import { logoutWithBackend, ApiError } from "@/lib/api-client"
import { clearAuthCookies, getAccessToken } from "@/lib/auth-cookies"

export async function POST() {
  const accessToken = await getAccessToken()

  if (accessToken) {
    try {
      await logoutWithBackend(accessToken)
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) {
        return NextResponse.json({ error: "Logout failed" }, { status: 500 })
      }
    }
  }

  await clearAuthCookies()
  return NextResponse.json({ ok: true })
}
