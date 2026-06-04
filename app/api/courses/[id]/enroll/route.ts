import { NextResponse } from "next/server"

import { enrollInCourse } from "@/lib/api/enrollments"
import { ApiError } from "@/lib/api-client"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const enrollment = await enrollInCourse(Number(id))
    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Enrollment failed" }, { status: 500 })
  }
}
