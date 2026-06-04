import { NextResponse } from "next/server"
import { requireAccessToken } from "@/lib/api/authenticated"
import { backendFetch, ApiError, parseErrorMessage } from "@/lib/api-client"

export async function GET() {
  try {
    const token = await requireAccessToken()
    const res = await backendFetch("/api/notifications", { accessToken: token })
    if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
    return NextResponse.json(await res.json())
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
