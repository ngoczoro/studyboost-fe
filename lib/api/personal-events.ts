import "server-only"

import type {
  BackendPersonalEventRequest,
  BackendPersonalEventResponse,
} from "./types"
import { authJson } from "./authenticated"

export async function listMyPersonalEvents(): Promise<BackendPersonalEventResponse[]> {
  return authJson<BackendPersonalEventResponse[]>("/api/users/me/events")
}

export async function createPersonalEvent(
  body: BackendPersonalEventRequest,
): Promise<BackendPersonalEventResponse> {
  return authJson<BackendPersonalEventResponse>("/api/users/me/events", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updatePersonalEvent(
  id: number,
  body: BackendPersonalEventRequest,
): Promise<BackendPersonalEventResponse> {
  return authJson<BackendPersonalEventResponse>(`/api/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export async function deletePersonalEvent(id: number): Promise<void> {
  await authJson<{ message: string }>(`/api/events/${id}`, {
    method: "DELETE",
  })
}
