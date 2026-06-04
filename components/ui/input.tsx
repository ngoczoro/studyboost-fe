"use client"

import { InputHTMLAttributes, ReactNode, useState } from "react"
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  rightSlot?: ReactNode
  error?: string
}

export function Input({ label, icon, rightSlot, error, id, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fg)" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-fg-muted)",
            display: "flex", alignItems: "center",
            pointerEvents: "none",
          }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 48,
            borderRadius: "var(--radius-md)",
            border: `1px solid ${error ? "#dc2626" : focused ? "var(--color-primary-500)" : "var(--color-border)"}`,
            boxShadow: focused && !error ? "0 0 0 3px rgba(34,197,94,0.15)" : undefined,
            padding: `0 ${rightSlot ? "120px" : "14px"} 0 ${icon ? "40px" : "14px"}`,
            fontSize: 15,
            color: "var(--color-fg)",
            background: "var(--color-surface)",
            outline: "none",
            transition: "border-color .15s, box-shadow .15s",
            ...style,
          }}
          {...rest}
        />
        {rightSlot && (
          <span style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
            display: "flex", alignItems: "center",
          }}>
            {rightSlot}
          </span>
        )}
      </div>
      {error && <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>}
    </div>
  )
}

// ── Password Input với nút reveal ──────────────────────────────────────

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  icon?: ReactNode
  error?: string
  id?: string
}

export function PasswordInput({ label, icon, error, id, style, ...rest }: PasswordInputProps) {
  const [show, setShow] = useState(false)

  const revealBtn = (
    <button
      type="button"
      onClick={() => setShow(v => !v)}
      aria-label={show ? "Hide password" : "Show password"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        color: "var(--color-fg-muted)",
        display: "flex",
        alignItems: "center",
        borderRadius: 4,
        transition: "color .15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--color-fg)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--color-fg-muted)")}
    >
      {show ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
    </button>
  )

  return (
    <Input
      id={id}
      label={label}
      type={show ? "text" : "password"}
      icon={icon}
      rightSlot={revealBtn}
      error={error}
      style={{ paddingRight: 44, ...style }}
      {...rest}
    />
  )
}
