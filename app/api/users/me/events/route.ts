import { NextRequest, NextResponse } from "next/server"

import { listMyPersonalEvents, createPersonalEvent } from "@/lib/api/personal-events"
import type { BackendPersonalEventRequest } from "@/lib/api/types"
import { ApiError } from "@/lib/api-client"

export async function GET() {
  try {
    const events = await listMyPersonalEvents()
    return NextResponse.json({ events })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BackendPersonalEventRequest
    const event = await createPersonalEvent(body)
    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
