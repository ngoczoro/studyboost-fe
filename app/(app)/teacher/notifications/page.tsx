import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getNotifications } from "@/lib/api/notifications"
import { NotificationsFeed } from "@/components/notifications-feed"

export default async function TeacherNotificationsPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const notifications = await getNotifications().catch(() => [])
  return <NotificationsFeed initialItems={notifications} />
}
