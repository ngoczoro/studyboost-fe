import { NextRequest, NextResponse } from "next/server"

import {
  getAssignment,
  updateAssignment,
  deleteAssignment,
} from "@/lib/api/assignments"
import type { BackendAssignmentRequest } from "@/lib/api/types"
import { ApiError } from "@/lib/api-client"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const assignment = await getAssignment(Number(id))
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }
    return NextResponse.json({ assignment })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to load assignment" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await req.json()) as BackendAssignmentRequest
    const assignment = await updateAssignment(Number(id), body)
    return NextResponse.json({ assignment })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    await deleteAssignment(Number(id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 })
  }
}
