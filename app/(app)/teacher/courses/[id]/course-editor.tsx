"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Course, Assignment, Enrollment, SectionItem } from "@/lib/types"
import type { SectionWithItems } from "@/lib/api/sections"
import {
  assignments as allAssignments, submissions, grades,
} from "@/lib/mock-data"
import {
  sectionItemToLessonRequest,
  toCreateItemPayload,
} from "@/lib/api/lesson-mappers"
import { LessonEditModal } from "@/components/lesson/lesson-edit-modal"
import { Card, Badge, Tabs, IconButton, EmptyState, toast, Avatar, Modal } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import {
  DragIcon, EditIcon, TrashIcon, PlayIcon, FileIcon, DocIcon,
  ClipboardCheckIcon, PlusIcon,
} from "@/components/ui/icons"
import { date_ } from "@/lib/fmt"
import { relative } from "@/lib/fmt"

interface Props {
  course: Course
  enrolledCount: number
  enrollments: Enrollment[]
  initialSections: SectionWithItems[]
}

const ITEM_META: Record<string, { bg: string; Icon: React.FC<{ size?: number }> }> = {
  video:      { bg: "#fee2e2", Icon: PlayIcon },
  file:       { bg: "#dbeafe", Icon: FileIcon },
  text:       { bg: "var(--color-surface-2, #f1f5f9)", Icon: DocIcon },
  assignment: { bg: "#f3e8ff", Icon: ClipboardCheckIcon },
}

/* ─── Assignment edit modal ─── */
interface AssignmentEditModalProps {
  open: boolean
  onClose: () => void
  courseId: number
  assignment?: Assignment | null
  onSaved?: () => void
}

function buildDefaultAssignmentForm() {
  return {
    title: "",
    description: "",
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    max_score: 100,
  }
}

function AssignmentEditModal({ open, onClose, courseId, assignment, onSaved }: AssignmentEditModalProps) {
  const isEdit = !!assignment
  const [form, setForm] = useState(buildDefaultAssignmentForm)

  useEffect(() => {
    if (!open) {
      setForm(buildDefaultAssignmentForm())
      return
    }
    if (assignment) {
      setForm({
        title: assignment.title,
        description: assignment.description ?? "",
        due_date: assignment.due_date?.slice(0, 16) ?? "",
        max_score: assignment.max_score,
      })
    } else {
      setForm(buildDefaultAssignmentForm())
    }
  }, [open, assignment])

  const handle = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async () => {
    if (!form.title) return
    await new Promise(r => setTimeout(r, 300))
    toast(isEdit ? "Assignment updated" : "Assignment created", "success")
    onSaved?.()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit assignment" : "New assignment"} width={520}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Title</label>
          <input value={form.title} onChange={handle("title")} placeholder="e.g. Final portfolio"
            style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Description</label>
          <textarea value={form.description} onChange={handle("description")} rows={3} placeholder="What should students deliver?"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Due date</label>
            <input type="datetime-local" value={form.due_date} onChange={handle("due_date")}
              style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Max score</label>
            <input type="number" value={form.max_score} onChange={handle("max_score")}
              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={submit} disabled={!form.title}>{isEdit ? "Save changes" : "Create"}</ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}

/* ─── Section item row ─── */
function SectionItemRow({ item, onEdit, onDelete }: { item: SectionItem; onEdit: () => void; onDelete: () => void }) {
  const meta = ITEM_META[item.type] ?? ITEM_META.file
  const { Icon } = meta
  return (
    <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid var(--color-border)" }}>
      <DragIcon size={16} color="var(--color-fg-muted)" />
      <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
          {item.title}
          {item.is_visible === false && <Badge tone="default">Hidden</Badge>}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-fg-muted)", textTransform: "capitalize" }}>{item.type}</div>
      </div>
      <IconButton onClick={onEdit} title="Edit"><EditIcon size={16} /></IconButton>
      <IconButton onClick={onDelete} title="Delete"><TrashIcon size={16} /></IconButton>
    </div>
  )
}

