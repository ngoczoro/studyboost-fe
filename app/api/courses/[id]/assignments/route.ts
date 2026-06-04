import { NextRequest, NextResponse } from "next/server"

import {
  createAssignment,
  listAssignmentsInCourse,
} from "@/lib/api/assignments"
import type { BackendAssignmentRequest } from "@/lib/api/types"
import { ApiError } from "@/lib/api-client"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const assignments = await listAssignmentsInCourse(Number(id))
    return NextResponse.json({ assignments })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await req.json()) as BackendAssignmentRequest
    const assignment = await createAssignment(Number(id), body)
    return NextResponse.json({ assignment }, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}
