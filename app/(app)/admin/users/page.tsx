"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Card, PageHeader, Avatar, Badge, StatusBadge, EmptyState, Modal, IconButton, Tabs,
  toast,
} from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { Input } from "@/components/ui/input"
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from "@/components/ui/icons"

// ── Types ──────────────────────────────────────────────────────────────

interface AdminUser {
  id: number
  email: string
  fullName: string
  avatarUrl?: string | null
  isActive: boolean
  roles: string[]
}

interface RoleOption {
  name: string       // uppercase: "ADMIN", "TEACHER", "MODERATOR"
  label: string      // capitalized: "Admin", "Teacher", "Moderator"
  value: string      // lowercase: "admin", "teacher", "moderator"
}

function toUiUser(u: AdminUser) {
  return {
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    avatar_url: u.avatarUrl,
    is_active: u.isActive,
    // Store lowercase for filter matching; always falls back to "student"
    role: u.roles?.[0]?.toLowerCase() ?? "student",
    created_at: new Date().toISOString(),
  }
}

type UiUser = ReturnType<typeof toUiUser>

// ── Color helpers ──────────────────────────────────────────────────────

type BadgeTone = "purple" | "blue" | "green" | "orange" | "yellow" | "red" | "default"

const PREDEFINED_TONES: Record<string, BadgeTone> = {
  admin: "purple", teacher: "blue", student: "green",
}
const EXTRA_TONES: BadgeTone[] = ["orange", "yellow", "red", "default"]

function getRoleTone(roleLower: string, allRoles: RoleOption[]): BadgeTone {
  return PREDEFINED_TONES[roleLower]
    ?? EXTRA_TONES[allRoles.findIndex(r => r.value === roleLower) % EXTRA_TONES.length]
}

// ── Role select ────────────────────────────────────────────────────────

