import { NextResponse, type NextRequest } from "next/server"

import { parseSessionUserCookie } from "@/lib/auth"
import { isAccessTokenExpired } from "@/lib/auth-tokens"

const PUBLIC = ["/login", "/register"]
const ROLE_PREFIX: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
}

function hasAuthCookies(request: NextRequest): boolean {
  if (request.cookies.get("access_token")?.value) return true
  return Boolean(
    request.cookies.get("refresh_token")?.value &&
      request.cookies.get("session_user")?.value,
  )
}

function needsTokenRefresh(request: NextRequest): boolean {
  const refreshToken = request.cookies.get("refresh_token")?.value
  if (!refreshToken) return false

  const accessToken = request.cookies.get("access_token")?.value
  if (!accessToken) return true

  return isAccessTokenExpired(accessToken)
}

async function refreshSessionCookies(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!needsTokenRefresh(request)) return null

  const refreshUrl = new URL("/api/auth/refresh", request.url)
  const refreshRes = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      Cookie: request.headers.get("cookie") ?? "",
    },
  })

  if (!refreshRes.ok) return null

  const response = NextResponse.next()
  for (const cookie of refreshRes.headers.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie)
  }
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (pathname.startsWith("/api")) return NextResponse.next()
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const refreshed = await refreshSessionCookies(request)
  if (refreshed) return refreshed

  if (!hasAuthCookies(request)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const sessionRaw = request.cookies.get("session_user")?.value
  const user = sessionRaw ? parseSessionUserCookie(sessionRaw) : null
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const rolePrefix = ROLE_PREFIX[user.role]
  if (rolePrefix && !pathname.startsWith(rolePrefix)) {
    return NextResponse.redirect(new URL(`${rolePrefix}/dashboard`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
