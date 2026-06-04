import { NextRequest, NextResponse } from "next/server"
import { verifyEmailWithBackend, fetchCurrentUser, ApiError } from "@/lib/api-client"
import { toSessionUser } from "@/lib/auth"
import { setAuthCookies } from "@/lib/auth-cookies"

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json()

  if (!email || !otp) {
    return NextResponse.json(
      { error: "Email and OTP are required" },
      { status: 400 },
    )
  }

  try {
    // Bước 2: Xác thực OTP → BE tạo user → trả về JWT tokens
    const auth = await verifyEmailWithBackend(email, otp)
    const profile = await fetchCurrentUser(auth.accessToken)
    const user = toSessionUser(profile)

    await setAuthCookies(auth, user)
    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
