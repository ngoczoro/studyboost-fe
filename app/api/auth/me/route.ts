import { NextResponse } from "next/server"
import { readSessionUserFromCookie } from "@/lib/auth-cookies"

export async function GET() {
  const user = await readSessionUserFromCookie()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  return NextResponse.json(user)
}
