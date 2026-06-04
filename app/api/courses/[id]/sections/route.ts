import { NextRequest, NextResponse } from "next/server"

import { createSection, listSectionsByCourse } from "@/lib/api/sections"
import { ApiError } from "@/lib/api-client"
import type { BackendSectionRequest } from "@/lib/api/types"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const sections = await listSectionsByCourse(Number(id))
    return NextResponse.json({ sections })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to load sections" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await req.json()) as BackendSectionRequest
    const section = await createSection(Number(id), body)
    return NextResponse.json({ section }, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}
