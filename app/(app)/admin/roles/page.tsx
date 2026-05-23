"use client"

import { Fragment, useState } from "react"
import { Card, PageHeader, Badge } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"

type Role = "admin" | "teacher" | "student"

interface Permission {
  key: string
  label: string
  category: string
}

const PERMISSIONS: Permission[] = [
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

const DEFAULT_MATRIX: Record<string, Record<Role, boolean>> = {
  "courses.view":       { admin: true,  teacher: true,  student: true  },
  "courses.create":     { admin: true,  teacher: true,  student: false },
  "courses.publish":    { admin: true,  teacher: true,  student: false },
  "courses.enroll":     { admin: false, teacher: false, student: true  },
  "assignments.view":   { admin: true,  teacher: true,  student: true  },
  "assignments.create": { admin: true,  teacher: true,  student: false },
  "assignments.submit": { admin: false, teacher: false, student: true  },
  "grades.view":        { admin: true,  teacher: true,  student: true  },
  "grades.create":      { admin: true,  teacher: true,  student: false },
  "discussion.view":    { admin: true,  teacher: true,  student: true  },
  "discussion.post":    { admin: true,  teacher: true,  student: true  },
  "users.manage":       { admin: true,  teacher: false, student: false },
}

const ROLE_TONE: Record<Role, "purple" | "blue" | "green"> = {
  admin:   "purple",
  teacher: "blue",
  student: "green",
}

const ROLES: Role[] = ["admin", "teacher", "student"]

export default function AdminRolesPage() {
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX)

  const toggle = (perm: string, role: Role) => {
    setMatrix(prev => ({
      ...prev,
      [perm]: { ...prev[perm], [role]: !prev[perm][role] },
    }))
  }

  const categories = Array.from(new Set(PERMISSIONS.map(p => p.category)))

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Granular access control across the three platform roles."
      />

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              <th
                style={{
                  padding: "14px 24px",
                  textAlign: "left",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  width: "40%",
                }}
              >
                Permission
              </th>
              {ROLES.map(role => (
                <th
                  key={role}
                  style={{
                    padding: "14px 24px",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-fg-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  <Badge tone={ROLE_TONE[role]}>{role}</Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <Fragment key={category}>
                <tr style={{ background: "var(--color-surface-2)" }}>
                  <td
                    colSpan={4}
                    style={{
                      padding: "8px 24px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-fg-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    {category}
                  </td>
                </tr>
                {PERMISSIONS.filter(p => p.category === category).map((perm, i, arr) => (
                  <tr
                    key={perm.key}
                    style={{
                      borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none",
                    }}
                  >
                    <td style={{ padding: "14px 24px", fontSize: 14 }}>{perm.label}</td>
                    {ROLES.map(role => {
                      const has = matrix[perm.key][role]
                      return (
                        <td key={role} style={{ padding: "10px 24px", textAlign: "center" }}>
                          <ButtonSmall
                            variant={has ? "primary" : "ghost"}
                            onClick={() => toggle(perm.key, role)}
                            style={{ minWidth: 72 }}
                          >
                            {has ? "Allowed" : "Denied"}
                          </ButtonSmall>
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
    </>
  )
}
