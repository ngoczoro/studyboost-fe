"use client"

import { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonSmallProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger"
  loading?: boolean
  children: ReactNode
}

export function ButtonSmall({ variant = "primary", loading, disabled, children, style, ...rest }: ButtonSmallProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    padding: "0 16px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    border: "none",
    transition: "opacity .15s",
    opacity: disabled || loading ? 0.6 : 1,
    whiteSpace: "nowrap" as const,
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "var(--color-primary-600)", color: "#fff" },
    ghost: { background: "transparent", color: "var(--color-fg)", border: "1px solid var(--color-border)" },
    danger: { background: "#fee2e2", color: "#dc2626" },
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
            width: 14, height: 14,
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
