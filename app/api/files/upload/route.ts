import { NextRequest, NextResponse } from "next/server"

import { requireAccessToken } from "@/lib/api/authenticated"
import { backendFetch, ApiError, parseErrorMessage } from "@/lib/api-client"
import { mapUploadError } from "@/lib/file-validation"

export async function POST(req: NextRequest) {
  try {
    const accessToken = await requireAccessToken()
    const formData = await req.formData()
    const file = formData.get("file")
    const category = formData.get("category")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File is required.", errorCode: "Upload failed" },
        { status: 400 },
      )
    }
    if (typeof category !== "string" || !category) {
      return NextResponse.json(
        { error: "Category is required.", errorCode: "Upload failed" },
        { status: 400 },
      )
    }

    const body = new FormData()
    body.append("file", file)
    body.append("category", category)

    const res = await backendFetch("/api/files/upload", {
      method: "POST",
      accessToken,
      body,
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string; errorCode?: string }
      throw new ApiError(res.status, mapUploadError(data))
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json(
      { error: "Upload failed. Please try again.", errorCode: "Upload failed" },
      { status: 500 },
    )
  }
}
