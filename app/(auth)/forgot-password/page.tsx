"use client"

import { useState } from "react"
import Link from "next/link"
import { BrandMark } from "@/components/brand/brand-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MailIcon } from "@/components/ui/icons"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Something went wrong")
      }
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const cardStyle: React.CSSProperties = {
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
  }

  if (sent) {
    return (
      <main className="auth-shell">
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <BrandMark size={64} />
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-fg)" }}>
                Check your email
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "var(--color-fg-muted)" }}>
                If <strong style={{ color: "var(--color-fg)" }}>{email}</strong> exists in our system,
                an OTP has been sent.
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-fg-muted)" }}>
                💡 Dev mode: xem terminal Spring Boot để lấy OTP
              </p>
            </div>
          </div>

          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            style={{
              display: "block",
              textAlign: "center",
              background: "var(--color-primary-600)",
              color: "#fff",
              borderRadius: "var(--radius-md)",
              padding: "14px",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              transition: "opacity .15s",
            }}
          >
            Enter OTP →
          </Link>

          <p style={{ margin: 0, textAlign: "center", fontSize: 14, color: "var(--color-fg-muted)" }}>
            <button
              onClick={() => { setSent(false); setEmail("") }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary-600)", fontWeight: 600, fontSize: 14 }}
            >
              Try a different email
            </button>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-shell">
      <form onSubmit={handleSubmit} noValidate style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <BrandMark size={64} />
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-fg)" }}>
              Forgot password?
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-fg-muted)" }}>
              Enter your email and we&apos;ll send you a reset code.
            </p>
          </div>
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="hello@studyboost.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={<MailIcon size={16} />}
          autoComplete="email"
          required
        />

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
          {submitting ? "Sending…" : "Send reset code"}
        </Button>

        <p style={{ margin: 0, textAlign: "center", fontSize: 14, color: "var(--color-fg-muted)" }}>
          <Link href="/login" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
            ← Back to sign in
          </Link>
        </p>
      </form>
    </main>
  )
}
