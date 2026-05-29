"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BrandMark } from "@/components/brand/brand-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MailIcon, LockIcon } from "@/components/ui/icons"
import { toast } from "@/components/ui/primitives"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirm) return setError("Passwords don't match")
    if (password.length < 6) return setError("Password should be at least 6 characters")
    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Sign up failed")
      toast("Account created — welcome!")
      router.push(`/${data.user.role}/dashboard`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--color-surface)",
          borderRadius: 20,
          padding: "40px 36px 32px",
          boxShadow: "var(--shadow-card)",
          border: "1px solid rgba(15, 23, 42, 0.04)",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <BrandMark size={64} />
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-fg)" }}>
              Create your account
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-fg-muted)" }}>
              Join thousands of learners on StudyBoost
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input
            id="name"
            label="Full name"
            placeholder="Jordan Pham"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="hello@studyboost.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<MailIcon size={16} />}
            autoComplete="email"
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={<LockIcon size={16} />}
            autoComplete="new-password"
            required
          />
          <Input
            id="confirm"
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            icon={<LockIcon size={16} />}
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <div role="alert" style={{
            fontSize: 13, color: "#b91c1c",
            background: "#fef2f2", border: "1px solid #fecaca",
            padding: "10px 12px", borderRadius: 10,
          }}>
            {error}
          </div>
        )}

        <Button type="submit" loading={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>

        <p style={{ margin: 0, textAlign: "center", fontSize: 14, color: "var(--color-fg-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </form>
    </main>
  )
}
