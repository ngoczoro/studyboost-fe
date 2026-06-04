import { NextRequest, NextResponse } from "next/server"

import { loginWithBackend, fetchCurrentUser, ApiError } from "@/lib/api-client"
import { toSessionUser } from "@/lib/auth"
import { setAuthCookies } from "@/lib/auth-cookies"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    )
  }

  try {
    const auth = await loginWithBackend(email, password)
    const profile = await fetchCurrentUser(auth.accessToken)
    const user = toSessionUser(profile)

    if (!profile.isActive) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 })
    }

    await setAuthCookies(auth, user)
    return NextResponse.json({ user })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 })
  }
}
