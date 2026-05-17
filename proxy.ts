import { NextResponse, type NextRequest } from "next/server"
import { decrypt } from "@/lib/session"

const PUBLIC = ["/login", "/register"]
const ROLE_PREFIX: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes and API routes
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (pathname.startsWith("/api")) return NextResponse.next()
  if (pathname === "/") return NextResponse.redirect(new URL("/login", request.url))

  const token = request.cookies.get("session")?.value
  if (!token) return NextResponse.redirect(new URL("/login", request.url))

  const user = await decrypt(token)
  if (!user) return NextResponse.redirect(new URL("/login", request.url))

  const rolePrefix = ROLE_PREFIX[user.role]
  if (rolePrefix && !pathname.startsWith(rolePrefix)) {
    return NextResponse.redirect(new URL(`${rolePrefix}/dashboard`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
