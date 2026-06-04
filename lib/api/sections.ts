import "server-only"

import type {
  BackendSectionRequest,
  BackendSectionResponse,
} from "./types"
import { authJson } from "./authenticated"
import { mapLessonToSectionItem, mapSection } from "./lesson-mappers"
import { listLessonsInSection } from "./lessons"
import type { Section, SectionItem } from "@/lib/types"

export type SectionWithItems = Section & { items: SectionItem[] }

export async function listSectionsByCourse(
  courseId: number,
): Promise<Section[]> {
  const data = await authJson<BackendSectionResponse[]>(
    `/api/courses/${courseId}/sections`,
  )
  return data.map(mapSection)
}

export async function createSection(
  courseId: number,
  body: BackendSectionRequest,
): Promise<Section> {
  const data = await authJson<BackendSectionResponse>(
    `/api/courses/${courseId}/sections`,
    { method: "POST", body: JSON.stringify(body) },
  )
  return mapSection(data)
}

export async function updateSection(
  sectionId: number,
  body: BackendSectionRequest,
): Promise<Section> {
  const data = await authJson<BackendSectionResponse>(
    `/api/sections/${sectionId}`,
    { method: "PUT", body: JSON.stringify(body) },
  )
  return mapSection(data)
}

export async function deleteSection(sectionId: number): Promise<void> {
  await authJson<{ message: string }>(`/api/sections/${sectionId}`, {
    method: "DELETE",
  })
}

export async function getCourseCurriculum(
  courseId: number,
): Promise<SectionWithItems[]> {
  const sections = await listSectionsByCourse(courseId)

  return Promise.all(
    sections.map(async section => {
      const lessons = await listLessonsInSection(section.id)
      return {
        ...section,
        items: lessons.map(mapLessonToSectionItem),
      }
    }),
  )
}
