"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Copy,
  FilePenLine,
  FileSearch,
  FileSignature,
  Plus,
  Search,
  Settings2,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { DocumentTabs } from "@/components/documents/document-tabs";
import { createDocumentTemplateColumns } from "@/components/documents/document-table-columns";
import { DocumentTemplateDetails } from "@/components/documents/document-template-details";
import { DocumentTemplateForm } from "@/components/documents/document-template-form";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { IconContainer } from "@/components/shared/icon-container";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DOCUMENT_ACTION_LABELS,
  DOCUMENT_CATEGORY_CONFIG,
  DOCUMENT_TEMPLATE_SCOPE_CONFIG,
  DOCUMENT_TEMPLATE_STATUS_CONFIG,
  DOCUMENTS_COPY,
} from "@/config/documents";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { DOCUMENT_TEMPLATES } from "@/data/documents";
import { templateIsInScope } from "@/lib/documents";
import type { DocumentTemplate, DocumentTemplateStatus } from "@/types/document";

type EditorMode = "create" | "edit" | null;

export function DocumentTemplatesWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [templates, setTemplates] = useState<DocumentTemplate[]>(DOCUMENT_TEMPLATES);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedTemplates = useMemo(
    () => templates.filter((template) => templateIsInScope(template, selectedBranchId)),
    [selectedBranchId, templates],
  );

  const visibleTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedTemplates.filter((template) => {
      const searchableValue = [
        template.title,
        template.code,
        template.branchName,
        template.variables.join(" "),
        template.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableValue.includes(query) &&
        (statusFilter === "all" || template.status === statusFilter) &&
        (categoryFilter === "all" || template.category === categoryFilter) &&
        (scopeFilter === "all" || template.scope === scopeFilter)
      );
    });
  }, [categoryFilter, scopedTemplates, scopeFilter, searchQuery, statusFilter]);

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? null;

  const publishedTemplates = scopedTemplates.filter(
    (template) => template.status === "published",
  );

  const metrics = [
    {
      label: "Published templates",
      value: String(publishedTemplates.length),
      detail: selectedBranch.name,
      icon: FileSignature,
      tone: "success" as const,
    },
    {
      label: "Self-service",
      value: String(publishedTemplates.filter((template) => template.selfService).length),
      detail: "Available to employees",
      icon: CheckCircle2,
      tone: "info" as const,
    },
    {
      label: "Approval required",
      value: String(
        publishedTemplates.filter((template) => template.approvalRequired).length,
      ),
      detail: "Administrator release",
      icon: Settings2,
      tone: "warning" as const,
    },
    {
      label: "Branch templates",
      value: String(
        scopedTemplates.filter((template) => template.scope === "branch").length,
      ),
      detail: "Custom branch documents",
      icon: FilePenLine,
      tone: "info" as const,
    },
  ];

  const columns = createDocumentTemplateColumns({
    onOpen: (template) => setSelectedTemplateId(template.id),
  });

  function saveTemplate(nextTemplate: DocumentTemplate) {
    setTemplates((currentTemplates) => {
      const exists = currentTemplates.some((template) => template.id === nextTemplate.id);

      return exists
        ? currentTemplates.map((template) =>
            template.id === nextTemplate.id ? nextTemplate : template,
          )
        : [nextTemplate, ...currentTemplates];
    });

    setSelectedTemplateId(nextTemplate.id);
    setEditorMode(null);
  }

  function duplicateTemplate(template: DocumentTemplate) {
    const duplicate: DocumentTemplate = {
      ...template,
      id: crypto.randomUUID(),
      title: `${template.title} Copy`,
      code: `${template.code}-COPY`,
      status: "draft",
      version: 1,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };

    setTemplates((currentTemplates) => [duplicate, ...currentTemplates]);
    setSelectedTemplateId(duplicate.id);
  }

  function updateStatus(templateId: string, status: DocumentTemplateStatus) {
    setTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : template,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={DOCUMENTS_COPY.eyebrow}
        title={DOCUMENTS_COPY.templates.title}
        description={DOCUMENTS_COPY.templates.description}
        actions={
          <Button
            onClick={() => {
              setSelectedTemplateId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {DOCUMENT_ACTION_LABELS.createTemplate}
          </Button>
        }
      />

      <div className="mt-7">
        <DocumentTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">
              {DOCUMENTS_COPY.templates.registerTitle}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {DOCUMENTS_COPY.templates.registerDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_13rem_13rem_13rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={DOCUMENTS_COPY.templates.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">{DOCUMENTS_COPY.templates.allCategories}</option>
                {Object.entries(DOCUMENT_CATEGORY_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>

              <Select
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="all">{DOCUMENTS_COPY.templates.allScopes}</option>
                {Object.entries(DOCUMENT_TEMPLATE_SCOPE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{DOCUMENTS_COPY.templates.allStatuses}</option>
                {Object.entries(DOCUMENT_TEMPLATE_STATUS_CONFIG).map(
                  ([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ),
                )}
              </Select>
            </div>
          </div>

          <DataTable
            rows={visibleTemplates}
            columns={columns}
            getRowKey={(template) => template.id}
            onRowClick={(template) => setSelectedTemplateId(template.id)}
            emptyState={
              <EmptyState
                icon={FileSearch}
                title={DOCUMENTS_COPY.templates.emptyTitle}
                description={DOCUMENTS_COPY.templates.emptyDescription}
                action={
                  <Button onClick={() => setEditorMode("create")}>
                    <Plus />
                    {DOCUMENT_ACTION_LABELS.createTemplate}
                  </Button>
                }
              />
            }
          />
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <IconContainer icon={FileSignature} tone="success" />
            <div>
              <h2 className="text-lg font-bold">
                {DOCUMENTS_COPY.templates.coverageTitle}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {DOCUMENTS_COPY.templates.coverageDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {Object.entries(DOCUMENT_CATEGORY_CONFIG).map(([category, config]) => {
              const count = publishedTemplates.filter(
                (template) => template.category === category,
              ).length;

              return (
                <div
                  key={category}
                  className="flex items-center justify-between rounded-control border border-border px-4 py-3"
                >
                  <span className="text-sm font-medium">{config.label}</span>
                  <Badge variant={count > 0 ? "success" : "neutral"}>{count}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedTemplate)}
        onClose={() => setSelectedTemplateId(null)}
        title="Document template"
        description={selectedTemplate?.code}
        footer={
          selectedTemplate ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => duplicateTemplate(selectedTemplate)}
              >
                <Copy />
                {DOCUMENT_ACTION_LABELS.duplicate}
              </Button>

              {selectedTemplate.status === "published" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedTemplate.id, "archived")}
                >
                  <Archive />
                  {DOCUMENT_ACTION_LABELS.archive}
                </Button>
              )}

              {selectedTemplate.status !== "published" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedTemplate.id, "published")}
                >
                  <CheckCircle2 />
                  {DOCUMENT_ACTION_LABELS.publish}
                </Button>
              )}

              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                {DOCUMENT_ACTION_LABELS.editTemplate}
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedTemplate && <DocumentTemplateDetails template={selectedTemplate} />}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create" ? "Add document template" : "Edit document template"
        }
        description="Configure reusable content, merge variables, output and approval controls."
      >
        {editorMode && (
          <DocumentTemplateForm
            key={editorMode === "create" ? "new-document-template" : selectedTemplate?.id}
            template={editorMode === "edit" ? (selectedTemplate ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveTemplate}
          />
        )}
      </Drawer>
    </div>
  );
}
