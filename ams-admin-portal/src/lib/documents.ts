import type {
  DocumentRecord,
  DocumentRequest,
  DocumentSettings,
  DocumentTemplate,
} from "@/types/document";

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function getDaysUntil(
  dateValue: string,
  referenceDate: string,
) {
  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.ceil(
    (parseDate(dateValue).getTime() -
      parseDate(referenceDate).getTime()) /
      millisecondsPerDay,
  );
}

export function isDocumentExpired(
  document: DocumentRecord,
  referenceDate: string,
) {
  return Boolean(
    document.expiryDate &&
      getDaysUntil(
        document.expiryDate,
        referenceDate,
      ) < 0,
  );
}

export function isDocumentExpiring(
  document: DocumentRecord,
  referenceDate: string,
  reminderDays: number,
) {
  if (!document.expiryDate) {
    return false;
  }

  const daysUntilExpiry =
    getDaysUntil(
      document.expiryDate,
      referenceDate,
    );

  return (
    daysUntilExpiry >= 0 &&
    daysUntilExpiry <= reminderDays
  );
}

export function documentIsInScope(
  document: DocumentRecord,
  selectedBranchId: string,
) {
  return (
    selectedBranchId === "all" ||
    document.ownerType ===
      "organization" ||
    document.branchId ===
      selectedBranchId
  );
}

export function requestIsInScope(
  request: DocumentRequest,
  selectedBranchId: string,
) {
  return (
    selectedBranchId === "all" ||
    request.branchId ===
      selectedBranchId
  );
}

export function templateIsInScope(
  template: DocumentTemplate,
  selectedBranchId: string,
) {
  return (
    selectedBranchId === "all" ||
    template.scope ===
      "organization" ||
    template.branchId ===
      selectedBranchId
  );
}

export function settingsAreInScope(
  settings: DocumentSettings,
  selectedBranchId: string,
) {
  return (
    selectedBranchId === "all" ||
    settings.scope ===
      "organization" ||
    settings.branchId ===
      selectedBranchId
  );
}

export function resolveDocumentSettings(
  settings: DocumentSettings[],
  selectedBranchId: string,
) {
  const organizationDefault =
    settings.find(
      (item) =>
        item.scope ===
          "organization" &&
        item.status === "active",
    ) ?? null;

  if (selectedBranchId === "all") {
    return organizationDefault;
  }

  const branchOverride =
    settings.find(
      (item) =>
        item.scope === "branch" &&
        item.branchId ===
          selectedBranchId &&
        item.status === "active",
    ) ?? null;

  return (
    branchOverride ??
    organizationDefault
  );
}

export function formatFileSize(
  bytes: number,
) {
  if (bytes <= 0) {
    return "0 KB";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const unitIndex = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes /
    1024 ** unitIndex;

  return `${value.toFixed(
    unitIndex === 0 ? 0 : 1,
  )} ${units[unitIndex]}`;
}

function escapeCsvValue(
  value:
    | string
    | number
    | boolean
    | undefined
    | null,
) {
  const text =
    value === undefined ||
    value === null
      ? ""
      : String(value);

  return `"${text.replace(
    /"/g,
    '""',
  )}"`;
}

export function downloadCsv(
  fileName: string,
  headers: readonly string[],
  rows: readonly (
    readonly (
      | string
      | number
      | boolean
      | undefined
      | null
    )[]
  )[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const content = [
    headers.map(
      escapeCsvValue,
    ),
    ...rows.map((row) =>
      row.map(
        escapeCsvValue,
      ),
    ),
  ]
    .map((row) =>
      row.join(","),
    )
    .join("\n");

  const blob = new Blob(
    [content],
    {
      type: "text/csv;charset=utf-8",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    window.document.createElement(
      "a",
    );

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}
