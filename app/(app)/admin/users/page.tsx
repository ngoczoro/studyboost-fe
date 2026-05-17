"use client"

import { useState, useMemo, useEffect } from "react"
import { users as initialUsers } from "@/lib/mock-data"
import {
  Card, PageHeader, Avatar, Badge, StatusBadge, EmptyState, Modal, IconButton, Tabs,
  toast,
} from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { Input } from "@/components/ui/input"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from "@/components/ui/icons"
import type { User, Role } from "@/lib/types"

const ROLE_TONE: Record<string, "purple" | "blue" | "green"> = {
  admin: "purple",
  teacher: "blue",
  student: "green",
}

const ROLE_TABS = [
  { label: "All", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Teacher", value: "teacher" },
  { label: "Student", value: "student" },
]

function UserCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (u: User) => void
}) {
  const [form, setForm] = useState({ full_name: "", email: "", role: "student" as Role })

  const handle = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = () => {
    if (!form.full_name.trim() || !form.email.trim()) return
    const newUser: User = {
      id: Date.now(),
      ...form,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    onCreated(newUser)
    toast(`Invited ${form.full_name}`, "success")
    setForm({ full_name: "", email: "", role: "student" })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite new user">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input
          label="Full name"
          value={form.full_name}
          onChange={handle("full_name")}
          placeholder="Jane Doe"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={handle("email")}
          placeholder="jane@studyboost.com"
        />
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8, color: "var(--color-fg-muted)" }}>
            Role
          </label>
          <SegmentedControl
            value={form.role}
            onChange={v => setForm(prev => ({ ...prev, role: v as Role }))}
            options={[
              { label: "Student", value: "student" },
              { label: "Teacher", value: "teacher" },
              { label: "Admin", value: "admin" },
            ]}
          />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={submit}>Send invite</ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}

function UserEditModal({
  user,
  onClose,
  onSaved,
}: {
  user: User | null
  onClose: () => void
  onSaved: (u: User) => void
}) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "student" as Role,
    is_active: true,
  })

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      })
    }
  }, [user?.id])

  const handle = (k: "full_name" | "email") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = () => {
    if (!user) return
    const updated: User = { ...user, ...form }
    onSaved(updated)
    toast(`Updated ${form.full_name}`, "success")
    onClose()
  }

  return (
    <Modal open={!!user} onClose={onClose} title="Edit user">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input
          label="Full name"
          value={form.full_name}
          onChange={handle("full_name")}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={handle("email")}
        />
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8, color: "var(--color-fg-muted)" }}>
            Role
          </label>
          <SegmentedControl
            value={form.role}
            onChange={v => setForm(prev => ({ ...prev, role: v as Role }))}
            options={[
              { label: "Student", value: "student" },
              { label: "Teacher", value: "teacher" },
              { label: "Admin", value: "admin" },
            ]}
          />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
          />
          Account is active
        </label>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={submit}>Save changes</ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [q, setQ] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

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

  const toggleActive = (u: User) => {
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x))
    toast(`${u.full_name} ${u.is_active ? "deactivated" : "activated"}`, u.is_active ? "error" : "success")
  }

  const remove = (u: User) => {
    if (!confirm(`Permanently delete ${u.full_name}? This can't be undone.`)) return
    setUsers(prev => prev.filter(x => x.id !== u.id))
    toast(`${u.full_name} deleted`, "error")
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
        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1, maxWidth: 320 }}>
            <Input
              icon={<SearchIcon size={16} color="var(--color-fg-muted)" />}
              placeholder="Search users…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <Tabs tabs={ROLE_TABS} value={roleFilter} onChange={setRoleFilter} />
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
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
                  {/* User */}
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={u.full_name} size="md" src={u.avatar_url} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.full_name}</div>
                        <div style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: "12px 20px" }}>
                    <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "12px 20px" }}>
                    <StatusBadge status={u.is_active ? "active" : "inactive"} />
                  </td>

                  {/* Joined */}
                  <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--color-fg-muted)" }}>
                    {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
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
                      <IconButton title="Delete user" onClick={() => remove(u)} style={{ color: "#dc2626" }}>
                        <TrashIcon size={15} />
                      </IconButton>
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
        onCreated={u => setUsers(prev => [...prev, u])}
      />
      <UserEditModal
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={updated => setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))}
      />
    </>
  )
}
