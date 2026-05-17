"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader, Card, Badge, Avatar, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { relative } from "@/lib/fmt"

interface Grade {
  id: number
  score: number
  feedback: string
  graded_at: string
}

interface SubmissionRow {
  id: number
  assignment_id: number
  student_id: number
  content: string
  submitted_at: string
  is_late: boolean
  student?: { id: number; full_name: string; email: string }
  grade?: Grade
}

interface Assignment {
  id: number
  title: string
  description: string
  course_id: number
  max_score: number
  due_date: string
}

interface Props {
  assignment: Assignment
  courseName: string
  submissions: SubmissionRow[]
}

function GradePanel({ submission, onGraded }: { submission: SubmissionRow; onGraded: (sub: SubmissionRow, score: number, feedback: string) => void }) {
  const [score, setScore] = useState(submission.grade?.score?.toString() ?? "")
  const [feedback, setFeedback] = useState(submission.grade?.feedback ?? "")

  const submit = () => {
    if (score === "") return
    onGraded(submission, Number(score), feedback)
    toast("Grade saved")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Avatar name={submission.student?.full_name ?? "?"} size="md" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{submission.student?.full_name}</div>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
              Submitted {relative(submission.submitted_at)}{submission.is_late ? " · Late" : ""}
            </div>
          </div>
          {submission.is_late && <Badge tone="yellow">Late</Badge>}
        </div>

        <div style={{ padding: 12, borderRadius: 10, background: "var(--color-surface-2)", fontSize: 13, color: "var(--color-fg)", lineHeight: 1.5 }}>
          {submission.content}
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Grade</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>Score</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number" min={0} max={100}
              value={score}
              onChange={e => setScore(e.target.value)}
              style={{ width: 90, height: 44, padding: "0 12px", borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 16, fontWeight: 600, textAlign: "center", outline: "none" }}
            />
            <span style={{ color: "var(--color-fg-muted)", fontWeight: 600 }}>/ 100</span>
          </div>
        </div>
        <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>Feedback</label>
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={5}
          placeholder="What did the student do well? What could be stronger?"
          style={{ width: "100%", borderRadius: 12, border: "1px solid var(--color-border)", padding: 12, fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }}
        />
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <ButtonSmall onClick={submit}>{submission.grade ? "Update grade" : "Save grade"}</ButtonSmall>
        </div>
      </Card>
    </div>
  )
}

export function SubmissionsClient({ assignment, courseName, submissions: initialSubs }: Props) {
  const [subs, setSubs] = useState(initialSubs)
  const [selectedId, setSelectedId] = useState(initialSubs[0]?.id ?? null)

  const selected = subs.find(s => s.id === selectedId) ?? null

  const handleGraded = (sub: SubmissionRow, score: number, feedback: string) => {
    setSubs(prev => prev.map(s =>
      s.id === sub.id
        ? { ...s, grade: { id: 0, score, feedback, graded_at: new Date().toISOString() } }
        : s
    ))
  }

  return (
    <>
      <PageHeader
        title={assignment.title}
        subtitle={assignment.description}
        actions={
          <Link href="/teacher/assignments" style={{ textDecoration: "none" }}>
            <ButtonSmall variant="ghost">← {courseName}</ButtonSmall>
          </Link>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", fontWeight: 600, fontSize: 14 }}>
            Submissions ({subs.length})
          </div>
          {subs.length === 0 ? (
            <div style={{ padding: 24, fontSize: 13, color: "var(--color-fg-muted)" }}>No submissions yet.</div>
          ) : (
            subs.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                  border: "none", borderTop: "1px solid var(--color-border)",
                  background: s.id === selectedId ? "var(--color-primary-50)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <Avatar name={s.student?.full_name ?? "?"} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.student?.full_name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>{relative(s.submitted_at)}</div>
                </div>
                {s.grade
                  ? <Badge tone="green">{s.grade.score}</Badge>
                  : s.is_late
                    ? <Badge tone="yellow">Late</Badge>
                    : <Badge tone="default">Open</Badge>}
              </button>
            ))
          )}
        </Card>

        {selected && (
          <GradePanel submission={selected} onGraded={handleGraded} />
        )}
      </div>
    </>
  )
}
