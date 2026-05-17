"use client"

import { useState } from "react"
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
  ENROLLMENT_APPROVED: "Enrollment update",
}

export function NotificationsFeed({ initialItems }: Props) {
  const [items, setItems] = useState<Notification[]>(initialItems)

  const markRead = (id: number) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, is_read: true })))
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
            {items.map((n, i) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markRead(n.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "none",
                  borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                  background: n.is_read ? "transparent" : "var(--color-primary-50,#f0fdf4)",
                  cursor: "pointer",
                  transition: "background .1s",
                }}
                onMouseEnter={e => { if (n.is_read) e.currentTarget.style.background = "var(--color-surface-2)" }}
                onMouseLeave={e => { if (n.is_read) e.currentTarget.style.background = "transparent" }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: n.is_read ? "transparent" : "var(--color-primary-600,#16a34a)",
                    flexShrink: 0,
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
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
