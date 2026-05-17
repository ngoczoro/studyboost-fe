import Link from "next/link"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { users, courses, enrollments } from "@/lib/mock-data"
import { Card, StatCard, StatusBadge, EmptyState, PageHeader } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { CourseGlyph } from "@/components/ui/course-glyph"
import { UsersIcon, CheckIcon, BookIcon, GradCapIcon } from "@/components/ui/icons"

export default async function AdminDashboardPage() {
  const session = await verifySession()
  if (!session || session.role !== "admin") redirect("/login")

  const totalUsers = users.length
  const totalCourses = courses.length
  const published = courses.filter(c => c.status === "PUBLISHED").length
  const totalEnrollments = enrollments.length
  const activeUsers = users.filter(u => u.is_active).length
  const recentCourses = courses.slice(0, 5)

  const teacherNames: Record<number, string> = {}
  users.forEach(u => { teacherNames[u.id] = u.full_name })

  return (
    <>
      <PageHeader title="Admin Dashboard" description="A snapshot of platform activity." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total users" value={totalUsers} delta={12} icon={<UsersIcon size={20} />} />
        <StatCard label="Active users" value={activeUsers} icon={<CheckIcon size={20} />} />
        <StatCard label="Total courses" value={totalCourses} tone="blue" icon={<BookIcon size={20} />} />
        <StatCard label="Enrollments" value={totalEnrollments} tone="violet" icon={<GradCapIcon size={20} />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Course pipeline</h2>
            <Link href="/admin/courses" style={{ fontSize: 13, color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {recentCourses.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                <CourseGlyph course={c} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fg)" }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
                    {teacherNames[c.teacher_id]} · {c.max_students} max students
                  </div>
                </div>
                <StatusBadge status={c.status.toLowerCase()} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Awaiting review</h2>
          <EmptyState
            icon={<CheckIcon size={24} />}
            title="All caught up"
            description="No courses are waiting for approval."
          />
        </Card>
      </div>
    </>
  )
}
