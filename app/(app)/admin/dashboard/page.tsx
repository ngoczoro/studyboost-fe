import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listCourses } from "@/lib/api/courses"
import { countTotalActiveEnrollments } from "@/lib/api/enrollments"
import { getAdminStats } from "@/lib/api/admin"
import { getAccessToken } from "@/lib/auth-cookies"
import { Card, StatCard, StatusBadge, EmptyState, PageHeader } from "@/components/ui/primitives"
import { CourseGlyph } from "@/components/ui/course-glyph"
import { UsersIcon, CheckIcon, BookIcon, GradCapIcon } from "@/components/ui/icons"
import Link from "next/link"
import { ApiError } from "@/lib/api-client"

export default async function AdminDashboardPage() {
  const session = await verifySession()
  if (!session || session.role !== "admin") redirect("/login")

  try {
    const token = await getAccessToken()
    const [allCourses, stats] = await Promise.all([
      listCourses(),
      token ? getAdminStats(token) : Promise.resolve(null),
    ])

    const totalEnrollments = await countTotalActiveEnrollments(allCourses.map(c => c.id))
    const recentCourses = allCourses.slice(0, 5)
    const draftCourses = allCourses.filter(c => c.status === "DRAFT")

    // Dùng stats thực từ BE nếu có, fallback về dữ liệu FE
    const totalUsers = stats?.totalUsers ?? 0
    const activeUsers = stats ? (stats.totalStudents + stats.totalTeachers + stats.totalAdmins) : 0

    return (
      <>
        <PageHeader title="Admin Dashboard" description="A snapshot of platform activity." />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard label="Total users" value={totalUsers} icon={<UsersIcon size={20} />} />
          <StatCard label="Active users" value={activeUsers} icon={<CheckIcon size={20} />} />
          <StatCard label="Total courses" value={allCourses.length} tone="blue" icon={<BookIcon size={20} />} />
          <StatCard label="Enrollments" value={totalEnrollments} tone="violet" icon={<GradCapIcon size={20} />} />
        </div>

        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <Card style={{ padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-fg)" }}>{stats.totalStudents}</div>
              <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginTop: 4 }}>Students</div>
            </Card>
            <Card style={{ padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-fg)" }}>{stats.totalTeachers}</div>
              <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginTop: 4 }}>Teachers</div>
            </Card>
            <Card style={{ padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-fg)" }}>{stats.totalAdmins}</div>
              <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginTop: 4 }}>Admins</div>
            </Card>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Course pipeline</h2>
              <Link href="/admin/courses" style={{ fontSize: 13, color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {recentCourses.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--color-fg-muted)", margin: 0 }}>No courses yet.</p>
              ) : (
                recentCourses.map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                    <CourseGlyph course={c} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fg)" }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
                        {c.teacher?.full_name ?? "Unknown"} · {c.max_students} max students
                      </div>
                    </div>
                    <StatusBadge status={c.status.toLowerCase()} />
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Draft courses</h2>
            {draftCourses.length === 0 ? (
              <EmptyState
                icon={<CheckIcon size={24} />}
                title="No drafts"
                description="All courses are live."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {draftCourses.slice(0, 5).map(c => (
                  <div key={c.id} style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div style={{ color: "var(--color-fg-muted)", fontSize: 12 }}>{c.teacher?.full_name ?? "Unknown"}</div>
                  </div>
                ))}
                <Link href="/admin/courses" style={{ fontSize: 13, color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
                  View in courses →
                </Link>
              </div>
            )}
          </Card>
        </div>
      </>
    )
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to load dashboard"
    return (
      <>
        <PageHeader title="Admin Dashboard" description="Unable to load data" />
        <Card>
          <EmptyState title="Could not load dashboard" description={message} />
        </Card>
      </>
    )
  }
}
