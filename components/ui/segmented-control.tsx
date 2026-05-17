"use client"

interface Option {
  label: string
  value: string
}

interface SegmentedControlProps {
  options: Option[]
  value: string
  onChange: (v: string) => void
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      gap: 4,
      background: "var(--color-bg)",
      borderRadius: 12,
      padding: 4,
      border: "1px solid var(--color-border)",
    }}>
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              height: 42,
              borderRadius: 10,
              border: `1px solid ${active ? "var(--color-primary-500)" : "transparent"}`,
              background: active ? "var(--color-primary-50)" : "transparent",
              color: active ? "var(--color-primary-700)" : "var(--color-fg-muted)",
              fontWeight: active ? 600 : 500,
              fontSize: 14,
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
