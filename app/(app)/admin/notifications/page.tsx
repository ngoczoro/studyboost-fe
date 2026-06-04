import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getNotifications } from "@/lib/api/notifications"
import { NotificationsFeed } from "@/components/notifications-feed"

export default async function AdminNotificationsPage() {
  const session = await verifySession()
  if (!session || session.role !== "admin") redirect("/login")

  const notifications = await getNotifications().catch(() => [])
  return <NotificationsFeed initialItems={notifications} />
}
