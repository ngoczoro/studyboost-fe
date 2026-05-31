"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, BellIcon, CheckIcon } from "@/components/ui/icons"
import { Avatar } from "@/components/ui/primitives"
import { relative } from "@/lib/fmt"
import { useNotificationStream } from "@/lib/hooks/useNotificationStream"

interface BackendNotif {
  id: number
  type: string
  data?: string | null
  isRead: boolean
  createdAt?: string | null
}

function parseMessage(n: BackendNotif): string {
  try {
    const p = JSON.parse(n.data ?? "") as { message?: string }
    return p.message ?? n.data ?? ""
  } catch {
    return n.data ?? ""
  }
}

function parseLink(n: BackendNotif): string | null {
  try {
    const p = JSON.parse(n.data ?? "") as { link?: string }
    return p.link || null
  } catch {
    return null
  }
}

const TYPE_ICON: Record<string, string> = {
  GRADE_RELEASED: "📊",
  NEW_ASSIGNMENT: "📝",
  SUBMISSION_RECEIVED: "📥",
  NEW_POST: "💬",
  NEW_COMMENT: "🗨️",
  ENROLLMENT_UPDATED: "🎓",
  SYSTEM_ALERT: "🔔",
}

interface TopbarProps {
  user: { id: number; full_name: string; role: string }
  unreadCount: number
}

export function Topbar({ user, unreadCount: initialUnread }: TopbarProps) {
  const router = useRouter()
  const [bellOpen, setBellOpen] = useState(false)
  const [notifs, setNotifs] = useState<BackendNotif[]>([])
  const [loaded, setLoaded] = useState(false)
  const [unread, setUnread] = useState(initialUnread)
  const bellRef = useRef<HTMLDivElement>(null)

  // Real-time notifications via SSE
  useNotificationStream((n) => {
    setUnread(prev => prev + 1)
    if (loaded) setNotifs(prev => [n, ...prev])
  })

  const loadNotifs = useCallback(() => {
    fetch("/api/notifications")
      .then(r => r.ok ? r.json() as Promise<BackendNotif[]> : Promise.resolve([]))
      .then(data => { setNotifs(data); setLoaded(true); const u = data.filter(n => !n.isRead).length; setUnread(u) })
      .catch(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (!bellOpen || loaded) return
    loadNotifs()
  }, [bellOpen, loaded, loadNotifs])

  useEffect(() => {
    if (!bellOpen) return
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [bellOpen])

  async function markAll() {
    await fetch("/api/notifications/mark-all", { method: "POST" })
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  async function markOne(id: number) {
    await fetch(`/api/notifications/${id}/mark-read`, { method: "POST" })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  async function handleNotifClick(n: BackendNotif) {
    if (!n.isRead) await markOne(n.id)
    const link = parseLink(n)
    if (link) {
      setBellOpen(false)
      router.push(link)
    }
  }

  return (
    <header className="app-shell__topbar">
      {/* Search */}
      <div style={{ flex: 1, position: "relative", maxWidth: 400 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
          <SearchIcon size={16} color="var(--color-fg-muted)" />
        </span>
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
                position: "absolute",
                top: unread > 9 ? 2 : 4,
                right: unread > 9 ? 2 : 4,
                minWidth: unread > 9 ? 18 : 16,
                height: unread > 9 ? 18 : 16,
                borderRadius: 999,
                background: "#ef4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
                lineHeight: 1,
              }}>
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="animate-sb-fade-in" style={{
              position: "absolute", right: 0, top: 46,
              width: 360,
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                  {unread > 0 && (
                    <span style={{
                      background: "#ef4444", color: "#fff",
                      fontSize: 11, fontWeight: 700,
                      borderRadius: 999, padding: "1px 6px",
                    }}>{unread}</span>
                  )}
                </div>
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

              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {!loaded ? (
                  <p style={{ padding: 16, color: "var(--color-fg-muted)", fontSize: 14, margin: 0 }}>Loading…</p>
                ) : notifs.length === 0 ? (
                  <p style={{ padding: 16, color: "var(--color-fg-muted)", fontSize: 14, margin: 0 }}>No notifications yet</p>
                ) : (
                  notifs.slice(0, 8).map(n => {
                    const link = parseLink(n)
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid var(--color-border)",
                          background: n.isRead ? "transparent" : "var(--color-primary-50,#f0fdf4)",
                          cursor: link || !n.isRead ? "pointer" : "default",
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = n.isRead ? "var(--color-surface-2)" : "var(--color-primary-100,#dcfce7)" }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.isRead ? "transparent" : "var(--color-primary-50,#f0fdf4)" }}
                      >
                        <span style={{ fontSize: 16, lineHeight: 1.2, flexShrink: 0, marginTop: 2 }}>
                          {TYPE_ICON[n.type] ?? "🔔"}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: n.isRead ? 400 : 600, wordBreak: "break-word" }}>
                            {parseMessage(n)}
                          </p>
                          <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--color-fg-muted)" }}>
                            {relative(n.createdAt ?? new Date().toISOString())}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div style={{
                            width: 7, height: 7, borderRadius: 999,
                            background: "#ef4444", flexShrink: 0, marginTop: 5,
                          }} />
                        )}
                      </div>
                    )
                  })
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
