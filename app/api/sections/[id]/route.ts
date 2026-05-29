import { NextRequest, NextResponse } from "next/server"

import { deleteSection, updateSection } from "@/lib/api/sections"
import { ApiError } from "@/lib/api-client"
import type { BackendSectionRequest } from "@/lib/api/types"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await req.json()) as BackendSectionRequest
    const section = await updateSection(Number(id), body)
    return NextResponse.json({ section })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    await deleteSection(Number(id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 })
  }
}
