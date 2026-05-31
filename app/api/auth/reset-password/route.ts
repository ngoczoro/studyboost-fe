import { NextRequest, NextResponse } from "next/server"
import { resetPasswordWithBackend, ApiError } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const { email, otp, newPassword } = await req.json()

  if (!email || !otp || !newPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  try {
    await resetPasswordWithBackend(email, otp, newPassword)
    return NextResponse.json({ message: "Password reset successfully. Please sign in." })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Reset failed. Please try again." }, { status: 500 })
  }
}
