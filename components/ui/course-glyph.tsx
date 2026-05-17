import type { Course } from "@/lib/types"

interface CourseGlyphProps {
  course: Course
  size?: number
}

export function CourseGlyph({ course, size = 48 }: CourseGlyphProps) {
  const color = course.thumbnail_color ?? "#86efac"
  const glyph = course.thumbnail_glyph ?? course.title.slice(0, 2).toUpperCase()
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${color}55 0%, ${color} 100%)`,
        color: "#0f172a",
        display: "grid",
        placeItems: "center",
        fontWeight: 700,
        fontSize: Math.round(size * 0.35),
        letterSpacing: "-0.02em",
        flexShrink: 0,
      }}
    >
      {glyph}
    </div>
  )
}
