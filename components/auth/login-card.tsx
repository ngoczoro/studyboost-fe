"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BrandMark } from "@/components/brand/brand-mark"
import { Button } from "@/components/ui/button"
import { Input, PasswordInput } from "@/components/ui/input"
import { MailIcon } from "@/components/ui/icons"
import { toast } from "@/components/ui/primitives"

export function LoginCard() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Sign in failed")
      toast("Signed in successfully")
      router.push(`/${data.user.role}/dashboard`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
        gap: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <BrandMark size={72} />
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-fg)" }}>
            Welcome Back
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: "var(--color-fg-muted)" }}>
            Sign in to your account
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="hello@studyboost.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={<MailIcon size={16} />}
          autoComplete="email"
          required
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <PasswordInput
            id="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <div style={{ textAlign: "right" }}>
            <Link href="/forgot-password" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary-600)", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>
        </div>
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
        {submitting ? "Signing in…" : "Sign In"}
      </Button>

      <p style={{ margin: 0, textAlign: "center", fontSize: 14, color: "var(--color-fg-muted)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
          Create one
        </Link>
      </p>
    </form>
  )
}
