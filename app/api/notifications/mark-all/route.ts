import { NextResponse } from "next/server"
import { requireAccessToken } from "@/lib/api/authenticated"
import { backendFetch, ApiError, parseErrorMessage } from "@/lib/api-client"

export async function POST() {
  try {
    const token = await requireAccessToken()
    const res = await backendFetch("/api/notifications/read-all", {
      method: "PUT",
      accessToken: token,
    })
    if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
    return NextResponse.json(await res.json())
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}
