import { NextResponse } from "next/server"
import { getRecentBroadcasts } from "@/lib/api/admin"
import { getAccessToken } from "@/lib/auth-cookies"
import { ApiError } from "@/lib/api-client"

export async function GET() {
  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await getRecentBroadcasts(token)
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to fetch broadcast history" }, { status: 500 })
  }
}
