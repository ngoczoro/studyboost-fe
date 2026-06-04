"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, PageHeader, EmptyState } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { BellIcon } from "@/components/ui/icons"
import { relative } from "@/lib/fmt"
import type { Notification } from "@/lib/types"

interface Props {
  initialItems: Notification[]
}

const TYPE_LABEL: Record<string, string> = {
  GRADE_RELEASED: "Grade released",
  NEW_POST: "New discussion post",
  NEW_ASSIGNMENT: "New assignment",
  ENROLLMENT_UPDATED: "Enrollment update",
  SUBMISSION_RECEIVED: "Submission received",
  NEW_COMMENT: "New comment",
  SYSTEM_ALERT: "System alert",
}

const TYPE_COLOR: Record<string, string> = {
  GRADE_RELEASED: "#22c55e",
  NEW_ASSIGNMENT: "#3b82f6",
  SUBMISSION_RECEIVED: "#f59e0b",
  NEW_POST: "#8b5cf6",
  NEW_COMMENT: "#06b6d4",
  ENROLLMENT_UPDATED: "#ec4899",
  SYSTEM_ALERT: "#ef4444",
}

export function NotificationsFeed({ initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<Notification[]>(initialItems)
  const [deleting, setDeleting] = useState<Set<number>>(new Set())

  const markRead = async (id: number) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await fetch(`/api/notifications/${id}/mark-read`, { method: "POST" }).catch(() => {})
  }

  const markAllRead = async () => {
    setItems(prev => prev.map(n => ({ ...n, is_read: true })))
    await fetch("/api/notifications/mark-all", { method: "POST" }).catch(() => {})
  }

  const deleteNotif = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(prev => new Set(prev).add(id))
    const ok = await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      .then(r => r.ok)
      .catch(() => false)
    if (ok) {
      setItems(prev => prev.filter(n => n.id !== id))
    }
    setDeleting(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  const handleClick = async (n: Notification) => {
    if (!n.is_read) await markRead(n.id)
    if (n.link) router.push(n.link)
  }

  const unreadCount = items.filter(n => !n.is_read).length

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Everything that happened across your account."
        actions={
          unreadCount > 0 ? (
            <ButtonSmall variant="ghost" onClick={markAllRead}>
              Mark all read
            </ButtonSmall>
          ) : null
        }
      />

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {items.length === 0 ? (
          <div style={{ padding: 48 }}>
            <EmptyState
              icon={<BellIcon size={24} />}
              title="No notifications"
              description="When something happens, it'll show up here."
            />
          </div>
        ) : (
          <div>
            {items.map((n, i) => {
              const dotColor = TYPE_COLOR[n.type] ?? "var(--color-primary-600)"
              return (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                    background: n.is_read ? "transparent" : "var(--color-primary-50,#f0fdf4)",
                    transition: "background .1s",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    style={{
                      flex: 1,
                      textAlign: "left",
                      padding: "14px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      border: "none",
                      background: "transparent",
                      cursor: n.link ? "pointer" : "default",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: n.is_read ? "transparent" : dotColor,
                        flexShrink: 0,
                        border: n.is_read ? "1.5px solid var(--color-border)" : "none",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 2 }}>
                        {TYPE_LABEL[n.type] ?? n.type}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: "var(--color-fg-muted)", marginTop: 3 }}>
                        {relative(n.created_at)}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={e => deleteNotif(n.id, e)}
                    disabled={deleting.has(n.id)}
                    title="Delete"
                    style={{
                      flexShrink: 0,
                      marginRight: 16,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: "1px solid var(--color-border)",
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-fg-muted)",
                      fontSize: 16,
                      opacity: deleting.has(n.id) ? 0.4 : 1,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-danger-50,#fef2f2)"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--color-fg-muted)" }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </>
  )
}
