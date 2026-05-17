import "server-only"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { cache } from "react"
import type { SessionUser } from "./types"

const COOKIE = "session"
const key = new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-secret-change-in-production")

export async function encrypt(payload: SessionUser) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key)
}

export async function decrypt(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] })
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function createSession(user: SessionUser) {
  const token = await encrypt(user)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE)
}

export const verifySession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  return decrypt(token)
})
