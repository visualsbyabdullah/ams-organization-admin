export type DocumentCategory =
  | "identity"
  | "employment"
  | "payroll"
  | "compliance"
  | "legal"
  | "finance"
  | "policy"
  | "certificate"
  | "other";

export type DocumentOwnerType =
  | "employee"
  | "branch"
  | "organization";

export type DocumentVisibility =
  | "private"
  | "employee"
  | "managers"
  | "organization";

export type DocumentStatus =
  | "draft"
  | "pending_verification"
  | "verified"
  | "rejected"
  | "expiring"
  | "expired"
  | "archived";

export type DocumentRequestStatus =
  | "open"
  | "submitted"
  | "fulfilled"
  | "overdue"
  | "cancelled";

export type DocumentTemplateStatus =
  | "draft"
  | "published"
  | "archived";

export type DocumentTemplateScope =
  | "organization"
  | "branch";

export type DocumentTemplateOutput =
  | "pdf"
  | "docx";

export type DocumentSettingsScope =
  | "organization"
  | "branch";

export type DocumentSettingsStatus =
  | "active"
  | "draft"
  | "archived";

export type DocumentRecord = {
  id: string;
  title: string;
  documentNumber: string;
  category: DocumentCategory;
  ownerType: DocumentOwnerType;
  employeeId?: string;
  branchId?: string;
  branchName?: string;
  visibility: DocumentVisibility;
  status: DocumentStatus;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  version: number;
  issueDate?: string;
  expiryDate?: string;
  uploadedAt: string;
  uploadedBy: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  tags: string[];
  note: string;
};

export type DocumentRequest = {
  id: string;
  title: string;
  category: DocumentCategory;
  employeeId: string;
  branchId: string;
  status: DocumentRequestStatus;
  requestedAt: string;
  dueDate: string;
  submittedAt?: string;
  fulfilledAt?: string;
  linkedDocumentId?: string;
  mandatory: boolean;
  requestedBy: string;
  note: string;
};

export type DocumentTemplate = {
  id: string;
  title: string;
  code: string;
  category: DocumentCategory;
  scope: DocumentTemplateScope;
  branchId?: string;
  branchName?: string;
  status: DocumentTemplateStatus;
  outputFormat: DocumentTemplateOutput;
  version: number;
  variables: string[];
  selfService: boolean;
  approvalRequired: boolean;
  description: string;
  updatedAt: string;
  updatedBy: string;
  note: string;
};

export type DocumentSettings = {
  id: string;
  name: string;
  scope: DocumentSettingsScope;
  branchId?: string;
  branchName?: string;
  status: DocumentSettingsStatus;
  retentionYears: number;
  expiryReminderDays: number;
  secondExpiryReminderDays: number;
  maximumUploadMb: number;
  allowedFileExtensions: string[];
  defaultVisibility: DocumentVisibility;
  employeeUploadsAllowed: boolean;
  managerUploadsAllowed: boolean;
  verificationRequired: boolean;
  versionHistoryEnabled: boolean;
  electronicSignatureRequired: boolean;
  selfServiceDownloadsAllowed: boolean;
  updatedAt: string;
  updatedBy: string;
  note: string;
};

export type DocumentTrendPoint = {
  month: string;
  uploaded: number;
  verified: number;
  expired: number;
};
