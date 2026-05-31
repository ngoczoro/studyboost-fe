import { NextRequest, NextResponse } from "next/server"
import { listRoles, createRole } from "@/lib/api/admin"
import { getAccessToken } from "@/lib/auth-cookies"
import { ApiError } from "@/lib/api-client"

export async function GET() {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    return NextResponse.json(await listRoles(token))
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  try {
    const role = await createRole(body, token)
    return NextResponse.json(role, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 })
  }
}
