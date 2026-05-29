import { NextRequest, NextResponse } from "next/server"

import { deleteCourse, getCourseById, updateCourse } from "@/lib/api/courses"
import { ApiError } from "@/lib/api-client"
import type { BackendCourseRequest } from "@/lib/api/types"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const course = await getCourseById(Number(id))
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    return NextResponse.json({ course })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to load course" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await req.json()) as BackendCourseRequest
    const course = await updateCourse(Number(id), body)
    return NextResponse.json({ course })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    await deleteCourse(Number(id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
