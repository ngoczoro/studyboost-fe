import { NextRequest, NextResponse } from "next/server"
import { requireAccessToken } from "@/lib/api/authenticated"
import { backendFetch, ApiError, parseErrorMessage } from "@/lib/api-client"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const token = await requireAccessToken()
    const res = await backendFetch(`/api/submission-files/${id}`, {
      method: "DELETE",
      accessToken: token,
    })
    if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res))
    return NextResponse.json({ message: "File deleted" })
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
