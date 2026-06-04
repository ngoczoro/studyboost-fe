import { NextRequest, NextResponse } from "next/server"
import { requireAccessToken } from "@/lib/api/authenticated"
import { backendFetch, ApiError, parseErrorMessage } from "@/lib/api-client"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const token = await requireAccessToken()
    const res = await backendFetch(`/api/assignments/${id}/my-submission`, { accessToken: token })
    if (res.status === 404) return NextResponse.json(null, { status: 404 })
    if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
    return NextResponse.json(await res.json())
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 })
  }
}
