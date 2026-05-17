"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader, Card, Badge, Modal, IconButton, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { EditIcon, TrashIcon, PlusIcon } from "@/components/ui/icons"
import { date_ } from "@/lib/fmt"
import type { Course } from "@/lib/types"

interface AssignmentRow {
  id: number
  title: string
  description?: string
  course_id: number
  courseName: string
  due_date?: string
  max_score: number
  totalSubmissions: number
  gradedCount: number
}

interface EditForm {
  title: string
  description: string
  due_date: string
  max_score: string
}

interface EditModalProps {
  open: boolean
  onClose: () => void
  assignment: AssignmentRow | null
}

function AssignmentEditModal({ open, onClose, assignment }: EditModalProps) {
  const [form, setForm] = useState<EditForm>({ title: "", description: "", due_date: "", max_score: "" })

  const onOpen = () => {
    if (!assignment) return
    setForm({
      title: assignment.title,
      description: assignment.description ?? "",
      due_date: assignment.due_date?.slice(0, 16) ?? "",
      max_score: String(assignment.max_score),
    })
  }

  const submit = () => {
    if (!form.title.trim()) return
    toast("Assignment updated (mock)")
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit assignment" width={480}>
      <span ref={() => { if (open) onOpen() }} style={{ display: "none" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>Title</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ width: "100%", borderRadius: 12, border: "1px solid var(--color-border)", padding: 12, fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>Due date</label>
            <input
              type="datetime-local"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>Max score</label>
            <input
              type="number"
              value={form.max_score}
              onChange={e => setForm({ ...form, max_score: e.target.value })}
              style={{ width: 90, height: 44, padding: "0 12px", borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 14, outline: "none", textAlign: "center" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={submit}>Save changes</ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}

interface Props {
  assignments: AssignmentRow[]
  courses: Course[]
}

export function TeacherAssignmentsClient({ assignments, courses: _courses }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState<AssignmentRow | null>(null)

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle="All assignments across your courses."
        actions={
          <ButtonSmall variant="ghost" onClick={() => toast("Open the course editor to add an assignment", "warning")}>
            <PlusIcon size={16} /> New assignment
          </ButtonSmall>
        }
      />

      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-surface-2)", fontSize: 12, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <th style={{ textAlign: "left", padding: "12px 16px" }}>Title</th>
              <th style={{ textAlign: "left", padding: "12px 16px" }}>Course</th>
              <th style={{ textAlign: "left", padding: "12px 16px" }}>Due</th>
              <th style={{ textAlign: "right", padding: "12px 16px" }}>Status</th>
              <th style={{ width: 96 }} />
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => {
              const overdue = a.due_date ? new Date(a.due_date) < new Date() : false
              const allGraded = a.gradedCount === a.totalSubmissions
              return (
                <tr
                  key={a.id}
                  style={{ borderTop: "1px solid var(--color-border)", cursor: "pointer" }}
                  onClick={() => router.push(`/teacher/assignments/${a.id}`)}
                >
                  <td style={{ padding: "14px 16px", fontWeight: 500 }}>{a.title}</td>
                  <td style={{ padding: "14px 16px", color: "var(--color-fg-muted)", fontSize: 13 }}>{a.courseName}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>
                    <span style={{ color: overdue ? "var(--color-danger, #ef4444)" : "var(--color-fg-muted)" }}>
                      {date_(a.due_date ?? "")}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Badge tone={allGraded ? "green" : "yellow"}>
                      {a.gradedCount}/{a.totalSubmissions} graded
                    </Badge>
                  </td>
                  <td
                    style={{ padding: "10px 16px", textAlign: "right" }}
                    onClick={e => e.stopPropagation()}
                  >
                    <IconButton onClick={() => setEditing(a)} title="Edit">
                      <EditIcon size={16} />
                    </IconButton>
                    <IconButton
                      title="Delete"
                      onClick={() => toast("Delete not implemented in mock")}
                    >
                      <TrashIcon size={16} />
                    </IconButton>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {assignments.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", fontSize: 14, color: "var(--color-fg-muted)" }}>
            No assignments yet.
          </div>
        )}
      </Card>

      <AssignmentEditModal
        open={!!editing}
        onClose={() => setEditing(null)}
        assignment={editing}
      />
    </>
  )
}
