"use client"

import {
  ReactNode, useEffect, useRef, useState,
  createContext, useContext, useCallback,
} from "react"
import { initials as fmtInitials } from "@/lib/fmt"
import { XIcon } from "./icons"

/* ── Card ───────────────────────────────────────── */
export function Card({ children, style, className }: { children: ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ── Badge ──────────────────────────────────────── */
type BadgeTone = "default" | "blue" | "green" | "yellow" | "red" | "purple" | "orange"

const BADGE_STYLES: Record<BadgeTone, React.CSSProperties> = {
  default: { background: "#f3f4f6", color: "#374151" },
  blue:    { background: "#eff6ff", color: "#1d4ed8" },
  green:   { background: "#f0fdf4", color: "#15803d" },
  yellow:  { background: "#fefce8", color: "#a16207" },
  red:     { background: "#fee2e2", color: "#dc2626" },
  purple:  { background: "#f5f3ff", color: "#7c3aed" },
  orange:  { background: "#fff7ed", color: "#c2410c" },
}

export function Badge({ tone = "default", children, style }: { tone?: BadgeTone; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 500,
      ...BADGE_STYLES[tone],
      ...style,
    }}>
      {children}
    </span>
  )
}

/* ── StatusBadge ────────────────────────────────── */
const STATUS_TONE: Record<string, BadgeTone> = {
  PUBLISHED: "green", published: "green",
  DRAFT: "default", draft: "default",
  ARCHIVED: "orange", archived: "orange",
  ACTIVE: "blue", active: "blue",
  DROPPED: "red", dropped: "red",
  COMPLETED: "green", completed: "green",
  PENDING: "yellow", pending: "yellow",
  OPEN: "blue", open: "blue",
  GRADED: "green", graded: "green",
  SUBMITTED: "purple", submitted: "purple",
  OVERDUE: "red", overdue: "red",
  REJECTED: "red", rejected: "red",
}

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "default"
  return <Badge tone={tone}>{status}</Badge>
}

/* ── Avatar ─────────────────────────────────────── */
const AVATAR_COLORS = [
  "#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#f97316","#6366f1",
]

function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

const AVATAR_SIZES = { sm: 28, md: 36, lg: 48 }

export function Avatar({ name, size = "md", src }: { name: string; size?: "sm" | "md" | "lg"; src?: string }) {
  const px = AVATAR_SIZES[size]
  if (src) return <img src={src} alt={name} style={{ width: px, height: px, borderRadius: "50%", objectFit: "cover" }} />
  return (
    <div style={{
      width: px, height: px, borderRadius: "50%",
      background: avatarColor(name),
      color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: px * 0.38, fontWeight: 600,
      flexShrink: 0,
    }}>
      {fmtInitials(name)}
    </div>
  )
}

/* ── IconButton ─────────────────────────────────── */
export function IconButton({ children, onClick, title, style }: { children: ReactNode; onClick?: () => void; title?: string; style?: React.CSSProperties }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 34, height: 34,
        borderRadius: "50%",
        border: "1px solid var(--color-border)",
        background: "transparent",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--color-fg-muted)",
        transition: "background .15s",
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/* ── Tabs ───────────────────────────────────────── */
interface Tab { label: string; value: string }

export function Tabs({ tabs, value, onChange }: { tabs: Tab[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", gap: 0 }}>
      {tabs.map(t => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${active ? "var(--color-primary-600)" : "transparent"}`,
              color: active ? "var(--color-primary-700)" : "var(--color-fg-muted)",
              fontWeight: active ? 600 : 500,
              fontSize: 14,
              cursor: "pointer",
              transition: "all .15s",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── EmptyState ─────────────────────────────────── */
export function EmptyState({
  icon, title, description, action,
}: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--color-fg-muted)" }}>
      {icon && <div style={{ marginBottom: 12, opacity: .4 }}>{icon}</div>}
      <p style={{ fontWeight: 600, fontSize: 16, color: "var(--color-fg)", margin: "0 0 6px" }}>{title}</p>
      {description && <p style={{ fontSize: 14, margin: "0 0 16px" }}>{description}</p>}
      {action}
    </div>
  )
}

/* ── StatCard ───────────────────────────────────── */
export function StatCard({
  icon, label, value, trend, delta, tone,
}: { icon?: ReactNode; label: string; value: string | number; trend?: string; delta?: number; tone?: string }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon && (
          <div style={{
            width: 44, height: 44, borderRadius: "var(--radius-sm)",
            background: "var(--color-primary-50)",
            color: "var(--color-primary-600)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-fg-muted)" }}>{label}</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--color-fg)" }}>{value}</p>
          {trend && <p style={{ margin: 0, fontSize: 12, color: "var(--color-fg-muted)" }}>{trend}</p>}
        </div>
      </div>
    </Card>
  )
}

/* ── Modal ──────────────────────────────────────── */
export function Modal({
  open, onClose, title, children, width = 520,
}: { open: boolean; onClose: () => void; title?: string; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="animate-sb-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.4)",
        backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 16,
      }}
    >
      <div
        className="animate-sb-pop-in"
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
          width: "100%", maxWidth: width,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {title && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px 0",
          }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--color-fg-muted)", padding: 4,
              }}
            >
              <XIcon size={18} />
            </button>
          </div>
        )}
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

/* ── Toast ──────────────────────────────────────── */
type ToastType = "success" | "error" | "info" | "warning"

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const ToastContext = createContext<(msg: string, type?: ToastType) => void>(() => {})

let _toastFn: (msg: string, type?: ToastType) => void = () => {}

export function ToastHost({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const add = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current
    setToasts(prev => [...prev.slice(-3), { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  useEffect(() => { _toastFn = add }, [add])

  const TOAST_COLORS: Record<ToastType, string> = {
    success: "#15803d",
    error: "#dc2626",
    info: "#1d4ed8",
    warning: "#a16207",
  }

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24,
        display: "flex", flexDirection: "column", gap: 8,
        zIndex: 99999,
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="animate-sb-pop-in"
            style={{
              background: TOAST_COLORS[t.type],
              color: "#fff",
              padding: "12px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              fontWeight: 500,
              boxShadow: "var(--shadow-modal)",
              maxWidth: 360,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

export function toast(message: string, type: ToastType = "info") {
  _toastFn(message, type)
}

/* ── PageHeader ─────────────────────────────────── */
export function PageHeader({
  title, subtitle, description, actions,
}: { title: string; subtitle?: string; description?: string; actions?: ReactNode }) {
  const sub = subtitle ?? description
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      marginBottom: 24, gap: 16,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{title}</h1>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-fg-muted)" }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  )
}
