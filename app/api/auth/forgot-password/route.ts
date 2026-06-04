import { NextRequest, NextResponse } from "next/server"
import { forgotPasswordWithBackend, ApiError } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    await forgotPasswordWithBackend(email)
    // Luôn trả 200 để không lộ email có tồn tại không
    return NextResponse.json({ message: "If that email exists, an OTP has been sent" })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ message: "If that email exists, an OTP has been sent" })
  }
}
