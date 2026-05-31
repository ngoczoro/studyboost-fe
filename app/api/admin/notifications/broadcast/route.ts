import { NextRequest, NextResponse } from "next/server"
import { sendBroadcast } from "@/lib/api/admin"
import { getAccessToken } from "@/lib/auth-cookies"
import { ApiError } from "@/lib/api-client"

export async function POST(req: NextRequest) {
  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  try {
    const result = await sendBroadcast(body, token)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 })
  }
}
