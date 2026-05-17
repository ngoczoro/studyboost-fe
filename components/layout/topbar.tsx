"use client"

import { useState, useRef, useEffect } from "react"
import { SearchIcon, BellIcon, CheckIcon } from "@/components/ui/icons"
import { Avatar } from "@/components/ui/primitives"
import { relative } from "@/lib/fmt"
import type { Notification } from "@/lib/types"

interface TopbarProps {
  user: { id: number; full_name: string; role: string }
  notifications: Notification[]
}

export function Topbar({ user, notifications }: TopbarProps) {
  const [bellOpen, setBellOpen] = useState(false)
  const [localNotifs, setLocalNotifs] = useState(notifications)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setLocalNotifs(notifications) }, [notifications])

  useEffect(() => {
    if (!bellOpen) return
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [bellOpen])

  const unread = localNotifs.filter(n => !n.is_read).length

  async function markAll() {
    await fetch(`/api/notifications/mark-all`, { method: "POST", body: JSON.stringify({ userId: user.id }) })
    setLocalNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function markOne(id: number) {
    await fetch(`/api/notifications/${id}/mark-read`, { method: "POST" })
    setLocalNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  return (
    <header className="app-shell__topbar">
      {/* Search */}
      <div style={{ flex: 1, position: "relative", maxWidth: 400 }}>
        <SearchIcon size={16} color="var(--color-fg-muted)"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" } as React.CSSProperties}
        />
        <input
          placeholder="Search…"
          style={{
            width: "100%", height: 38,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            paddingLeft: 36, paddingRight: 12,
            fontSize: 14, background: "var(--color-bg)",
            outline: "none", color: "var(--color-fg)",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
        {/* Notification bell */}
        <div ref={bellRef} style={{ position: "relative" }}>
          <button
            onClick={() => setBellOpen(v => !v)}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              border: "1px solid var(--color-border)",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-fg-muted)", position: "relative",
            }}
          >
            <BellIcon size={18} />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                width: 8, height: 8, borderRadius: "50%",
                background: "#ef4444",
              }} />
            )}
          </button>

          {bellOpen && (
            <div className="animate-sb-fade-in" style={{
              position: "absolute", right: 0, top: 46,
              width: 340,
              background: "var(--color-surface)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-dropdown)",
              border: "1px solid var(--color-border)",
              zIndex: 100,
              overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--color-border)",
              }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                {unread > 0 && (
                  <button onClick={markAll} style={{
                    fontSize: 12, color: "var(--color-primary-600)",
                    background: "none", border: "none", cursor: "pointer", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <CheckIcon size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {localNotifs.length === 0 ? (
                  <p style={{ padding: 16, color: "var(--color-fg-muted)", fontSize: 14, margin: 0 }}>No notifications</p>
                ) : (
                  localNotifs.slice(0, 6).map(n => (
                    <div
                      key={n.id}
                      onClick={() => markOne(n.id)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--color-border)",
                        background: n.is_read ? "transparent" : "var(--color-primary-50)",
                        cursor: "pointer",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 13, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--color-fg-muted)" }}>{relative(n.created_at)}</p>
                    </div>
                  ))
                )}
              </div>
              <div style={{ borderTop: "1px solid var(--color-border)", padding: "10px 16px" }}>
                <a
                  href={`/${user.role}/notifications`}
                  onClick={() => setBellOpen(false)}
                  style={{
                    display: "block", textAlign: "center", fontSize: 13,
                    color: "var(--color-primary-600)", fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  View all notifications
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Avatar pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={user.full_name} size="sm" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{user.full_name}</span>
        </div>
      </div>
    </header>
  )
}
