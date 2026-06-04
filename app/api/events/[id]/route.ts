import { NextRequest, NextResponse } from "next/server"

import { updatePersonalEvent, deletePersonalEvent } from "@/lib/api/personal-events"
import type { BackendPersonalEventRequest } from "@/lib/api/types"
import { ApiError } from "@/lib/api-client"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await req.json()) as BackendPersonalEventRequest
    const event = await updatePersonalEvent(Number(id), body)
    return NextResponse.json({ event })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    await deletePersonalEvent(Number(id))
    return NextResponse.json({ message: "Event deleted" })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
