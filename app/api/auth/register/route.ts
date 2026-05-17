import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"
import { users } from "@/lib/mock-data"

export async function POST(req: NextRequest) {
  const { fullName, email, password } = await req.json()

  if (!fullName || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  const exists = users.find(u => u.email === email)
  if (exists) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
  }

  const newUser = {
    id: Date.now(),
    email,
    full_name: fullName,
    role: "student" as const,
  }

  await createSession(newUser)

  return NextResponse.json({ user: newUser }, { status: 201 })
}
