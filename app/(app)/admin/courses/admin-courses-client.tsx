"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, PageHeader, StatusBadge, EmptyState, Tabs, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { CourseGlyph } from "@/components/ui/course-glyph"
import type { CourseWithMeta } from "./page"

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
]

interface Props {
  initialCourses: CourseWithMeta[]
}

async function updateCourseStatus(course: CourseWithMeta, status: "PUBLISHED" | "ARCHIVED") {
  const res = await fetch(`/api/courses/${course.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnail_url,
      maxStudents: course.max_students,
      status,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? "Update failed")
  return data.course as CourseWithMeta
}

export function AdminCoursesClient({ initialCourses }: Props) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [courseList, setCourseList] = useState(initialCourses)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (statusFilter === "all") return courseList
    return courseList.filter(c => c.status.toLowerCase() === statusFilter)
  }, [courseList, statusFilter])

  const archive = async (course: CourseWithMeta) => {
    setUpdatingId(course.id)
    try {
      const updated = await updateCourseStatus(course, "ARCHIVED")
      setCourseList(prev =>
        prev.map(c => (c.id === course.id ? { ...c, ...updated, teacherName: c.teacherName, enrolled: c.enrolled } : c)),
      )
      toast("Course archived", "success")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Archive failed", "error")
    } finally {
      setUpdatingId(null)
    }
  }

  const restore = async (course: CourseWithMeta) => {
    setUpdatingId(course.id)
    try {
      const updated = await updateCourseStatus(course, "PUBLISHED")
      setCourseList(prev =>
        prev.map(c => (c.id === course.id ? { ...c, ...updated, teacherName: c.teacherName, enrolled: c.enrolled } : c)),
      )
      toast("Course restored", "success")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Restore failed", "error")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Course moderation"
        subtitle="View and manage all courses on the platform."
      />

      <div style={{ marginBottom: 20 }}>
        <Tabs tabs={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No courses"
          description={statusFilter === "all" ? "No courses yet." : `No ${statusFilter} courses.`}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(c => (
            <Card key={c.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <Link href={`/admin/courses/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <CourseGlyph course={c} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: 15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{c.teacherName}</div>
                </div>
                <StatusBadge status={c.status.toLowerCase()} />
              </div>
              </Link>

              {c.description && (
                <Link href={`/admin/courses/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <p style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  color: "var(--color-fg-muted)",
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {c.description}
                </p>
                </Link>
              )}

              <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 12 }}>
                {c.enrolled} / {c.max_students} enrolled ·{" "}
                <Link href={`/admin/courses/${c.id}`} style={{ color: "var(--color-primary-600)", textDecoration: "none" }}>
                  View details
                </Link>
              </div>

              {c.status === "PUBLISHED" && (
                <ButtonSmall
                  variant="ghost"
                  onClick={() => archive(c)}
                  disabled={updatingId === c.id}
                  style={{ width: "100%" }}
                >
                  Archive
                </ButtonSmall>
              )}
              {c.status === "ARCHIVED" && (
                <ButtonSmall
                  onClick={() => restore(c)}
                  disabled={updatingId === c.id}
                  style={{ width: "100%" }}
                >
                  Restore
                </ButtonSmall>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
