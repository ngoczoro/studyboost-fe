import { NextRequest, NextResponse } from "next/server"

import {
  loginWithBackend,
  registerWithBackend,
  fetchCurrentUser,
  ApiError,
} from "@/lib/api-client"
import { toSessionUser } from "@/lib/auth"
import { setAuthCookies } from "@/lib/auth-cookies"

export async function POST(req: NextRequest) {
  const { fullName, email, password } = await req.json()

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    )
  }

  try {
    await registerWithBackend(email, password, fullName)
    const auth = await loginWithBackend(email, password)
    const profile = await fetchCurrentUser(auth.accessToken)
    const user = toSessionUser(profile)

    await setAuthCookies(auth, user)
    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      const status = err.status === 400 ? 409 : err.status
      return NextResponse.json({ error: err.message }, { status: status })
    }
    return NextResponse.json({ error: "Sign up failed" }, { status: 500 })
  }
}