function RoleSelect({
  value,
  onChange,
  roles,
}: {
  value: string
  onChange: (v: string) => void
  roles: RoleOption[]
}) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8, color: "var(--color-fg-muted)" }}>
        Role
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", height: 38, padding: "0 10px", borderRadius: 8,
          border: "1px solid var(--color-border)", fontSize: 14,
          background: "var(--color-surface)", color: "var(--color-fg)",
          cursor: "pointer",
        }}
      >
        {roles.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── Modals ─────────────────────────────────────────────────────────────

function UserCreateModal({
  open,
  onClose,
  onCreated,
  roles,
}: {
  open: boolean
  onClose: () => void
  onCreated: (u: UiUser) => void
  roles: RoleOption[]
}) {
  const defaultRole = roles.find(r => r.value === "student")?.value ?? roles[0]?.value ?? "student"
  const [form, setForm] = useState({ full_name: "", email: "", role: defaultRole })
  const [saving, setSaving] = useState(false)

  // Reset default role if roles list loads after modal was already open
  useEffect(() => {
    if (roles.length > 0 && !roles.find(r => r.value === form.role)) {
      setForm(prev => ({ ...prev, role: defaultRole }))
    }
  }, [roles]) // eslint-disable-line react-hooks/exhaustive-deps

  const handle = (k: "full_name" | "email") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.full_name,
          email: form.email,
          role: form.role.toUpperCase(),
          password: "StudyBoost@2025",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create user")
      onCreated(toUiUser(data as AdminUser))
      toast(`Invited ${form.full_name}`, "success")
      setForm({ full_name: "", email: "", role: defaultRole })
      onClose()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create user", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite new user">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Full name" value={form.full_name} onChange={handle("full_name")} placeholder="Jane Doe" />
        <Input label="Email" type="email" value={form.email} onChange={handle("email")} placeholder="jane@studyboost.com" />
        <RoleSelect value={form.role} onChange={v => setForm(prev => ({ ...prev, role: v }))} roles={roles} />
        <p style={{ margin: 0, fontSize: 12, color: "var(--color-fg-muted)" }}>
          Default password: <code>StudyBoost@2025</code> — user should change it on first login.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={submit} disabled={saving}>{saving ? "Creating…" : "Create user"}</ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}

function UserEditModal({
  user,
  onClose,
  onSaved,
  adminCount,
  roles,
}: {
  user: UiUser | null
  onClose: () => void
  onSaved: (u: UiUser) => void
  adminCount: number
  roles: RoleOption[]
}) {
  const [form, setForm] = useState({ full_name: "", email: "", role: "student", is_active: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name, email: user.email, role: user.role, is_active: user.is_active })
    }
  }, [user?.id])

  const handle = (k: "full_name" | "email") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  // True khi user là admin duy nhất và đang bị đổi role hoặc deactivate
  const isLastAdminDemotion = user?.role === "admin" && adminCount <= 1 && form.role !== "admin"
  const isLastAdminDeactivation = user?.role === "admin" && adminCount <= 1 && !form.is_active

  const submit = async () => {
    if (!user) return
    if (!form.full_name.trim()) {
      toast("Full name is required", "error")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.full_name,
          isActive: form.is_active,
          role: form.role.toUpperCase(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to update user")
      onSaved(toUiUser(data as AdminUser))
      toast(`Updated ${form.full_name}`, "success")
      onClose()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update user", "error")
    } finally {
      setSaving(false)
    }
  }

  const warn = isLastAdminDemotion || isLastAdminDeactivation

  return (
    <Modal open={!!user} onClose={onClose} title="Edit user">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Full name" value={form.full_name} onChange={handle("full_name")} />
        <Input label="Email" type="email" value={form.email} onChange={handle("email")} disabled />
        <RoleSelect value={form.role} onChange={v => setForm(prev => ({ ...prev, role: v }))} roles={roles} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
          />
          Account is active
        </label>

        {warn && (
          <div style={{
            padding: "8px 12px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 8,
            fontSize: 12,
            color: "#dc2626",
            lineHeight: 1.5,
          }}>
            <strong>Warning:</strong> This is the only admin account.{" "}
            {isLastAdminDemotion
              ? "Changing their role will remove all admin access from the system."
              : "Deactivating this account will lock out all admins."}
            {" "}The server will reject this operation — promote another user to admin first.
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={submit} disabled={saving || warn}>
            {saving ? "Saving…" : "Save changes"}
          </ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UiUser[]>([])
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [q, setQ] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<UiUser | null>(null)

  const loadAll = useCallback(async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin/users?size=100"),
        fetch("/api/admin/roles"),
      ])
      const usersData = await usersRes.json()
      const rolesData: { name: string }[] = rolesRes.ok ? await rolesRes.json() : []

      if (!usersRes.ok) throw new Error(usersData.error)
      setUsers((usersData.users as AdminUser[]).map(toUiUser))
      setAvailableRoles(
        rolesData.map(r => ({
          name: r.name,
          label: r.name.charAt(0) + r.name.slice(1).toLowerCase(),
          value: r.name.toLowerCase(),
        }))
      )
    } catch {
      toast("Failed to load users", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  // ID của admin đang đăng nhập — dùng để guard self-edit
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => { if (data?.id) setCurrentUserId(data.id) })
      .catch(() => {})
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const adminCount = useMemo(
    () => users.filter(u => u.role === "admin").length,
    [users],
  )

  const roleTabs = useMemo(() => [
    { label: "All", value: "all" },
    ...availableRoles.map(r => ({ label: r.label, value: r.value })),
  ], [availableRoles])

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchQ =
        !q ||
        u.full_name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase())
      const matchRole = roleFilter === "all" || u.role === roleFilter
      return matchQ && matchRole
    })
  }, [users, q, roleFilter])

  const toggleActive = async (u: UiUser) => {
    // Guard: prevent deactivating the last admin on the frontend
    if (u.role === "admin" && u.is_active && adminCount <= 1) {
      toast("Cannot deactivate the last admin. Promote another user to admin first.", "error")
      return
    }
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !u.is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to update user")
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !u.is_active } : x))
      toast(`${u.full_name} ${u.is_active ? "deactivated" : "activated"}`, u.is_active ? "error" : "success")
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update user", "error")
    }
  }

  const remove = async (u: UiUser) => {
    // Guard: prevent removing the last admin on the frontend
    if (u.role === "admin" && adminCount <= 1) {
      toast("Cannot deactivate the last admin. Promote another user to admin first.", "error")
      return
    }
    if (!confirm(`Deactivate ${u.full_name}? This will disable their account.`)) return
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to deactivate user")
      setUsers(prev => prev.filter(x => x.id !== u.id))
      toast(`${u.full_name} deactivated`, "error")
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to deactivate user", "error")
    }
  }

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Create accounts, assign roles, and toggle access."
        actions={
          <ButtonSmall onClick={() => setCreateOpen(true)}>
            <PlusIcon size={14} />
            New user
          </ButtonSmall>
        }
      />

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1, maxWidth: 320 }}>
            <Input
              icon={<SearchIcon size={16} color="var(--color-fg-muted)" />}
              placeholder="Search users…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <Tabs tabs={roleTabs} value={roleFilter} onChange={setRoleFilter} />
        </div>

        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-fg-muted)", fontSize: 14 }}>
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48 }}>
            <EmptyState
              title="No users found"
              description={q ? `No results for "${q}"` : "Try adjusting the filters."}
            />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["User", "Role", "Status", "Joined", "Actions"].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 20px",
                      textAlign: h === "Actions" ? "right" : "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-fg-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none",
                    background: "transparent",
                    transition: "background .1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={u.full_name} size="md" src={u.avatar_url ?? undefined} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.full_name}</div>
                        <div style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <Badge tone={getRoleTone(u.role, availableRoles)}>{u.role}</Badge>
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <StatusBadge status={u.is_active ? "active" : "inactive"} />
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--color-fg-muted)" }}>
                    {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {u.id === currentUserId ? (
                        // Không cho sửa/xóa account của chính mình
                        <span style={{ fontSize: 12, color: "var(--color-fg-muted)", fontStyle: "italic" }}>
                          (you)
                        </span>
                      ) : (
                        <>
                          <IconButton title="Edit user" onClick={() => setEditing(u)}>
                            <EditIcon size={15} />
                          </IconButton>
                          <ButtonSmall
                            variant={u.is_active ? "ghost" : "primary"}
                            onClick={() => toggleActive(u)}
                            style={{ height: 32, padding: "0 12px", fontSize: 12 }}
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </ButtonSmall>
                          <IconButton title="Deactivate user" onClick={() => remove(u)} style={{ color: "#dc2626" }}>
                            <TrashIcon size={15} />
                          </IconButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <UserCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={u => setUsers(prev => [u, ...prev])}
        roles={availableRoles}
      />
      <UserEditModal
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={updated => setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))}
        adminCount={adminCount}
        roles={availableRoles}
      />
    </>
  )
}
