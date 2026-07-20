import { DetailGrid, ToggleDetailList } from "@/components/shared/detail-grid";
import { Badge } from "@/components/ui/badge";
import {
  DOCUMENT_SETTINGS_CONTROL_LABELS,
  DOCUMENT_SETTINGS_SCOPE_CONFIG,
  DOCUMENT_SETTINGS_STATUS_CONFIG,
  DOCUMENT_VISIBILITY_CONFIG,
} from "@/config/documents";
import { formatDate } from "@/lib/date";
import type { DocumentSettings } from "@/types/document";

type DocumentSettingsDetailsProps = {
  settings: DocumentSettings;
};

export function DocumentSettingsDetails({ settings }: DocumentSettingsDetailsProps) {
  const controls = [
    {
      label: DOCUMENT_SETTINGS_CONTROL_LABELS.employeeUploadsAllowed,
      enabled: settings.employeeUploadsAllowed,
    },
    {
      label: DOCUMENT_SETTINGS_CONTROL_LABELS.managerUploadsAllowed,
      enabled: settings.managerUploadsAllowed,
    },
    {
      label: DOCUMENT_SETTINGS_CONTROL_LABELS.verificationRequired,
      enabled: settings.verificationRequired,
    },
    {
      label: DOCUMENT_SETTINGS_CONTROL_LABELS.versionHistoryEnabled,
      enabled: settings.versionHistoryEnabled,
    },
    {
      label: DOCUMENT_SETTINGS_CONTROL_LABELS.electronicSignatureRequired,
      enabled: settings.electronicSignatureRequired,
    },
    {
      label: DOCUMENT_SETTINGS_CONTROL_LABELS.selfServiceDownloadsAllowed,
      enabled: settings.selfServiceDownloadsAllowed,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{settings.name}</h3>
            <p className="mt-1 text-xs text-text-muted">
              Updated by {settings.updatedBy} on {formatDate(settings.updatedAt)}
            </p>
          </div>

          <Badge variant={DOCUMENT_SETTINGS_STATUS_CONFIG[settings.status].badgeVariant}>
            {DOCUMENT_SETTINGS_STATUS_CONFIG[settings.status].label}
          </Badge>
        </div>

        <DetailGrid
          variant="none"
          items={[
            {
              label: "Scope",
              value: DOCUMENT_SETTINGS_SCOPE_CONFIG[settings.scope].label,
            },
            {
              label: "Branch",
              value: settings.branchName ?? "All organization branches",
            },
            {
              label: "Retention",
              value: `${settings.retentionYears} years`,
            },
            {
              label: "Upload limit",
              value: `${settings.maximumUploadMb} MB`,
            },
            {
              label: "First reminder",
              value: `${settings.expiryReminderDays} days before`,
            },
            {
              label: "Second reminder",
              value: `${settings.secondExpiryReminderDays} days before`,
            },
            {
              label: "Default visibility",
              value: DOCUMENT_VISIBILITY_CONFIG[settings.defaultVisibility].label,
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">Allowed file types</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {settings.allowedFileExtensions.map((extension) => (
            <Badge key={extension} variant="neutral">
              {extension}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold">Document controls</h3>
        <ToggleDetailList items={controls} />
      </section>

      <section>
        <h3 className="text-sm font-bold">Internal note</h3>
        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {settings.note || "No document settings note has been added."}
        </p>
      </section>
    </div>
  );
}
