import {
  SETTINGS_FIELD_CONFIG,
} from "@/config/settings";
import type {
  SettingsCategory,
  SettingsProfile,
  SettingsValue,
} from "@/types/settings";

const dateTimeFormatter =
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function formatSettingsDateTime(
  value: string,
) {
  return dateTimeFormatter.format(
    new Date(value),
  );
}

export function settingsRecordIsInScope(
  record: {
    scope: "organization" | "branch";
    branchId?: string;
  },
  selectedBranchId: string,
) {
  return (
    selectedBranchId === "all" ||
    record.scope === "organization" ||
    record.branchId === selectedBranchId
  );
}

export function resolveEffectiveProfile(
  profiles: SettingsProfile[],
  category: SettingsCategory,
  selectedBranchId: string,
) {
  const categoryProfiles =
    profiles.filter(
      (profile) =>
        profile.category === category &&
        profile.status === "active",
    );

  if (selectedBranchId !== "all") {
    const branchProfile =
      categoryProfiles.find(
        (profile) =>
          profile.scope === "branch" &&
          profile.branchId ===
            selectedBranchId,
      );

    if (branchProfile) {
      return branchProfile;
    }
  }

  return (
    categoryProfiles.find(
      (profile) =>
        profile.scope ===
        "organization",
    ) ?? null
  );
}

export function formatSettingsValue(
  value: SettingsValue,
) {
  if (typeof value === "boolean") {
    return value
      ? "Enabled"
      : "Disabled";
  }

  return String(value);
}

export function getProfileSummary(
  profile: SettingsProfile,
) {
  return SETTINGS_FIELD_CONFIG[
    profile.category
  ]
    .slice(0, 3)
    .map((field) => ({
      label: field.label,
      value: formatSettingsValue(
        profile.values[field.key] ??
          "Not configured",
      ),
    }));
}

export function createDefaultValues(
  category: SettingsCategory,
) {
  return Object.fromEntries(
    SETTINGS_FIELD_CONFIG[
      category
    ].map((field) => [
      field.key,
      field.type === "switch"
        ? false
        : field.type === "number"
          ? field.minimum ?? 0
          : field.options?.[0]
              ?.value ?? "",
    ]),
  );
}
