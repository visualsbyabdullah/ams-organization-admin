import { DetailGrid } from "@/components/shared/detail-grid";
import { Badge } from "@/components/ui/badge";
import {
  DOCUMENT_CATEGORY_CONFIG,
  DOCUMENT_TEMPLATE_OUTPUT_CONFIG,
  DOCUMENT_TEMPLATE_SCOPE_CONFIG,
  DOCUMENT_TEMPLATE_STATUS_CONFIG,
} from "@/config/documents";
import { formatDate } from "@/lib/date";
import type { DocumentTemplate } from "@/types/document";

type DocumentTemplateDetailsProps = {
  template: DocumentTemplate;
};

export function DocumentTemplateDetails({ template }: DocumentTemplateDetailsProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{template.title}</h3>
            <p className="mt-1 text-xs text-text-muted">
              {template.code} Â· v{template.version}
            </p>
          </div>

          <Badge variant={DOCUMENT_TEMPLATE_STATUS_CONFIG[template.status].badgeVariant}>
            {DOCUMENT_TEMPLATE_STATUS_CONFIG[template.status].label}
          </Badge>
        </div>

        <DetailGrid
          variant="none"
          items={[
            {
              label: "Category",
              value: (
                <Badge variant={DOCUMENT_CATEGORY_CONFIG[template.category].badgeVariant}>
                  {DOCUMENT_CATEGORY_CONFIG[template.category].label}
                </Badge>
              ),
            },
            {
              label: "Scope",
              value: (
                <Badge
                  variant={DOCUMENT_TEMPLATE_SCOPE_CONFIG[template.scope].badgeVariant}
                >
                  {DOCUMENT_TEMPLATE_SCOPE_CONFIG[template.scope].label}
                </Badge>
              ),
            },
            {
              label: "Branch",
              value: template.branchName ?? "All organization branches",
            },
            {
              label: "Output format",
              value: DOCUMENT_TEMPLATE_OUTPUT_CONFIG[template.outputFormat].label,
            },
            {
              label: "Self-service",
              value: (
                <Badge variant={template.selfService ? "success" : "neutral"}>
                  {template.selfService ? "Enabled" : "Disabled"}
                </Badge>
              ),
            },
            {
              label: "Approval",
              value: (
                <Badge variant={template.approvalRequired ? "warning" : "neutral"}>
                  {template.approvalRequired ? "Required" : "Not required"}
                </Badge>
              ),
            },
            {
              label: "Updated",
              value: formatDate(template.updatedAt),
            },
            {
              label: "Updated by",
              value: template.updatedBy,
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">Description</h3>
        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {template.description}
        </p>
      </section>

      <section>
        <h3 className="text-sm font-bold">Merge variables</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {template.variables.length > 0 ? (
            template.variables.map((variable) => (
              <Badge key={variable} variant="neutral">
                {variable}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-text-muted">No merge variables are configured.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold">Internal note</h3>
        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {template.note || "No template note has been added."}
        </p>
      </section>
    </div>
  );
}
