"use client"

import { useState } from "react"
import { notifications } from "@/lib/mock-data"
import { Card, PageHeader, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { Input } from "@/components/ui/input"
import { relative } from "@/lib/fmt"

const BROADCAST_TYPES = [
  { value: "course_published", label: "Course published" },
  { value: "announcement",     label: "Announcement" },
  { value: "maintenance",      label: "Maintenance notice" },
]

interface BroadcastForm {
  type: string
  title: string
  course: string
  message: string
}

const EMPTY_FORM: BroadcastForm = { type: "announcement", title: "", course: "", message: "" }

export default function AdminBroadcastsPage() {
  const [form, setForm] = useState<BroadcastForm>(EMPTY_FORM)
  const [sending, setSending] = useState(false)

  const handle = (k: keyof BroadcastForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const send = async () => {
    if (sending || !form.title.trim()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 600))
    setSending(false)
    toast("Notification sent to all users", "success")
    setForm(EMPTY_FORM)
  }

  const recent = notifications.slice(0, 6)

  return (
    <>
      <PageHeader
        title="Broadcasts"
        subtitle="Send platform-wide notifications to all users."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Compose */}
        <Card>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Compose notification</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{
                fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6,
                color: "var(--color-fg-muted)",
              }}>
                Type
              </label>
              <select
                value={form.type}
                onChange={handle("type")}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-fg)",
                  fontSize: 14,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {BROADCAST_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Title"
              value={form.title}
              onChange={handle("title")}
              placeholder="Notification title…"
            />

            <Input
              label="Course (optional)"
              value={form.course}
              onChange={handle("course")}
              placeholder="Course name or ID…"
            />

            <div>
              <label style={{
                fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6,
                color: "var(--color-fg-muted)",
              }}>
                Message
              </label>
              <textarea
                value={form.message}
                onChange={handle("message")}
                placeholder="Write your message…"
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-fg)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ButtonSmall
                onClick={send}
                loading={sending}
                style={{ opacity: !form.title.trim() ? 0.5 : 1, pointerEvents: !form.title.trim() ? "none" : undefined }}
              >
                Send to all users
              </ButtonSmall>
            </div>
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Recent activity</h2>
          {recent.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--color-fg-muted)" }}>No recent notifications.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recent.map((n, i) => (
                <div
                  key={n.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: i < recent.length - 1 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                    {n.type.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.45, marginBottom: 4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>{relative(n.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
