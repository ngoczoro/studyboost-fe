import { NextRequest, NextResponse } from "next/server"
import { listAdminUsers, createAdminUser } from "@/lib/api/admin"
import { getAccessToken } from "@/lib/auth-cookies"
import { ApiError } from "@/lib/api-client"

export async function GET(req: NextRequest) {
  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? undefined
  const page = Number(searchParams.get("page") ?? 0)
  const size = Number(searchParams.get("size") ?? 20)

  try {
    const data = await listAdminUsers({ q, page, size }, token)
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  try {
    const user = await createAdminUser(body, token)
    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
