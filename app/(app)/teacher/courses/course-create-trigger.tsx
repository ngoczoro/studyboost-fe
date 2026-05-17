"use client"

import { useState } from "react"
import { ButtonSmall } from "@/components/ui/button-small"
import { CourseCreateModal } from "@/components/course-create-modal"

interface Props {
  teacherId: number
}

export function CourseCreateTrigger({ teacherId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <ButtonSmall onClick={() => setOpen(true)}>+ New course</ButtonSmall>
      <CourseCreateModal
        open={open}
        onClose={() => setOpen(false)}
        teacherId={teacherId}
      />
    </>
  )
}
