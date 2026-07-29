"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  Archive,
  BookOpen,
  CheckCircle2,
  Copy,
  Eye,
  FilePenLine,
  Plus,
  Search,
  ThumbsUp,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { FormField } from "@/components/forms/form-field";
import { SupportTabs } from "@/components/support/support-tabs";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DetailGrid } from "@/components/shared/detail-grid";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  SUPPORT_ACTION_LABELS,
  SUPPORT_ARTICLE_STATUS_CONFIG,
  SUPPORT_ARTICLE_VISIBILITY_CONFIG,
  SUPPORT_COPY,
  SUPPORT_SCOPE_CONFIG,
} from "@/config/support";
import { useBranchScope } from "@/context/branch-scope-context";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { SUPPORT_ARTICLES, SUPPORT_CATEGORIES } from "@/data/support";
import { formatDate } from "@/lib/date";
import type {
  SupportArticle,
  SupportArticleStatus,
  SupportArticleVisibility,
  SupportScope,
} from "@/types/support";

function ArticleForm({
  article,
  selectedBranchId,
  onCancel,
  onSave,
}: {
  article?: SupportArticle;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (article: SupportArticle) => void;
}) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [categoryId, setCategoryId] = useState(
    article?.categoryId ?? SUPPORT_CATEGORIES[0]?.id ?? "",
  );
  const [scope, setScope] = useState<SupportScope>(article?.scope ?? "organization");
  const [branchId, setBranchId] = useState(
    article?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<SupportArticleStatus>(article?.status ?? "draft");
  const [visibility, setVisibility] = useState<SupportArticleVisibility>(
    article?.visibility ?? "employees",
  );
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [tags, setTags] = useState(article?.tags.join(", ") ?? "");
  const [submitted, setSubmitted] = useState(false);

  function slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (
      !title.trim() ||
      !categoryId ||
      !summary.trim() ||
      !content.trim() ||
      (scope === "branch" && !branchId)
    ) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);
    const actionDate = new Date().toISOString().slice(0, 10);

    onSave({
      id: article?.id ?? crypto.randomUUID(),
      title: title.trim(),
      slug: article?.slug ?? slugify(title),
      categoryId,
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      visibility,
      summary: summary.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      helpfulCount: article?.helpfulCount ?? 0,
      notHelpfulCount: article?.notHelpfulCount ?? 0,
      publishedAt:
        status === "published" ? (article?.publishedAt ?? actionDate) : undefined,
      updatedAt: actionDate,
      updatedBy: CURRENT_ADMIN.name,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Article title"
          htmlFor="supportArticleTitle"
          error={submitted && !title.trim() ? "Enter an article title" : undefined}
        >
          <Input
            id="supportArticleTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: How to request an attendance correction"
          />
        </FormField>

        <FormField
          label="Category"
          htmlFor="supportArticleCategory"
          error={submitted && !categoryId ? "Select a category" : undefined}
        >
          <Select
            id="supportArticleCategory"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {SUPPORT_CATEGORIES.filter((category) => category.status === "active").map(
              (category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField label="Scope" htmlFor="supportArticleScope">
          <Select
            id="supportArticleScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as SupportScope)}
          >
            {Object.entries(SUPPORT_SCOPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="supportArticleBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="supportArticleBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.filter((branch) => !branch.isAggregate).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Status" htmlFor="supportArticleStatus">
          <Select
            id="supportArticleStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as SupportArticleStatus)}
          >
            {Object.entries(SUPPORT_ARTICLE_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Visibility" htmlFor="supportArticleVisibility">
          <Select
            id="supportArticleVisibility"
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as SupportArticleVisibility)
            }
          >
            {Object.entries(SUPPORT_ARTICLE_VISIBILITY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Tags" htmlFor="supportArticleTags" optional>
          <Input
            id="supportArticleTags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="attendance, correction, timesheet"
          />
        </FormField>
      </div>

      <FormField
        label="Article summary"
        htmlFor="supportArticleSummary"
        error={submitted && !summary.trim() ? "Enter an article summary" : undefined}
      >
        <Textarea
          id="supportArticleSummary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Describe what this article helps employees complete..."
        />
      </FormField>

      <FormField
        label="Article content"
        htmlFor="supportArticleContent"
        error={submitted && !content.trim() ? "Enter article content" : undefined}
      >
        <Textarea
          id="supportArticleContent"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-48"
          placeholder="Write the complete employee guidance..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {SUPPORT_ACTION_LABELS.cancel}
        </Button>
        <Button type="submit">{article ? "Save article" : "Create article"}</Button>
      </div>
    </form>
  );
}

export function SupportKnowledgeBaseWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [articles, setArticles] = useState<SupportArticle[]>(SUPPORT_ARTICLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const articleSelection = useEntitySelection(articles, (article) => article.id);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scopedArticles = useMemo(
    () =>
      articles.filter(
        (article) =>
          selectedBranch.isAggregate ||
          article.scope === "organization" ||
          article.branchId === selectedBranch.id,
      ),
    [articles, selectedBranch],
  );

  const visibleArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scopedArticles.filter((article) => {
      const category = SUPPORT_CATEGORIES.find((item) => item.id === article.categoryId);
      const searchable = [
        article.title,
        article.summary,
        article.updatedBy,
        article.tags.join(" "),
        category?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(query) &&
        (statusFilter === "all" || article.status === statusFilter) &&
        (visibilityFilter === "all" || article.visibility === visibilityFilter)
      );
    });
  }, [scopedArticles, searchQuery, statusFilter, visibilityFilter]);

  const selectedArticle = articleSelection.selected;
  const publishedArticles = scopedArticles.filter(
    (article) => article.status === "published",
  );
  const draftArticles = scopedArticles.filter((article) => article.status === "draft");
  const totalHelpful = publishedArticles.reduce(
    (total, article) => total + article.helpfulCount,
    0,
  );
  const totalFeedback = publishedArticles.reduce(
    (total, article) => total + article.helpfulCount + article.notHelpfulCount,
    0,
  );
  const helpfulRate = totalFeedback
    ? Math.round((totalHelpful / totalFeedback) * 100)
    : 0;
  const employeeArticles = publishedArticles.filter(
    (article) => article.visibility === "employees",
  );

  const metrics = [
    {
      label: "Published articles",
      value: String(publishedArticles.length),
      detail: selectedBranch.name,
      icon: BookOpen,
      tone: "success" as const,
    },
    {
      label: "Draft articles",
      value: String(draftArticles.length),
      detail: "Waiting for publication",
      icon: FilePenLine,
      tone: "warning" as const,
    },
    {
      label: "Employee guidance",
      value: String(employeeArticles.length),
      detail: "Visible to all employees",
      icon: Eye,
      tone: "info" as const,
    },
    {
      label: "Helpful feedback",
      value: `${helpfulRate}%`,
      detail: "Across published articles",
      icon: ThumbsUp,
      tone: "success" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<SupportArticle>[]>(
    () => [
      {
        id: "article",
        header: "Article",
        cell: (article) => (
          <div>
            <p className="font-semibold">{article.title}</p>
            <p className="mt-1 max-w-80 truncate text-xs text-text-muted">
              {article.summary}
            </p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        cell: (article) =>
          SUPPORT_CATEGORIES.find((category) => category.id === article.categoryId)
            ?.name ?? "Unassigned",
      },
      {
        id: "scope",
        header: "Scope",
        cell: (article) => (
          <Badge variant={SUPPORT_SCOPE_CONFIG[article.scope].badgeVariant}>
            {SUPPORT_SCOPE_CONFIG[article.scope].label}
          </Badge>
        ),
      },
      {
        id: "visibility",
        header: "Visibility",
        cell: (article) => (
          <Badge
            variant={SUPPORT_ARTICLE_VISIBILITY_CONFIG[article.visibility].badgeVariant}
          >
            {SUPPORT_ARTICLE_VISIBILITY_CONFIG[article.visibility].label}
          </Badge>
        ),
      },
      {
        id: "helpful",
        header: "Helpful",
        cell: (article) =>
          article.status === "published"
            ? `${article.helpfulCount} / ${
                article.helpfulCount + article.notHelpfulCount
              }`
            : "Not published",
      },
      {
        id: "updated",
        header: "Updated",
        cell: (article) => formatDate(article.updatedAt),
      },
      {
        id: "status",
        header: "Status",
        cell: (article) => (
          <Badge variant={SUPPORT_ARTICLE_STATUS_CONFIG[article.status].badgeVariant}>
            {SUPPORT_ARTICLE_STATUS_CONFIG[article.status].label}
          </Badge>
        ),
      },
    ],
    [],
  );

  function saveArticle(article: SupportArticle) {
    setArticles((current) => {
      const exists = current.some((item) => item.id === article.id);
      return exists
        ? current.map((item) => (item.id === article.id ? article : item))
        : [article, ...current];
    });
    setEditorMode(null);
    articleSelection.select(article.id);
  }

  function updateStatus(status: SupportArticle["status"]) {
    if (!selectedArticle) return;
    const actionDate = new Date().toISOString().slice(0, 10);
    setArticles((current) =>
      current.map((article) =>
        article.id === selectedArticle.id
          ? {
              ...article,
              status,
              publishedAt:
                status === "published" ? (article.publishedAt ?? actionDate) : undefined,
              updatedAt: actionDate,
              updatedBy: CURRENT_ADMIN.name,
            }
          : article,
      ),
    );
  }

  function duplicateArticle() {
    if (!selectedArticle) return;
    const duplicate: SupportArticle = {
      ...selectedArticle,
      id: crypto.randomUUID(),
      title: `${selectedArticle.title} Copy`,
      slug: `${selectedArticle.slug}-copy`,
      status: "draft",
      publishedAt: undefined,
      helpfulCount: 0,
      notHelpfulCount: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };
    setArticles((current) => [duplicate, ...current]);
    articleSelection.select(duplicate.id);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={SUPPORT_COPY.knowledge.eyebrow}
        title={SUPPORT_COPY.knowledge.title}
        description={SUPPORT_COPY.knowledge.description}
        actions={
          <Button
            onClick={() => {
              articleSelection.clear();
              setEditorMode("create");
            }}
          >
            <Plus />
            {SUPPORT_COPY.knowledge.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <SupportTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{SUPPORT_COPY.knowledge.registerTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {SUPPORT_COPY.knowledge.registerDescription}
          </p>
          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={SUPPORT_COPY.knowledge.searchPlaceholder}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.knowledge.allStatuses}</option>
              {Object.entries(SUPPORT_ARTICLE_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
            <Select
              value={visibilityFilter}
              onChange={(event) => setVisibilityFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.knowledge.allVisibility}</option>
              {Object.entries(SUPPORT_ARTICLE_VISIBILITY_CONFIG).map(
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
          rows={visibleArticles}
          columns={columns}
          getRowKey={(article) => article.id}
          onRowClick={(article) => articleSelection.select(article.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <BookOpen className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">{SUPPORT_COPY.knowledge.emptyTitle}</h3>
              <p className="mt-2 text-sm text-text-muted">
                {SUPPORT_COPY.knowledge.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedArticle)}
        onClose={() => articleSelection.clear()}
        title="Knowledge article"
        description={selectedArticle?.title}
        footer={
          selectedArticle ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={duplicateArticle}>
                <Copy />
                {SUPPORT_ACTION_LABELS.duplicate}
              </Button>
              {selectedArticle.status === "draft" && (
                <Button variant="outline" onClick={() => updateStatus("published")}>
                  <CheckCircle2 />
                  {SUPPORT_ACTION_LABELS.publish}
                </Button>
              )}
              {selectedArticle.status === "published" && (
                <Button variant="outline" onClick={() => updateStatus("draft")}>
                  {SUPPORT_ACTION_LABELS.unpublish}
                </Button>
              )}
              {selectedArticle.status !== "archived" && (
                <Button variant="outline" onClick={() => updateStatus("archived")}>
                  <Archive />
                  {SUPPORT_ACTION_LABELS.archive}
                </Button>
              )}
              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                {SUPPORT_ACTION_LABELS.edit}
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedArticle && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedArticle.title}</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    /support/{selectedArticle.slug}
                  </p>
                </div>
                <Badge
                  variant={
                    SUPPORT_ARTICLE_STATUS_CONFIG[selectedArticle.status].badgeVariant
                  }
                >
                  {SUPPORT_ARTICLE_STATUS_CONFIG[selectedArticle.status].label}
                </Badge>
              </div>
              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Category",
                    value:
                      SUPPORT_CATEGORIES.find(
                        (category) => category.id === selectedArticle.categoryId,
                      )?.name ?? "Unassigned",
                  },
                  {
                    label: "Visibility",
                    value:
                      SUPPORT_ARTICLE_VISIBILITY_CONFIG[selectedArticle.visibility].label,
                  },
                  {
                    label: "Updated",
                    value: formatDate(selectedArticle.updatedAt),
                  },
                  {
                    label: "Updated by",
                    value: selectedArticle.updatedBy,
                  },
                ]}
              />
            </section>
            <section>
              <h3 className="text-sm font-bold">Summary</h3>
              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedArticle.summary}
              </p>
            </section>
            <section>
              <h3 className="text-sm font-bold">Article content</h3>
              <p className="mt-2 whitespace-pre-wrap rounded-control bg-canvas p-4 text-sm leading-7 text-text-muted">
                {selectedArticle.content}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create" ? "Add knowledge article" : "Edit knowledge article"
        }
        description="Create reusable employee guidance with controlled scope and visibility."
      >
        {editorMode && (
          <ArticleForm
            key={editorMode === "create" ? "new-support-article" : selectedArticle?.id}
            article={editorMode === "edit" ? (selectedArticle ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveArticle}
          />
        )}
      </Drawer>
    </div>
  );
}
