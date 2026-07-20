import {
  ExternalLink,
  MapPinned,
} from "lucide-react";

import {
  BRANCH_COPY,
} from "@/config/branches";
import {
  getBranchCoordinates,
  getOpenStreetMapEmbedUrl,
  getOpenStreetMapPageUrl,
} from "@/lib/branches";
import type {
  BranchRecord,
} from "@/types/branch";

type BranchMapProps = {
  branch: BranchRecord;
  compact?: boolean;
};

export function BranchMap({
  branch,
  compact = false,
}: BranchMapProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <div
        className={
          compact ? "h-44" : "h-72"
        }
      >
        <iframe
          title={`${branch.name} map`}
          src={getOpenStreetMapEmbedUrl(
            branch,
          )}
          className="size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPinned
            size={16}
            className="text-primary"
          />
          <span className="text-sm font-semibold">
            {getBranchCoordinates(branch)}
          </span>
        </div>

        <a
          href={getOpenStreetMapPageUrl(
            branch,
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
        >
          {BRANCH_COPY.actions.openMap}
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
}
