import { NextRequest, NextResponse } from "next/server"
import { registerWithBackend, ApiError } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const { fullName, email, password } = await req.json()

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    )
  }

  try {
    // Bước 1: Chỉ gửi OTP — KHÔNG tạo user và KHÔNG auto-login
    await registerWithBackend(email, password, fullName)
    return NextResponse.json(
      { message: "OTP sent to your email" },
      { status: 200 },
    )
  } catch (err) {
    if (err instanceof ApiError) {
      const status = err.status === 400 ? 409 : err.status
      return NextResponse.json({ error: err.message }, { status })
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
