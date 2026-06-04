import { NextRequest, NextResponse } from "next/server"

import { deleteLesson, updateLesson } from "@/lib/api/lessons"
import { mapLessonToSectionItem } from "@/lib/api/lesson-mappers"
import { ApiError } from "@/lib/api-client"
import type { BackendLessonRequest } from "@/lib/api/types"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await req.json()) as BackendLessonRequest
    const lesson = await updateLesson(Number(id), body)
    return NextResponse.json({ item: mapLessonToSectionItem(lesson) })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    await deleteLesson(Number(id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
