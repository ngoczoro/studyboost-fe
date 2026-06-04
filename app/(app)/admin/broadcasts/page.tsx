"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, PageHeader, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { Input } from "@/components/ui/input"
import { relative } from "@/lib/fmt"

const BROADCAST_TYPES = [
  { value: "announcement", label: "Announcement" },
  { value: "course_published", label: "Course published" },
  { value: "maintenance", label: "Maintenance notice" },
]

interface BroadcastForm {
  type: string
  title: string
  course: string
  message: string
}

interface HistoryItem {
  id: number
  data: string
  createdAt: string
}

const EMPTY_FORM: BroadcastForm = { type: "announcement", title: "", course: "", message: "" }

function parseBroadcastMessage(data: string): string {
  try {
    const parsed = JSON.parse(data)
    return parsed?.message ?? data
  } catch {
    return data
  }
}

export default function AdminBroadcastsPage() {
  const [form, setForm] = useState<BroadcastForm>(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch("/api/admin/notifications/broadcasts")
      if (res.ok) {
        const data: HistoryItem[] = await res.json()
        setHistory(data)
      }
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handle = (k: keyof BroadcastForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const send = async () => {
    if (sending || !form.title.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to send" }))
        toast(err.error ?? "Failed to send broadcast", "error")
        return
      }
      toast("Notification sent to all users", "success")
      setForm(EMPTY_FORM)
      await loadHistory()
    } finally {
      setSending(false)
    }
  }

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
                Message (optional)
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

        {/* Broadcast history */}
        <Card>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Recent broadcasts</h2>
          {loadingHistory ? (
            <p style={{ fontSize: 14, color: "var(--color-fg-muted)" }}>Loading…</p>
          ) : history.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--color-fg-muted)" }}>
              No broadcasts sent yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-raised, var(--color-surface))",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-fg)" }}>
                    {parseBroadcastMessage(item.data)}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-fg-muted)" }}>
                    {relative(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
