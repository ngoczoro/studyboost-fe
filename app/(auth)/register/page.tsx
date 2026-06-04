"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BrandMark } from "@/components/brand/brand-mark"
import { Button } from "@/components/ui/button"
import { Input, PasswordInput } from "@/components/ui/input"
import { MailIcon } from "@/components/ui/icons"
import { toast } from "@/components/ui/primitives"

type Step = "form" | "otp"

export default function RegisterPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("form")

  // Bước 1
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  // Bước 2
  const [otp, setOtp] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // ── Bước 1: Gửi form → BE gửi OTP ────────────────────────────────
  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirm) return setError("Passwords don't match")
    if (password.length < 6) return setError("Password must be at least 6 characters")

    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Registration failed")

      toast("OTP sent — check your email (or Spring Boot console in dev)")
      setStep("otp")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Bước 2: Xác thực OTP → tạo user + auto-login ─────────────────
  async function handleSubmitOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (otp.length !== 6) return setError("OTP must be exactly 6 digits")

    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Verification failed")

      toast("Account created — welcome to StudyBoost!")
      router.push(`/${data.user.role}/dashboard`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed")
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

  // ── Render bước 1: điền thông tin ─────────────────────────────────
  if (step === "form") {
    return (
      <main className="auth-shell">
        <form onSubmit={handleSubmitForm} noValidate style={cardStyle}>
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
              label="Full name"
              placeholder="Jordan Pham"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
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
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordInput
              label="Confirm password"
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

          <Button type="submit" loading={submitting}>
            {submitting ? "Sending OTP…" : "Continue →"}
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

  // ── Render bước 2: nhập OTP ────────────────────────────────────────
  return (
    <main className="auth-shell">
      <form onSubmit={handleSubmitOtp} noValidate style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <BrandMark size={64} />
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-fg)" }}>
              Verify your email
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-fg-muted)" }}>
              We sent a 6-digit code to{" "}
              <strong style={{ color: "var(--color-fg)" }}>{email}</strong>
            </p>
          </div>
        </div>

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
            style={{ textAlign: "center", fontSize: 28, letterSpacing: "0.35em", fontWeight: 700 }}
          />
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-fg-muted)", textAlign: "center" }}>
            💡 Dev mode: xem terminal Spring Boot để lấy OTP code
          </p>
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
          {submitting ? "Verifying…" : "Verify & Create Account"}
        </Button>

        <button
          type="button"
          onClick={() => { setStep("form"); setError(""); setOtp("") }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, color: "var(--color-primary-600)",
            textDecoration: "underline", padding: 0,
          }}
        >
          ← Change email address
        </button>
      </form>
    </main>
  )
}
