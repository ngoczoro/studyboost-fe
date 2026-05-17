"use client"

import { useState, useMemo } from "react"
import { courses, enrollments, users } from "@/lib/mock-data"
import { Card, PageHeader, StatusBadge, EmptyState, Tabs, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { CourseGlyph } from "@/components/ui/course-glyph"
import type { Course } from "@/lib/types"

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
]

type CourseWithMeta = Course & { teacherName: string; enrolled: number }

function buildMeta(c: Course): CourseWithMeta {
  const teacher = users.find(u => u.id === c.teacher_id)
  const enrolled = enrollments.filter(e => e.course_id === c.id && e.status === "ACTIVE").length
  return { ...c, teacherName: teacher?.full_name ?? "Unknown", enrolled }
}

const allCoursesWithMeta: CourseWithMeta[] = courses.map(buildMeta)

export default function AdminCoursesPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [courseList, setCourseList] = useState<CourseWithMeta[]>(allCoursesWithMeta)

  const filtered = useMemo(() => {
    if (statusFilter === "all") return courseList
    return courseList.filter(c => c.status.toLowerCase() === statusFilter)
  }, [courseList, statusFilter])

  const approve = (id: number) => {
    setCourseList(prev => prev.map(c => c.id === id ? { ...c, status: "PUBLISHED" as const } : c))
    toast("Course approved", "success")
  }

  const reject = (id: number) => {
    setCourseList(prev => prev.map(c => c.id === id ? { ...c, status: "ARCHIVED" as const } : c))
    toast("Course rejected", "error")
  }

  return (
    <>
      <PageHeader
        title="Course moderation"
        subtitle="Approve, reject, or unpublish courses across the platform."
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
              {/* Header */}
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

              {/* Description */}
              {c.description && (
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
              )}

              {/* Meta */}
              <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 12 }}>
                {c.enrolled} / {c.max_students} enrolled
              </div>

              {/* Actions — only shown for "pending" (none in mock-data, but wired for completeness) */}
              {c.status === "DRAFT" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <ButtonSmall onClick={() => approve(c.id)} style={{ flex: 1 }}>Approve</ButtonSmall>
                  <ButtonSmall variant="danger" onClick={() => reject(c.id)} style={{ flex: 1 }}>Reject</ButtonSmall>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
