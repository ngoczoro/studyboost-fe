import { NextRequest, NextResponse } from "next/server"

import { gradeSubmission } from "@/lib/api/grades"
import type { BackendGradeRequest } from "@/lib/api/types"
import { ApiError } from "@/lib/api-client"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await req.json()) as BackendGradeRequest
    const grade = await gradeSubmission(Number(id), body)
    return NextResponse.json({ grade }, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to save grade" }, { status: 500 })
  }
}
