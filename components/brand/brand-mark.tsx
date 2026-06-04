export function BrandMark({ size = 56 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.27,
      background: "linear-gradient(155deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
      boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg
        width={size * 0.54} height={size * 0.54}
        viewBox="0 0 24 24"
        fill="none" stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
      >
        <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" />
        <path d="M7 11.5V17c0 1.5 2.25 2.5 5 2.5s5-1 5-2.5v-5.5" />
        <path d="M22 8.5V14" />
      </svg>
    </div>
  )
}
