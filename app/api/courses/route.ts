import { NextRequest, NextResponse } from "next/server"

import { createCourse } from "@/lib/api/courses"
import { ApiError } from "@/lib/api-client"
import type { BackendCourseRequest } from "@/lib/api/types"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BackendCourseRequest
    const course = await createCourse(body)
    return NextResponse.json({ course }, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
