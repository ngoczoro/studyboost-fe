import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"
import { users } from "@/lib/mock-data"
import type { Role } from "@/lib/types"

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const user = users.find(u => u.email === email && u.is_active)
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: (role ?? user.role) as Role,
  }

  await createSession(sessionUser)

  return NextResponse.json({ user: sessionUser })
}
