import "server-only"

import type { BackendAuthResponse, BackendUserResponse } from "./auth"
import { getBackendUrl } from "./env"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function parseErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    const data = (await res.json()) as { error?: string; message?: string }
    return data.error ?? data.message ?? "Request failed"
  }

  const text = await res.text()
  return text || "Request failed"
}

type BackendFetchOptions = RequestInit & {
  accessToken?: string
}

export async function backendFetch(
  path: string,
  options: BackendFetchOptions = {},
): Promise<Response> {
  const { accessToken, ...init } = options
  const headers = new Headers(init.headers)

  if (
    !headers.has("Content-Type") &&
    init.body &&
    typeof init.body === "string"
  ) {
    headers.set("Content-Type", "application/json")
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  return fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })
}

export async function loginWithBackend(
  email: string,
  password: string,
): Promise<BackendAuthResponse> {
  const res = await backendFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }

  return res.json() as Promise<BackendAuthResponse>
}

export async function registerWithBackend(
  email: string,
  password: string,
  fullName: string,
): Promise<void> {
  const res = await backendFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName }),
  })

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }
}

export async function refreshWithBackend(
  refreshToken: string,
): Promise<BackendAuthResponse> {
  const res = await backendFetch("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }

  return res.json() as Promise<BackendAuthResponse>
}

export async function logoutWithBackend(accessToken: string): Promise<void> {
  const res = await backendFetch("/api/auth/logout", {
    method: "POST",
    accessToken,
  })

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<BackendUserResponse> {
  const res = await backendFetch("/api/users/me", { accessToken })

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }

  return res.json() as Promise<BackendUserResponse>
}
