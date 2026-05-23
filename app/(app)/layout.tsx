import { redirect } from "next/navigation"
import { verifySession } from "@/lib/session"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { getUserNotifications, getUser } from "@/lib/mock-data"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  if (!session) redirect("/login")

  const notifications = getUserNotifications(session.id)
  const user = { id: session.id, full_name: session.full_name, role: session.role }

  return (
    <div className="app-shell">
      <Sidebar role={session.role} userName={session.full_name} />
      <Topbar user={user} notifications={notifications} />
      <main className="app-shell__content">{children}</main>
    </div>
  )
}
