import { NextRequest, NextResponse } from "next/server"

import { requireAccessToken } from "@/lib/api/authenticated"
import { backendFetch, ApiError, parseErrorMessage } from "@/lib/api-client"

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  const filename = req.nextUrl.searchParams.get("filename")
  const disposition = req.nextUrl.searchParams.get("disposition") ?? "attachment"

  if (!key) {
    return NextResponse.json(
      { error: "Missing file key.", errorCode: "File not found" },
      { status: 400 },
    )
  }

  try {
    const accessToken = await requireAccessToken()
    const params = new URLSearchParams({ key, disposition })
    if (filename) params.set("filename", filename)

    const res = await backendFetch(
      `/api/files/download?${params.toString()}`,
      { accessToken, redirect: "manual" },
    )

    if (res.status === 302 || res.status === 301) {
      const location = res.headers.get("location")
      if (location) {
        return NextResponse.redirect(location)
      }
    }

    if (res.status === 404) {
      return NextResponse.json(
        { error: "File not found.", errorCode: "File not found" },
        { status: 404 },
      )
    }

    if (!res.ok) {
      const message = await parseErrorMessage(res)
      throw new ApiError(res.status, message)
    }

    const contentType = res.headers.get("content-type") ?? "application/octet-stream"
    const contentDisposition = res.headers.get("content-disposition")
    const buffer = await res.arrayBuffer()

    const headers = new Headers({ "Content-Type": contentType })
    if (contentDisposition) headers.set("Content-Disposition", contentDisposition)

    return new NextResponse(buffer, { status: 200, headers })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json(
      { error: "Download failed. Please try again.", errorCode: "Upload failed" },
      { status: 500 },
    )
  }
}
