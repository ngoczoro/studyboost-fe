import { NextRequest, NextResponse } from "next/server"
import { deleteRole } from "@/lib/api/admin"
import { getAccessToken } from "@/lib/auth-cookies"
import { ApiError } from "@/lib/api-client"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ roleName: string }> },
) {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { roleName } = await params
  try {
    await deleteRole(roleName, token)
    return NextResponse.json({ message: `Role '${roleName.toUpperCase()}' deleted.` })
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 })
  }
}
