import { requireAccessToken } from "@/lib/api/authenticated"
import { getBackendUrl } from "@/lib/env"
import { type IncomingMessage, request as httpRequest } from "node:http"
import { request as httpsRequest } from "node:https"

export const dynamic = "force-dynamic"

function connectToBackendStream(
  url: URL,
  token: string,
): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const isHttps = url.protocol === "https:"
    const req = (isHttps ? httpsRequest : httpRequest)(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      },
      resolve,
    )
    req.on("error", reject)
    req.end()
  })
}

export async function GET() {
  let token: string
  try {
    token = await requireAccessToken()
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  const url = new URL(`${getBackendUrl()}/api/notifications/stream`)

  let upstream: IncomingMessage
  try {
    upstream = await connectToBackendStream(url, token)
  } catch {
    return new Response("Stream unavailable", { status: 502 })
  }

  if ((upstream.statusCode ?? 0) >= 400) {
    upstream.destroy()
    return new Response("Stream unavailable", { status: 502 })
  }

  const body = new ReadableStream({
    start(controller) {
      upstream.on("data", (chunk: Buffer) => controller.enqueue(chunk))
      upstream.on("end", () => controller.close())
      upstream.on("error", () => controller.close())
    },
    cancel() {
      upstream.destroy()
    },
  })

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
