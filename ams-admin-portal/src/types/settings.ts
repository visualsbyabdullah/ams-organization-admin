export type SettingsSection =
  | "overview"
  | "organization"
  | "security"
  | "notifications"
  | "integrations"
  | "audit";

export type SettingsScope =
  | "organization"
  | "branch";

export type SettingsStatus =
  | "active"
  | "draft"
  | "archived";

export type SettingsCategory =
  | "organization"
  | "security"
  | "notifications";

export type SettingsValue =
  | string
  | number
  | boolean;

export type SettingsProfile = {
  id: string;
  name: string;
  category: SettingsCategory;
  scope: SettingsScope;
  branchId?: string;
  branchName?: string;
  status: SettingsStatus;
  values: Record<string, SettingsValue>;
  updatedAt: string;
  updatedBy: string;
  note: string;
};

export type SettingsFieldType =
  | "text"
  | "number"
  | "time"
  | "select"
  | "switch";

export type SettingsFieldOption = {
  value: string;
  label: string;
};

export type SettingsFieldDefinition = {
  key: string;
  label: string;
  description?: string;
  type: SettingsFieldType;
  minimum?: number;
  options?: SettingsFieldOption[];
};

export type IntegrationType =
  | "email"
  | "attendance"
  | "payroll"
  | "storage"
  | "calendar";

export type IntegrationStatus =
  | "connected"
  | "attention"
  | "disconnected";

export type IntegrationRecord = {
  id: string;
  name: string;
  provider: string;
  type: IntegrationType;
  scope: SettingsScope;
  branchId?: string;
  branchName?: string;
  status: IntegrationStatus;
  syncFrequency: string;
  endpointLabel: string;
  lastSyncAt?: string;
  lastTestAt?: string;
  updatedAt: string;
  updatedBy: string;
  note: string;
};

export type SettingsAuditEntry = {
  id: string;
  category:
    | SettingsCategory
    | "integration";
  action:
    | "created"
    | "updated"
    | "activated"
    | "archived"
    | "connected"
    | "disconnected"
    | "tested";
  scope: SettingsScope;
  branchId?: string;
  branchName?: string;
  entityName: string;
  actorName: string;
  createdAt: string;
  summary: string;
  changes: string[];
};
