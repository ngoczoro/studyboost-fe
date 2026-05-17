"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BrandMark } from "@/components/brand/brand-mark"
import {
  HomeIcon, UsersIcon, BookIcon, ShieldIcon, MegaphoneIcon,
  ClipboardCheckIcon, CalendarIcon, CommentIcon, BellIcon, LogoutIcon,
} from "@/components/ui/icons"

type Role = "admin" | "teacher" | "student"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard",  href: "/admin/dashboard",    icon: <HomeIcon size={18} /> },
    { label: "Users",      href: "/admin/users",        icon: <UsersIcon size={18} /> },
    { label: "Courses",    href: "/admin/courses",      icon: <BookIcon size={18} /> },
    { label: "Roles",      href: "/admin/roles",        icon: <ShieldIcon size={18} /> },
    { label: "Broadcasts", href: "/admin/broadcasts",   icon: <MegaphoneIcon size={18} /> },
  ],
  teacher: [
    { label: "Dashboard",    href: "/teacher/dashboard",   icon: <HomeIcon size={18} /> },
    { label: "My Courses",   href: "/teacher/courses",     icon: <BookIcon size={18} /> },
    { label: "Assignments",  href: "/teacher/assignments", icon: <ClipboardCheckIcon size={18} /> },
    { label: "Students",     href: "/teacher/students",    icon: <UsersIcon size={18} /> },
    { label: "Discussion",   href: "/teacher/posts",       icon: <CommentIcon size={18} /> },
  ],
  student: [
    { label: "Dashboard",   href: "/student/dashboard",   icon: <HomeIcon size={18} /> },
    { label: "My Courses",  href: "/student/courses",     icon: <BookIcon size={18} /> },
    { label: "Assignments", href: "/student/assignments", icon: <ClipboardCheckIcon size={18} /> },
    { label: "Calendar",    href: "/student/calendar",    icon: <CalendarIcon size={18} /> },
    { label: "Discussion",  href: "/student/posts",       icon: <CommentIcon size={18} /> },
  ],
}

interface SidebarProps {
  role: Role
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const items = NAV_ITEMS[role]

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <nav className="app-shell__sidebar" style={{ padding: "20px 12px" }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 28 }}>
        <BrandMark size={36} />
        <span style={{ fontWeight: 700, fontSize: 16, color: "var(--color-fg)" }}>StudyBoost</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {items.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                background: active ? "var(--color-primary-50)" : "transparent",
                color: active ? "var(--color-primary-700)" : "var(--color-fg-muted)",
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                textDecoration: "none",
                transition: "background .15s, color .15s",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Bottom: notifications + sign out */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
        <Link
          href={`/${role}/notifications`}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            color: pathname.includes("/notifications") ? "var(--color-primary-700)" : "var(--color-fg-muted)",
            background: pathname.includes("/notifications") ? "var(--color-primary-50)" : "transparent",
            fontWeight: 500, fontSize: 14, textDecoration: "none",
          }}
        >
          <BellIcon size={18} />
          Notifications
        </Link>
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-fg-muted)",
            background: "transparent",
            border: "none",
            fontWeight: 500, fontSize: 14,
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
          }}
        >
          <LogoutIcon size={18} />
          Sign out
        </button>
      </div>
    </nav>
  )
}