/* ─── Assignments sub-tab ─── */
function CourseAssignmentsTab({ courseId, onNew, onEdit }: { courseId: number; onNew: () => void; onEdit: (a: Assignment) => void }) {
  const router = useRouter()
  const courseAssignments = allAssignments.filter(a => a.course_id === courseId)

  const remove = (a: Assignment) => {
    if (!window.confirm(`Delete "${a.title}" and all its submissions?`)) return
    toast("Assignment deleted", "success")
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <ButtonSmall onClick={onNew}><PlusIcon size={14} /> New assignment</ButtonSmall>
      </div>
      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-surface-2)", fontSize: 12, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <th style={{ textAlign: "left", padding: "12px 16px" }}>Assignment</th>
              <th style={{ textAlign: "left", padding: "12px 16px" }}>Due</th>
              <th style={{ textAlign: "right", padding: "12px 16px" }}>Submissions</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {courseAssignments.map(a => {
              const subs = submissions.filter(s => s.assignment_id === a.id)
              return (
                <tr key={a.id} style={{ borderTop: "1px solid var(--color-border)", cursor: "pointer" }}
                  onClick={() => router.push(`/teacher/assignments/${a.id}`)}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>Max {a.max_score} pts</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-fg-muted)" }}>{date_(a.due_date ?? "")}</td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Badge tone={subs.length ? "blue" : "default"}>{subs.length}</Badge>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                    <IconButton onClick={() => onEdit(a)} title="Edit"><EditIcon size={16} /></IconButton>
                    <IconButton onClick={() => remove(a)} title="Delete"><TrashIcon size={16} /></IconButton>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {courseAssignments.length === 0 && (
          <div style={{ padding: 32 }}>
            <EmptyState icon={<ClipboardCheckIcon size={24} />} title="No assignments yet" description="Click 'New assignment' to create one." />
          </div>
        )}
      </Card>
    </>
  )
}

/* ─── Students sub-tab ─── */
function CourseStudentsTab({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <Card style={{ padding: 0 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--color-surface-2)", fontSize: 12, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>Student</th>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map(e => {
            const student = e.student
            if (!student) return null
            return (
              <tr key={e.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={student.full_name} size="sm" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{student.full_name}</div>
                      <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{student.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Badge tone={e.status === "ACTIVE" ? "green" : e.status === "COMPLETED" ? "blue" : "default"}>
                    {e.status}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {enrollments.length === 0 && (
        <div style={{ padding: 32 }}>
          <EmptyState title="No students yet" description="Students will appear here after they enroll." />
        </div>
      )}
    </Card>
  )
}

/* ─── Main editor component ─── */
export function CourseEditor({ course: initialCourse, enrolledCount, enrollments, initialSections }: Props) {
  const router = useRouter()
  const [course, setCourse] = useState(initialCourse)
  const [sections, setSections] = useState(initialSections)
  const [activeTab, setActiveTab] = useState("content")
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [editingItem, setEditingItem] = useState<SectionItem | null>(null)
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState("")
  const [settingsTitle, setSettingsTitle] = useState(initialCourse.title)
  const [settingsDescription, setSettingsDescription] = useState(initialCourse.description ?? "")
  const [settingsMaxStudents, setSettingsMaxStudents] = useState(initialCourse.max_students)
  const [saving, setSaving] = useState(false)
  const [contentLoading, setContentLoading] = useState(false)

  useEffect(() => { setCourse(initialCourse) }, [initialCourse])
  useEffect(() => { setSections(initialSections) }, [initialSections])

  const courseAssignments = allAssignments.filter(a => a.course_id === course.id)

  async function patchCourse(body: Record<string, unknown>) {
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnail_url,
        maxStudents: course.max_students,
        status: course.status,
        ...body,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Update failed")
    setCourse(data.course)
    return data.course as Course
  }

  const openNewAssignment = () => { setEditingAssignment(null); setAssignmentModalOpen(true) }
  const openEditAssignment = (a: Assignment) => { setEditingAssignment(a); setAssignmentModalOpen(true) }

  const togglePublish = async () => {
    setSaving(true)
    try {
      const next = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
      await patchCourse({ status: next })
      toast(next === "PUBLISHED" ? "Course published" : "Course set to draft", "success")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error")
    } finally {
      setSaving(false)
    }
  }

  const deleteCourse = async () => {
    if (!window.confirm(`Permanently delete "${course.title}"? This removes all sections, assignments, posts, and enrollments.`)) return
    setSaving(true)
    try {
      const res = await fetch(`/api/courses/${course.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Delete failed")
      toast("Course deleted", "success")
      router.push("/teacher/courses")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error")
    } finally {
      setSaving(false)
    }
  }

  const addSection = async () => {
    setContentLoading(true)
    try {
      const res = await fetch(`/api/courses/${course.id}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New section", orderIndex: sections.length }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to add section")
      toast("Section added", "success")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add section", "error")
    } finally {
      setContentLoading(false)
    }
  }

  const saveSectionTitle = async (sectionId: number) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || !editingSectionTitle.trim()) {
      setEditingSectionId(null)
      return
    }
    setContentLoading(true)
    try {
      const res = await fetch(`/api/sections/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingSectionTitle.trim(),
          orderIndex: section.order_index,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to rename section")
      toast("Section renamed", "success")
      setEditingSectionId(null)
      setEditingSectionTitle("")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to rename section", "error")
    } finally {
      setContentLoading(false)
    }
  }

  const deleteSection = async (sectionId: number) => {
    if (!window.confirm("Delete this section and all its items?")) return
    setContentLoading(true)
    try {
      const res = await fetch(`/api/sections/${sectionId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to delete section")
      toast("Section deleted", "success")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete section", "error")
    } finally {
      setContentLoading(false)
    }
  }

  const addItem = async (sectionId: number, type: "video" | "file" | "text") => {
    const section = sections.find(s => s.id === sectionId)
    const orderIndex = section?.items?.length ?? 0
    setContentLoading(true)
    try {
      const payload = toCreateItemPayload(type, orderIndex)
      const res = await fetch(`/api/sections/${sectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to add item")

      if (type === "text" && data.item) {
        const updateRes = await fetch(`/api/items/${data.item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "TEXT",
            title: data.item.title,
            content: "Enter lesson content here.",
            orderIndex: data.item.order_index,
            isVisible: true,
          }),
        })
        if (!updateRes.ok) {
          const updateData = await updateRes.json()
          throw new Error(updateData.error ?? "Failed to initialize text lesson")
        }
      }

      toast(`${type === "video" ? "Video" : type === "file" ? "File" : "Text"} lesson added`, "success")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add item", "error")
    } finally {
      setContentLoading(false)
    }
  }

  const saveItem = async (
    item: SectionItem,
    updates: {
      title: string
      is_visible: boolean
      content?: string
      url?: string
      document_url?: string
      document_name?: string
      document_size?: number
      document_mime_type?: string
      document_uploaded_at?: string
      video_file_name?: string
      video_file_size?: number
      video_mime_type?: string
      video_uploaded_at?: string
    },
  ) => {
    const body = sectionItemToLessonRequest(item, updates)
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Failed to update item")
    toast("Item updated", "success")
    router.refresh()
  }

  const deleteItem = async (itemId: number) => {
    if (!window.confirm("Delete this item?")) return
    setContentLoading(true)
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to delete item")
      toast("Item deleted", "success")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete item", "error")
    } finally {
      setContentLoading(false)
    }
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 4 }}>
            <Link href="/teacher/courses" style={{ color: "var(--color-primary-600)", textDecoration: "none" }}>My courses</Link>
            {" / Editor"}
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{course.title}</h1>
          {course.description && <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-fg-muted)" }}>{course.description}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ButtonSmall variant="ghost" onClick={togglePublish} disabled={saving}>
            {course.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </ButtonSmall>
          <ButtonSmall variant="danger" onClick={deleteCourse} disabled={saving}>Delete</ButtonSmall>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { label: "Content", value: "content" },
            { label: `Assignments (${courseAssignments.length})`, value: "assignments" },
            { label: `Students (${enrolledCount})`, value: "students" },
            { label: "Settings", value: "settings" },
          ]}
        />
      </div>

      {activeTab === "content" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sections.length === 0 ? (
            <EmptyState
              title="No sections yet"
              description="Add your first section to start building course content."
            />
          ) : null}
          {sections.map(s => (
            <Card key={s.id} style={{ padding: 0 }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 8 }}>
                <DragIcon size={18} color="var(--color-fg-muted)" />
                {editingSectionId === s.id ? (
                  <input
                    value={editingSectionTitle}
                    onChange={e => setEditingSectionTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveSectionTitle(s.id); if (e.key === "Escape") setEditingSectionId(null) }}
                    onBlur={() => saveSectionTitle(s.id)}
                    autoFocus
                    style={{ flex: 1, height: 32, padding: "0 10px", border: "1px solid var(--color-primary-600)", borderRadius: 8, fontSize: 14, fontWeight: 600, outline: "none", background: "var(--color-surface)", color: "var(--color-fg)" }}
                  />
                ) : (
                  <div style={{ fontWeight: 600, flex: 1 }}>{s.title}</div>
                )}
                <span style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{s.items?.length ?? 0} items</span>
                <IconButton onClick={() => { setEditingSectionId(s.id); setEditingSectionTitle(s.title) }} title="Rename"><EditIcon size={14} /></IconButton>
                <IconButton onClick={() => deleteSection(s.id)} title="Delete"><TrashIcon size={14} /></IconButton>
              </div>
              <div>
                {(s.items ?? []).map(item => (
                  <SectionItemRow
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </div>
              <div style={{ padding: 12, borderTop: "1px solid var(--color-border)", background: "var(--color-surface-2, #f8f9fa)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <ButtonSmall variant="ghost" disabled={contentLoading} onClick={() => addItem(s.id, "video")}>
                  <PlayIcon size={13} /> Video
                </ButtonSmall>
                <ButtonSmall variant="ghost" disabled={contentLoading} onClick={() => addItem(s.id, "file")}>
                  <FileIcon size={13} /> File
                </ButtonSmall>
                <ButtonSmall variant="ghost" disabled={contentLoading} onClick={() => addItem(s.id, "text")}>
                  <DocIcon size={13} /> Text
                </ButtonSmall>
              </div>
            </Card>
          ))}
          <button
            type="button"
            onClick={addSection}
            disabled={contentLoading}
            style={{
              padding: 20, border: "2px dashed var(--color-border)", borderRadius: "var(--radius-lg)",
              background: "transparent", cursor: contentLoading ? "wait" : "pointer", fontSize: 14, fontWeight: 600,
              color: "var(--color-fg-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <PlusIcon size={18} /> Add section
          </button>
        </div>
      )}

      {activeTab === "assignments" && (
        <CourseAssignmentsTab courseId={course.id} onNew={openNewAssignment} onEdit={openEditAssignment} />
      )}

      {activeTab === "students" && <CourseStudentsTab enrollments={enrollments} />}

      {activeTab === "settings" && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Title</label>
              <input
                value={settingsTitle}
                onChange={e => setSettingsTitle(e.target.value)}
                style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Description</label>
              <textarea
                value={settingsDescription}
                onChange={e => setSettingsDescription(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Max students</label>
              <input
                type="number"
                value={settingsMaxStudents}
                onChange={e => setSettingsMaxStudents(Number(e.target.value))}
                style={{ width: 120, height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none" }} />
            </div>
            <div>
              <ButtonSmall
                disabled={saving || !settingsTitle.trim()}
                onClick={async () => {
                  setSaving(true)
                  try {
                    await patchCourse({
                      title: settingsTitle.trim(),
                      description: settingsDescription.trim() || undefined,
                      maxStudents: settingsMaxStudents,
                    })
                    toast("Settings saved", "success")
                    router.refresh()
                  } catch (err) {
                    toast(err instanceof Error ? err.message : "Save failed", "error")
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                Save settings
              </ButtonSmall>
            </div>
          </div>
        </Card>
      )}

      <AssignmentEditModal
        open={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        courseId={course.id}
        assignment={editingAssignment}
        onSaved={() => {}}
      />
      <LessonEditModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={saveItem}
      />
    </>
  )
}
