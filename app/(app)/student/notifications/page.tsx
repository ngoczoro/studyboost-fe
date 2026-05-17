import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getUserNotifications } from "@/lib/mock-data"
import { NotificationsFeed } from "@/components/notifications-feed"

export default async function StudentNotificationsPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const notifications = getUserNotifications(session.id)
  return <NotificationsFeed initialItems={notifications} />
}
