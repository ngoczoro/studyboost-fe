import "server-only"
import { authJson } from "./authenticated"
import { mapBackendNotification } from "./mappers"
import type { BackendNotificationResponse } from "./types"
import type { Notification } from "@/lib/types"

export async function getNotifications(): Promise<Notification[]> {
  const data = await authJson<BackendNotificationResponse[]>("/api/notifications")
  return data.map(mapBackendNotification)
}

export async function getUnreadCount(): Promise<number> {
  const data = await authJson<{ unreadCount: number }>("/api/notifications/unread-count")
  return data.unreadCount ?? 0
}
