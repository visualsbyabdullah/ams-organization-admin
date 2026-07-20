"use client";

import { type MouseEvent, useMemo, useState } from "react";
import {
  Archive,
  BookOpenCheck,
  Copy,
  Download,
  FilePenLine,
  FileSearch,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { TrainingCourseForm } from "@/components/training/training-course-form";
import { TrainingTabs } from "@/components/training/training-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  TRAINING_CATEGORY_CONFIG,
  TRAINING_COPY,
  TRAINING_COURSE_SCOPE_CONFIG,
  TRAINING_COURSE_STATUS_CONFIG,
  TRAINING_DELIVERY_MODE_CONFIG,
} from "@/config/training";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { TRAINING_COURSES } from "@/data/training";
import { formatDate } from "@/lib/date";
import { downloadTrainingCsv, formatTrainingDuration } from "@/lib/training";
import type { TrainingCourse, TrainingCourseStatus } from "@/types/training";

type EditorMode = "create" | "edit" | null;

export function TrainingCoursesWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [courses, setCourses] = useState<TrainingCourse[]>(TRAINING_COURSES);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [modeFilter, setModeFilter] = useState("all");

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          selectedBranch.isAggregate ||
          course.scope === "organization" ||
          course.branchId === selectedBranch.id,
      ),
    [courses, selectedBranch],
  );

  const visibleCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedCourses.filter((course) => {
      const searchableValue = [
        course.title,
        course.code,
        course.provider,
        course.ownerName,
        course.branchName,
        TRAINING_CATEGORY_CONFIG[course.category].label,
        TRAINING_DELIVERY_MODE_CONFIG[course.deliveryMode].label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableValue.includes(query) &&
        (statusFilter === "all" || course.status === statusFilter) &&
        (categoryFilter === "all" || course.category === categoryFilter) &&
        (modeFilter === "all" || course.deliveryMode === modeFilter)
      );
    });
  }, [categoryFilter, modeFilter, scopedCourses, searchQuery, statusFilter]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;

  const publishedCourses = scopedCourses.filter(
    (course) => course.status === "published",
  );

  const mandatoryCourses = scopedCourses.filter(
    (course) => course.status === "published" && course.mandatory,
  );

  const draftCourses = scopedCourses.filter((course) => course.status === "draft");

  const totalCapacity = publishedCourses.reduce(
    (total, course) => total + course.capacity,
    0,
  );

  const metrics = [
    {
      label: "Published courses",
      value: String(publishedCourses.length),
      detail: selectedBranch.name,
      icon: BookOpenCheck,
      tone: "success" as const,
    },
    {
      label: "Mandatory courses",
      value: String(mandatoryCourses.length),
      detail: "Published requirements",
      icon: ShieldCheck,
      tone: "danger" as const,
    },
    {
      label: "Draft courses",
      value: String(draftCourses.length),
      detail: "Awaiting publication",
      icon: FilePenLine,
      tone: "warning" as const,
    },
    {
      label: "Available capacity",
      value: String(totalCapacity),
      detail: "Across published courses",
      icon: GraduationCap,
      tone: "info" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<TrainingCourse>[]>(
    () => [
      {
        id: "course",
        header: TRAINING_COPY.courses.columns.course,
        cell: (course) => (
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{course.title}</p>

              {course.mandatory && <Badge variant="danger">Mandatory</Badge>}
            </div>

            <p className="mt-1 text-xs text-text-muted">
              {course.code} Â· {course.provider}
            </p>
          </div>
        ),
      },
      {
        id: "category",
        header: TRAINING_COPY.courses.columns.category,
        cell: (course) => (
          <Badge variant={TRAINING_CATEGORY_CONFIG[course.category].badgeVariant}>
            {TRAINING_CATEGORY_CONFIG[course.category].label}
          </Badge>
        ),
      },
      {
        id: "delivery",
        header: TRAINING_COPY.courses.columns.delivery,
        cell: (course) => (
          <Badge
            variant={TRAINING_DELIVERY_MODE_CONFIG[course.deliveryMode].badgeVariant}
          >
            {TRAINING_DELIVERY_MODE_CONFIG[course.deliveryMode].label}
          </Badge>
        ),
      },
      {
        id: "duration",
        header: TRAINING_COPY.courses.columns.duration,
        cell: (course) => formatTrainingDuration(course.durationHours),
      },
      {
        id: "passingScore",
        header: TRAINING_COPY.courses.columns.passingScore,
        cell: (course) =>
          course.passingScore > 0 ? `${course.passingScore}%` : "No assessment",
      },
      {
        id: "scope",
        header: TRAINING_COPY.courses.columns.scope,
        cell: (course) => (
          <div>
            <Badge variant={TRAINING_COURSE_SCOPE_CONFIG[course.scope].badgeVariant}>
              {TRAINING_COURSE_SCOPE_CONFIG[course.scope].label}
            </Badge>

            {course.branchName && (
              <p className="mt-1 text-xs text-text-muted">{course.branchName}</p>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: TRAINING_COPY.courses.columns.status,
        cell: (course) => (
          <Badge variant={TRAINING_COURSE_STATUS_CONFIG[course.status].badgeVariant}>
            {TRAINING_COURSE_STATUS_CONFIG[course.status].label}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: TRAINING_COPY.courses.columns.actions,
        headClassName: "w-16",
        cell: (course) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Open ${course.title}`}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              setSelectedCourseId(course.id);
            }}
          >
            <MoreHorizontal />
          </Button>
        ),
      },
    ],
    [],
  );

  function saveCourse(nextCourse: TrainingCourse) {
    setCourses((currentCourses) => {
      const exists = currentCourses.some((course) => course.id === nextCourse.id);

      return exists
        ? currentCourses.map((course) =>
            course.id === nextCourse.id ? nextCourse : course,
          )
        : [nextCourse, ...currentCourses];
    });

    setSelectedCourseId(nextCourse.id);
    setEditorMode(null);
  }

  function duplicateCourse(course: TrainingCourse) {
    const duplicate: TrainingCourse = {
      ...course,
      id: crypto.randomUUID(),
      title: `${course.title} Copy`,
      code: `${course.code}-COPY`,
      status: "draft",
      ownerName: CURRENT_ADMIN.name,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setCourses((currentCourses) => [duplicate, ...currentCourses]);
    setSelectedCourseId(duplicate.id);
  }

  function updateStatus(courseId: string, status: TrainingCourseStatus) {
    setCourses((currentCourses) =>
      currentCourses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
              ownerName: CURRENT_ADMIN.name,
            }
          : course,
      ),
    );
  }

  function exportCourses() {
    downloadTrainingCsv(
      "training-courses.csv",
      [
        "Course",
        "Code",
        "Category",
        "Delivery",
        "Duration hours",
        "Passing score",
        "Scope",
        "Branch",
        "Status",
      ],
      visibleCourses.map((course) => [
        course.title,
        course.code,
        TRAINING_CATEGORY_CONFIG[course.category].label,
        TRAINING_DELIVERY_MODE_CONFIG[course.deliveryMode].label,
        course.durationHours,
        course.passingScore,
        TRAINING_COURSE_SCOPE_CONFIG[course.scope].label,
        course.branchName ?? "All branches",
        TRAINING_COURSE_STATUS_CONFIG[course.status].label,
      ]),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={TRAINING_COPY.eyebrow}
        title={TRAINING_COPY.courses.title}
        description={TRAINING_COPY.courses.description}
        actions={
          <>
            <Button variant="outline" onClick={exportCourses}>
              <Download />
              {TRAINING_COPY.courses.exportAction}
            </Button>

            <Button
              onClick={() => {
                setSelectedCourseId(null);
                setEditorMode("create");
              }}
            >
              <Plus />
              {TRAINING_COPY.courses.createAction}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <TrainingTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{TRAINING_COPY.courses.registerTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {TRAINING_COPY.courses.registerDescription}
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_12rem_14rem_13rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={TRAINING_COPY.courses.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{TRAINING_COPY.courses.allStatuses}</option>

              {Object.entries(TRAINING_COURSE_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">{TRAINING_COPY.courses.allCategories}</option>

              {Object.entries(TRAINING_CATEGORY_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={modeFilter}
              onChange={(event) => setModeFilter(event.target.value)}
            >
              <option value="all">{TRAINING_COPY.courses.allModes}</option>

              {Object.entries(TRAINING_DELIVERY_MODE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleCourses}
          columns={columns}
          getRowKey={(course) => course.id}
          onRowClick={(course) => setSelectedCourseId(course.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileSearch className="size-8 text-text-muted" />

              <h3 className="mt-4 font-bold">{TRAINING_COPY.courses.emptyTitle}</h3>

              <p className="mt-2 text-sm text-text-muted">
                {TRAINING_COPY.courses.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourseId(null)}
        title="Training course"
        description={selectedCourse?.title}
        footer={
          selectedCourse ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => duplicateCourse(selectedCourse)}>
                <Copy />
                Duplicate
              </Button>

              {selectedCourse.status === "published" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedCourse.id, "archived")}
                >
                  <Archive />
                  Archive
                </Button>
              )}

              {selectedCourse.status !== "published" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedCourse.id, "published")}
                >
                  <BookOpenCheck />
                  Publish
                </Button>
              )}

              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                Edit course
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedCourse && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedCourse.title}</h3>

                  <p className="mt-1 text-xs text-text-muted">
                    {selectedCourse.code} Â· Updated{" "}
                    {formatDate(selectedCourse.updatedAt)}
                  </p>
                </div>

                <Badge
                  variant={
                    TRAINING_COURSE_STATUS_CONFIG[selectedCourse.status].badgeVariant
                  }
                >
                  {TRAINING_COURSE_STATUS_CONFIG[selectedCourse.status].label}
                </Badge>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Category</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {TRAINING_CATEGORY_CONFIG[selectedCourse.category].label}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Delivery</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {TRAINING_DELIVERY_MODE_CONFIG[selectedCourse.deliveryMode].label}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Duration</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {formatTrainingDuration(selectedCourse.durationHours)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Passing score</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedCourse.passingScore > 0
                      ? `${selectedCourse.passingScore}%`
                      : "No assessment"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Capacity</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedCourse.capacity}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Certificate validity</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedCourse.certificationValidityMonths > 0
                      ? `${selectedCourse.certificationValidityMonths} months`
                      : "No expiry"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Provider</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedCourse.provider}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Course owner</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedCourse.ownerName}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">Course description</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedCourse.description}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Availability</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge
                  variant={
                    TRAINING_COURSE_SCOPE_CONFIG[selectedCourse.scope].badgeVariant
                  }
                >
                  {TRAINING_COURSE_SCOPE_CONFIG[selectedCourse.scope].label}
                </Badge>

                <Badge variant={selectedCourse.mandatory ? "danger" : "neutral"}>
                  {selectedCourse.mandatory ? "Mandatory" : "Optional"}
                </Badge>

                {selectedCourse.branchName && (
                  <Badge variant="info">{selectedCourse.branchName}</Badge>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Internal note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedCourse.note || "No course note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={editorMode === "create" ? "Add training course" : "Edit training course"}
        description="Configure course content, delivery, assessment and availability."
      >
        {editorMode && (
          <TrainingCourseForm
            key={editorMode === "create" ? "new-training-course" : selectedCourse?.id}
            course={editorMode === "edit" ? (selectedCourse ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveCourse}
          />
        )}
      </Drawer>
    </div>
  );
}
