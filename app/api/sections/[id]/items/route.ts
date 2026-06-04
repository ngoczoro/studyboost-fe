import { NextRequest, NextResponse } from "next/server"

import { createSectionItem, listLessonsInSection } from "@/lib/api/lessons"
import { mapLessonToSectionItem } from "@/lib/api/lesson-mappers"
import { ApiError } from "@/lib/api-client"
import type { BackendLessonCreateRequest } from "@/lib/api/types"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const lessons = await listLessonsInSection(Number(id))
    return NextResponse.json({
      items: lessons.map(mapLessonToSectionItem),
    })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await req.json()) as BackendLessonCreateRequest
    const lesson = await createSectionItem(Number(id), body)
    return NextResponse.json(
      { item: mapLessonToSectionItem(lesson) },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
