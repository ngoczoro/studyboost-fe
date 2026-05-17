"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Course, Assignment } from "@/lib/types"
import {
  assignments as allAssignments, submissions, grades,
  getCourseSections, getCourseEnrollments,
} from "@/lib/mock-data"
import { users } from "@/lib/mock-data"
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

function AssignmentEditModal({ open, onClose, courseId, assignment, onSaved }: AssignmentEditModalProps) {
  const isEdit = !!assignment
  const defaultForm = {
    title: "",
    description: "",
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    max_score: 100,
  }
  const [form, setForm] = useState(defaultForm)

  const handle = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const onOpen = () => {
    if (assignment) {
      setForm({
        title: assignment.title,
        description: assignment.description ?? "",
        due_date: assignment.due_date.slice(0, 16),
        max_score: assignment.max_score,
      })
    } else {
      setForm(defaultForm)
    }
  }

  const submit = async () => {
    if (!form.title) return
    await new Promise(r => setTimeout(r, 300))
    toast(isEdit ? "Assignment updated" : "Assignment created", "success")
    onSaved?.()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit assignment" : "New assignment"} width={520}>
      {open && <span style={{ display: "none" }} ref={() => onOpen()} />}
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

/* ─── Section item edit modal ─── */
interface SectionItem {
  id: number
  title: string
  type: string
  is_visible: boolean
  duration?: string
  file_size?: number
}

function SectionItemEditModal({ item, onClose }: { item: SectionItem | null; onClose: () => void }) {
  const [title, setTitle] = useState(item?.title ?? "")
  const [visible, setVisible] = useState(item?.is_visible ?? true)

  const submit = async () => {
    if (!item || !title) return
    await new Promise(r => setTimeout(r, 200))
    toast("Item updated", "success")
    onClose()
  }

  return (
    <Modal open={!!item} onClose={onClose} title="Edit item" width={420}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
          <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
          Visible to students
        </label>
        <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
          Type: <strong style={{ textTransform: "capitalize" }}>{item?.type}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={submit}>Save</ButtonSmall>
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

  const remove = (e: React.MouseEvent, a: Assignment) => {
    e.stopPropagation()
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
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-fg-muted)" }}>{date_(a.due_date)}</td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Badge tone={subs.length ? "blue" : "default"}>{subs.length}</Badge>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                    <IconButton onClick={() => onEdit(a)} title="Edit"><EditIcon size={16} /></IconButton>
                    <IconButton onClick={e => remove(e, a)} title="Delete"><TrashIcon size={16} /></IconButton>
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
function CourseStudentsTab({ courseId }: { courseId: number }) {
  const enrolled = getCourseEnrollments(courseId)
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
          {enrolled.map(e => {
            const student = users.find(u => u.id === e.student_id)
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
      {enrolled.length === 0 && (
        <div style={{ padding: 32 }}>
          <EmptyState title="No students yet" description="Students will appear here after they enroll." />
        </div>
      )}
    </Card>
  )
}

/* ─── Main editor component ─── */
export function CourseEditor({ course, enrolledCount }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("content")
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [editingItem, setEditingItem] = useState<SectionItem | null>(null)
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState("")

  const sections = getCourseSections(course.id)
  const courseAssignments = allAssignments.filter(a => a.course_id === course.id)

  const openNewAssignment = () => { setEditingAssignment(null); setAssignmentModalOpen(true) }
  const openEditAssignment = (a: Assignment) => { setEditingAssignment(a); setAssignmentModalOpen(true) }

  const togglePublish = async () => {
    await new Promise(r => setTimeout(r, 200))
    const next = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
    toast(next === "PUBLISHED" ? "Course published" : "Course set to draft", "success")
  }

  const deleteCourse = async () => {
    if (!window.confirm(`Permanently delete "${course.title}"? This removes all sections, assignments, posts, and enrollments.`)) return
    await new Promise(r => setTimeout(r, 200))
    toast("Course deleted", "success")
    router.push("/teacher/courses")
  }

  const addSection = async () => {
    await new Promise(r => setTimeout(r, 200))
    toast("Section added", "success")
  }

  const saveSectionTitle = async () => {
    await new Promise(r => setTimeout(r, 150))
    toast("Section renamed", "success")
    setEditingSectionId(null)
    setEditingSectionTitle("")
  }

  const deleteSection = async (sectionId: number) => {
    if (!window.confirm("Delete this section and all its items?")) return
    await new Promise(r => setTimeout(r, 200))
    toast("Section deleted", "success")
  }

  const deleteItem = async (itemId: number) => {
    if (!window.confirm("Delete this item?")) return
    await new Promise(r => setTimeout(r, 200))
    toast("Item deleted", "success")
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
          <ButtonSmall variant="ghost" onClick={togglePublish}>
            {course.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </ButtonSmall>
          <ButtonSmall variant="danger" onClick={deleteCourse}>Delete</ButtonSmall>
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
          {sections.map(s => (
            <Card key={s.id} style={{ padding: 0 }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 8 }}>
                <DragIcon size={18} color="var(--color-fg-muted)" />
                {editingSectionId === s.id ? (
                  <input
                    value={editingSectionTitle}
                    onChange={e => setEditingSectionTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveSectionTitle(); if (e.key === "Escape") setEditingSectionId(null) }}
                    onBlur={saveSectionTitle}
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
                {(s.items ?? []).map((item: SectionItem) => (
                  <SectionItemRow
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </div>
              <div style={{ padding: 12, borderTop: "1px solid var(--color-border)", background: "var(--color-surface-2, #f8f9fa)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <ButtonSmall variant="ghost" onClick={() => toast("Video lesson added", "success")}>
                  <PlayIcon size={13} /> Video
                </ButtonSmall>
                <ButtonSmall variant="ghost" onClick={() => toast("File added", "success")}>
                  <FileIcon size={13} /> File
                </ButtonSmall>
                <ButtonSmall variant="ghost" onClick={() => toast("Text item added", "success")}>
                  <DocIcon size={13} /> Text
                </ButtonSmall>
                <ButtonSmall variant="ghost" onClick={openNewAssignment}>
                  <ClipboardCheckIcon size={13} /> Assignment
                </ButtonSmall>
              </div>
            </Card>
          ))}
          <button
            type="button"
            onClick={addSection}
            style={{
              padding: 20, border: "2px dashed var(--color-border)", borderRadius: "var(--radius-lg)",
              background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 600,
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

      {activeTab === "students" && <CourseStudentsTab courseId={course.id} />}

      {activeTab === "settings" && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Title</label>
              <input defaultValue={course.title}
                style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Description</label>
              <textarea defaultValue={course.description ?? ""} rows={3}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Max students</label>
              <input type="number" defaultValue={course.max_students}
                style={{ width: 120, height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 14, outline: "none" }} />
            </div>
            <div>
              <ButtonSmall onClick={() => toast("Settings saved", "success")}>Save settings</ButtonSmall>
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
      <SectionItemEditModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />
    </>
  )
}
