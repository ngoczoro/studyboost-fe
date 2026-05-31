import { NextResponse } from "next/server"
import { getAdminStats } from "@/lib/api/admin"
import { getAccessToken } from "@/lib/auth-cookies"
import { ApiError } from "@/lib/api-client"

export async function GET() {
  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const stats = await getAdminStats(token)
    return NextResponse.json(stats)
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
