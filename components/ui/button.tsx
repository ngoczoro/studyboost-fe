"use client"

import { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost"
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = "primary", loading, disabled, children, style, ...rest }: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    padding: "0 24px",
    borderRadius: 14,
    fontWeight: 600,
    fontSize: 16,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    border: "none",
    transition: "opacity .15s, transform .1s",
    opacity: disabled || loading ? 0.6 : 1,
    width: "100%",
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--color-primary-600)",
      color: "#fff",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-fg)",
      border: "1px solid var(--color-border)",
    },
  }

  return (
    <button
      disabled={disabled || loading}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {loading && (
        <span
          className="animate-sb-spin"
          style={{
            width: 18, height: 18,
            borderRadius: "50%",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            display: "inline-block",
          }}
        />
      )}
      {children}
    </button>
  )
}
