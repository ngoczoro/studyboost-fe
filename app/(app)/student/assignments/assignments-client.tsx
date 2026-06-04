"use client";

import { useState } from "react";
import { PageHeader, Card, EmptyState, Tabs } from "@/components/ui/primitives";
import { CourseGlyph } from "@/components/ui/course-glyph";
import Link from "next/link";
import type { Course } from "@/lib/types";
import { formatDateTimeHcm } from "@/lib/datetime-format";

type AssignmentStatus = "open" | "submitted" | "graded" | "overdue";

interface AssignmentRow {
  id: number;
  title: string;
  dueDate?: string;
  maxScore: number;
  score?: number;
  status: AssignmentStatus;
  course: Course;
}

interface Props {
  assignments: AssignmentRow[];
}

const TABS = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Submitted", value: "submitted" },
  { label: "Graded", value: "graded" },
  { label: "Overdue", value: "overdue" },
];

const STATUS_COLOR: Record<AssignmentStatus, string> = {
  open: "var(--color-primary-600)",
  submitted: "#7c3aed",
  graded: "#15803d",
  overdue: "#dc2626",
};

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  open: "Open",
  submitted: "Submitted",
  graded: "Graded",
  overdue: "Overdue",
};

export function StudentAssignmentsClient({ assignments }: Props) {
  const [tab, setTab] = useState("all");

  const filtered =
    tab === "all" ? assignments : assignments.filter((a) => a.status === tab);

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle={`${assignments.length} assignment${assignments.length !== 1 ? "s" : ""} across your courses`}
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div style={{ marginTop: 16 }}>
        {filtered.length === 0 ? (
          <EmptyState
            title={`No ${tab === "all" ? "" : tab} assignments`}
            description="Nothing to show here."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((a) => (
              <Link
                key={a.id}
                href={`/student/assignments/${a.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Card style={{ padding: "14px 16px", cursor: "pointer" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <CourseGlyph course={a.course} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-fg-muted)",
                          marginTop: 2,
                        }}
                      >
                        {a.course.title}
                        {a.dueDate &&
                          ` · Due ${formatDateTimeHcm(a.dueDate)}`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: STATUS_COLOR[a.status],
                          marginBottom: a.status === "graded" ? 2 : 0,
                        }}
                      >
                        {STATUS_LABEL[a.status]}
                      </div>
                      {a.status === "graded" && a.score !== undefined && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--color-fg-muted)",
                          }}
                        >
                          {a.score}/{a.maxScore}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
