import { NextRequest, NextResponse } from "next/server"
import { updateRolePermissions } from "@/lib/api/admin"
import { getAccessToken } from "@/lib/auth-cookies"
import { ApiError } from "@/lib/api-client"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ roleName: string }> },
) {
  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { roleName } = await params
  const body = await req.json()

  try {
    const result = await updateRolePermissions(roleName, body.permissions ?? [], token)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 })
  }
}
