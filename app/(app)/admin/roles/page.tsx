"use client"

import { Fragment, useState, useEffect, useCallback } from "react"
import { Card, PageHeader, Badge, Modal, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { Input } from "@/components/ui/input"
import { PlusIcon, TrashIcon } from "@/components/ui/icons"

// ── Types ──────────────────────────────────────────────────────────────

interface RoleInfo {
  name: string
  description: string
  permissions: string[]
  userCount: number
  protected: boolean
}

interface PermDef {
  key: string
  label: string
  category: string
}

// ── Permission definitions ─────────────────────────────────────────────

const PERMISSIONS: PermDef[] = [
  { key: "courses.view",        label: "View courses",         category: "Courses" },
  { key: "courses.create",      label: "Create courses",       category: "Courses" },
  { key: "courses.publish",     label: "Publish / archive",    category: "Courses" },
  { key: "courses.enroll",      label: "Enroll in courses",    category: "Courses" },
  { key: "assignments.view",    label: "View assignments",     category: "Assignments" },
  { key: "assignments.create",  label: "Create assignments",   category: "Assignments" },
  { key: "assignments.submit",  label: "Submit assignments",   category: "Assignments" },
  { key: "grades.view",         label: "View grades",          category: "Grades" },
  { key: "grades.create",       label: "Grade submissions",    category: "Grades" },
  { key: "discussion.view",     label: "View discussions",     category: "Discussion" },
  { key: "discussion.post",     label: "Post & comment",       category: "Discussion" },
  { key: "users.manage",        label: "Manage users",         category: "Administration" },
]

const CATEGORIES = Array.from(new Set(PERMISSIONS.map(p => p.category)))

// Always ON for all roles (view perms)
const ALWAYS_ON = new Set(["courses.view", "assignments.view", "grades.view", "discussion.view"])
// Exclusive to ADMIN — other roles can never have it
const ADMIN_ONLY = new Set(["users.manage"])

// ── Color palette ──────────────────────────────────────────────────────

type BadgeTone = "purple" | "blue" | "green" | "orange" | "yellow" | "red" | "default"

const PREDEFINED_TONES: Record<string, BadgeTone> = {
  ADMIN: "purple", TEACHER: "blue", STUDENT: "green",
}
const EXTRA_TONES: BadgeTone[] = ["orange", "yellow", "red", "default"]

function getRoleTone(roleName: string, index: number): BadgeTone {
  return PREDEFINED_TONES[roleName] ?? EXTRA_TONES[index % EXTRA_TONES.length]
}

// ── Cell ──────────────────────────────────────────────────────────────

function PermCell({
  allowed, alwaysOn, adminOnly, isAdmin, onChange,
}: {
  allowed: boolean
  alwaysOn: boolean
  adminOnly: boolean
  isAdmin: boolean
  onChange: () => void
}) {
  // Non-admin role trying to use an admin-only permission → locked off
  const lockedOff = adminOnly && !isAdmin
  const lockedOn  = alwaysOn || (adminOnly && isAdmin)
  const disabled  = lockedOn || lockedOff

  let icon: string
  if (lockedOn) icon = "🔒"
  else if (lockedOff) icon = "🚫"
  else if (allowed) icon = "✓"
  else icon = "✕"

  return (
    <button
      onClick={disabled ? undefined : onChange}
      title={lockedOn ? "Always granted" : lockedOff ? "Exclusive to ADMIN" : undefined}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 4, height: 30, padding: "0 11px", borderRadius: 6, border: "1px solid",
        fontSize: 12, fontWeight: 600, cursor: disabled ? "default" : "pointer",
        transition: "all .12s", opacity: disabled ? 0.5 : 1,
        ...(lockedOff
          ? { background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.15)", color: "#ef4444" }
          : (allowed || lockedOn)
            ? { background: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.35)", color: "#15803d" }
            : { background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)", color: "#dc2626" }),
      }}
    >
      {icon}{!lockedOff && (!lockedOn || alwaysOn ? "" : "")}
      {" "}{lockedOff ? "N/A" : lockedOn ? "On" : allowed ? "On" : "Off"}
    </button>
  )
}

// ── New Role Modal ─────────────────────────────────────────────────────

function NewRoleModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (r: RoleInfo) => void
}) {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [saving, setSaving] = useState(false)

  // Auto-uppercase + strip invalid chars
  const handleName = (raw: string) => {
    setName(raw.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 20))
  }

  const isValid = /^[A-Z][A-Z0-9_]{1,19}$/.test(name)

  const submit = async () => {
    if (!isValid) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create role")
      onCreated(data as RoleInfo)
      toast(`Role '${name}' created`, "success")
      setName(""); setDesc("")
      onClose()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create role", "error")
    } finally {
      setSaving(false)
    }
  }

  const nameHint = name.length < 2
    ? "Minimum 2 characters"
    : !isValid
      ? "Must start with a letter"
      : null

  return (
    <Modal open={open} onClose={onClose} title="Create new role">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Input
            label="Role name"
            value={name}
            onChange={e => handleName(e.target.value)}
            placeholder="MODERATOR"
          />
          {nameHint && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-fg-muted)" }}>{nameHint}</p>
          )}
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-fg-muted)" }}>
            Uppercase letters, digits, underscores. 2-20 characters.
          </p>
        </div>
        <Input
          label="Description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="e.g. Forum moderator with limited course access"
        />
        <p style={{ margin: 0, fontSize: 12, color: "var(--color-fg-muted)" }}>
          The new role starts with view permissions only. Configure the full matrix after creation.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={submit} disabled={saving || !isValid}>
            {saving ? "Creating…" : "Create role"}
          </ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [deletingRole, setDeletingRole] = useState<RoleInfo | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rolesRes, matrixRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/roles/matrix"),
      ])
      if (!rolesRes.ok || !matrixRes.ok) throw new Error("Failed to load")

      const rolesData: RoleInfo[] = await rolesRes.json()
      const matrixData: Record<string, string[]> = await matrixRes.json()

      setRoles(rolesData)
      const newMatrix: Record<string, Set<string>> = {}
      for (const r of rolesData) {
        newMatrix[r.name] = new Set(matrixData[r.name] ?? [])
      }
      setMatrix(newMatrix)
      setDirty(new Set())
    } catch {
      toast("Failed to load permissions", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggle = (permKey: string, roleName: string) => {
    const isAdmin = roleName === "ADMIN"
    if (ALWAYS_ON.has(permKey)) return
    if (ADMIN_ONLY.has(permKey) && !isAdmin) return
    if (ADMIN_ONLY.has(permKey) && isAdmin) return // always on for admin

    setMatrix(prev => {
      const next = new Set(prev[roleName] ?? [])
      if (next.has(permKey)) next.delete(permKey)
      else next.add(permKey)
      return { ...prev, [roleName]: next }
    })
    setDirty(prev => new Set([...prev, roleName]))
  }

  const saveRole = async (roleName: string) => {
    setSaving(roleName)
    try {
      const res = await fetch(`/api/admin/roles/${roleName}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: [...(matrix[roleName] ?? [])] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save")
      setMatrix(prev => ({ ...prev, [roleName]: new Set(data.permissions as string[]) }))
      setDirty(prev => { const next = new Set(prev); next.delete(roleName); return next })
      toast(`${roleName} permissions saved`, "success")
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to save", "error")
    } finally {
      setSaving(null)
    }
  }

  const saveAll = async () => {
    for (const role of [...dirty]) {
      await saveRole(role)
    }
  }

  const handleRoleCreated = (role: RoleInfo) => {
    setRoles(prev => [...prev, role])
    setMatrix(prev => ({ ...prev, [role.name]: new Set(role.permissions) }))
  }

  const confirmDelete = async () => {
    if (!deletingRole) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/roles/${deletingRole.name}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to delete")
      setRoles(prev => prev.filter(r => r.name !== deletingRole.name))
      setMatrix(prev => { const next = { ...prev }; delete next[deletingRole.name]; return next })
      setDirty(prev => { const next = new Set(prev); next.delete(deletingRole.name); return next })
      toast(`Role '${deletingRole.name}' deleted`, "success")
      setDeletingRole(null)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error")
    } finally {
      setDeleting(false)
    }
  }

  const colCount = roles.length + 1

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage role permissions — changes enforce immediately at the API level."
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {dirty.size > 0 && (
              <>
                <span style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
                  {dirty.size} unsaved
                </span>
                <ButtonSmall variant="ghost" onClick={load} disabled={!!saving}>Discard</ButtonSmall>
                <ButtonSmall onClick={saveAll} disabled={!!saving}>
                  {saving ? "Saving…" : "Save all"}
                </ButtonSmall>
              </>
            )}
            <ButtonSmall onClick={() => setCreateOpen(true)}>
              <PlusIcon size={14} />
              New role
            </ButtonSmall>
          </div>
        }
      />

      <div style={{
        marginBottom: 16, padding: "10px 14px",
        background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: 10, fontSize: 13, color: "var(--color-fg-muted)",
        display: "flex", gap: 20, flexWrap: "wrap",
      }}>
        <span><strong>🔒 On</strong> — always granted, cannot be removed</span>
        <span><strong>🚫 N/A</strong> — exclusive to ADMIN</span>
        <span>API enforcement is immediate. Frontend menus reflect changes on next login.</span>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--color-fg-muted)", fontSize: 14 }}>
          Loading permissions…
        </div>
      ) : (
        <Card style={{ padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th style={{
                  padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 600,
                  color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                  width: `${Math.max(30, 55 - roles.length * 5)}%`,
                }}>
                  Permission
                </th>
                {roles.map((role, idx) => (
                  <th key={role.name} style={{
                    padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 600,
                    color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <Badge tone={getRoleTone(role.name, idx)}>{role.name.toLowerCase()}</Badge>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {dirty.has(role.name) && (
                          <ButtonSmall
                            onClick={() => saveRole(role.name)}
                            disabled={saving === role.name}
                            style={{ height: 22, padding: "0 7px", fontSize: 10 }}
                          >
                            {saving === role.name ? "…" : "Save"}
                          </ButtonSmall>
                        )}
                        {!role.protected && (
                          <button
                            onClick={() => setDeletingRole(role)}
                            title={role.userCount > 0
                              ? `${role.userCount} user(s) assigned — reassign first`
                              : `Delete ${role.name}`}
                            disabled={role.userCount > 0}
                            style={{
                              background: "none", border: "none", cursor: role.userCount > 0 ? "not-allowed" : "pointer",
                              color: role.userCount > 0 ? "var(--color-fg-muted)" : "#dc2626",
                              opacity: role.userCount > 0 ? 0.4 : 1, padding: 2,
                            }}
                          >
                            <TrashIcon size={13} />
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: "var(--color-fg-muted)", fontWeight: 400 }}>
                        {role.userCount} user{role.userCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(category => (
                <Fragment key={category}>
                  <tr style={{ background: "var(--color-surface-2)" }}>
                    <td colSpan={colCount} style={{
                      padding: "7px 20px", fontSize: 11, fontWeight: 700,
                      color: "var(--color-fg-muted)", textTransform: "uppercase",
                      letterSpacing: "0.08em", borderBottom: "1px solid var(--color-border)",
                    }}>
                      {category}
                    </td>
                  </tr>
                  {PERMISSIONS.filter(p => p.category === category).map((perm, i, arr) => (
                    <tr key={perm.key} style={{
                      borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none",
                    }}>
                      <td style={{ padding: "11px 20px", fontSize: 14 }}>{perm.label}</td>
                      {roles.map(role => {
                        const has = ALWAYS_ON.has(perm.key)
                          || (ADMIN_ONLY.has(perm.key) && role.name === "ADMIN")
                          || (matrix[role.name]?.has(perm.key) ?? false)
                        return (
                          <td key={role.name} style={{ padding: "7px 16px", textAlign: "center" }}>
                            <PermCell
                              allowed={has}
                              alwaysOn={ALWAYS_ON.has(perm.key)}
                              adminOnly={ADMIN_ONLY.has(perm.key)}
                              isAdmin={role.name === "ADMIN"}
                              onChange={() => toggle(perm.key, role.name)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <NewRoleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleRoleCreated}
      />

      {/* Delete confirmation */}
      <Modal
        open={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        title={`Delete role: ${deletingRole?.name}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            Are you sure you want to delete the <strong>{deletingRole?.name}</strong> role?
            This cannot be undone.
          </p>
          {deletingRole?.userCount === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-fg-muted)" }}>
              No users are assigned to this role.
            </p>
          ) : (
            <div style={{
              padding: "8px 12px", background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: 13, color: "#dc2626",
            }}>
              <strong>{deletingRole?.userCount} user(s)</strong> are still assigned to this role.
              Reassign them before deleting.
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
            <ButtonSmall variant="ghost" onClick={() => setDeletingRole(null)}>Cancel</ButtonSmall>
            <ButtonSmall
              onClick={confirmDelete}
              disabled={deleting || (deletingRole?.userCount ?? 0) > 0}
              style={{ background: "#dc2626", borderColor: "#dc2626", color: "#fff" }}
            >
              {deleting ? "Deleting…" : "Delete role"}
            </ButtonSmall>
          </div>
        </div>
      </Modal>
    </>
  )
}
