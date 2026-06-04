"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ButtonSmall } from "@/components/ui/button-small"
import { CourseCreateModal } from "@/components/course-create-modal"

export function CourseCreateTrigger() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <ButtonSmall onClick={() => setOpen(true)}>+ New course</ButtonSmall>
      <CourseCreateModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => router.refresh()}
      />
    </>
  )
}
