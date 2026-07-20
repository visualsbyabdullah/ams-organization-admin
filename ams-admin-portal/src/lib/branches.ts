import { BRANCH_MAP_CONFIG, BRANCH_WORKING_DAY_CONFIG } from "@/config/branches";
import type { BranchRecord } from "@/types/branch";

export function getBranchCapacityUtilization(branch: BranchRecord) {
  if (branch.capacity <= 0) {
    return 0;
  }

  return Math.min(Math.round((branch.employeeCount / branch.capacity) * 100), 100);
}

export function getBranchCoordinates(
  branch: Pick<BranchRecord, "latitude" | "longitude">,
) {
  return `${branch.latitude.toFixed(4)}, ${branch.longitude.toFixed(4)}`;
}

export function getOpenStreetMapEmbedUrl(
  branch: Pick<BranchRecord, "latitude" | "longitude">,
) {
  const { latitudeDelta, longitudeDelta, openStreetMapLayer } = BRANCH_MAP_CONFIG;

  const minimumLongitude = branch.longitude - longitudeDelta;
  const maximumLongitude = branch.longitude + longitudeDelta;
  const minimumLatitude = branch.latitude - latitudeDelta;
  const maximumLatitude = branch.latitude + latitudeDelta;

  const parameters = new URLSearchParams({
    bbox: [minimumLongitude, minimumLatitude, maximumLongitude, maximumLatitude].join(
      ",",
    ),
    layer: openStreetMapLayer,
    marker: [branch.latitude, branch.longitude].join(","),
  });

  return `https://www.openstreetmap.org/export/embed.html?${parameters.toString()}`;
}

export function getOpenStreetMapPageUrl(
  branch: Pick<BranchRecord, "latitude" | "longitude">,
) {
  const parameters = new URLSearchParams({
    mlat: String(branch.latitude),
    mlon: String(branch.longitude),
  });

  return `https://www.openstreetmap.org/?${parameters.toString()}#map=16/${branch.latitude}/${branch.longitude}`;
}

export function formatBranchWorkingDays(branch: BranchRecord) {
  return branch.workingDays
    .map((day) => BRANCH_WORKING_DAY_CONFIG[day].shortLabel)
    .join(", ");
}

export function createBranchId(code: string) {
  const normalized = code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `branch-${crypto.randomUUID()}`;
}
