import { NextRequest, NextResponse } from "next/server"

import {
  listSubmissions,
  submitAssignmentServer,
} from "@/lib/api/assignments"
import { mapBackendSubmission } from "@/lib/api/assignment-mappers"
import { ApiError } from "@/lib/api-client"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const submissions = await listSubmissions(Number(id))
    return NextResponse.json({
      submissions: submissions.map(mapBackendSubmission),
    })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to load submissions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const clientFormData = await req.formData()
    const backendFormData = new FormData()

    const note = clientFormData.get("note")
    if (note !== null) {
      backendFormData.append("note", note)
    }

    const keepFileIds = clientFormData.get("keepFileIds")
    if (keepFileIds !== null) {
      backendFormData.append("keepFileIds", keepFileIds)
    }

    const files = clientFormData.getAll("files")
    for (const file of files) {
      if (file instanceof File) {
        backendFormData.append("files", file)
      }
    }

    const submission = await submitAssignmentServer(Number(id), backendFormData)
    return NextResponse.json(
      { submission: mapBackendSubmission(submission) },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 })
  }
}
