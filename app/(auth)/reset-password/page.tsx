"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { BrandMark } from "@/components/brand/brand-mark"
import { Button } from "@/components/ui/button"
import { Input, PasswordInput } from "@/components/ui/input"
import { toast } from "@/components/ui/primitives"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") ?? ""

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (newPassword !== confirm) return setError("Passwords don't match")
    if (newPassword.length < 6) return setError("Password must be at least 6 characters")
    if (otp.length !== 6) return setError("OTP must be exactly 6 digits")

    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Reset failed")

      toast("Password reset successfully — please sign in")
      router.push("/login")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed")
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

  return (
    <main className="auth-shell">
      <form onSubmit={handleSubmit} noValidate style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <BrandMark size={64} />
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-fg)" }}>
              Reset your password
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-fg-muted)" }}>
              Enter the OTP sent to your email and your new password.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Input
              label="OTP Code"
              placeholder="123456"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              autoComplete="one-time-code"
              inputMode="numeric"
              required
              style={{ textAlign: "center", fontSize: 24, letterSpacing: "0.3em", fontWeight: 700 }}
            />
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-fg-muted)", textAlign: "center" }}>
              💡 Dev mode: xem terminal Spring Boot để lấy OTP
            </p>
          </div>

          <PasswordInput
            label="New password"
            placeholder="••••••••"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <PasswordInput
            label="Confirm new password"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
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

        <Button type="submit" loading={submitting} disabled={otp.length !== 6}>
          {submitting ? "Resetting…" : "Reset password"}
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

// Wrap với Suspense vì useSearchParams cần Suspense boundary trong Next.js
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
