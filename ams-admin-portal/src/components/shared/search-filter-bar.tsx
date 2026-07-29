import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SearchFilterBarFilter = {
  value: string;
  onChange: (value: string) => void;
  /** The <option> elements for this dropdown (kept as raw JSX -- option lists
   * vary too much between modules, e.g. conditional options, to model generically). */
  children: ReactNode;
};

type SearchFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters?: readonly SearchFilterBarFilter[];
  /** e.g. "xl:grid-cols-[minmax(0,1fr)_13rem_14rem_14rem]" -- kept as a prop
   * since each module's dropdown widths vary based on its own label lengths. */
  gridClassName: string;
};

/**
 * Replaces the "search icon + input, plus N filter <Select> dropdowns" shell
 * hand-written across ~40 workspace files. Only the shell markup is shared;
 * each module keeps full control of its own filter state, predicate logic,
 * and <option> lists.
 *
 * Usage:
 *   <SearchFilterBar
 *     searchValue={searchQuery}
 *     onSearchChange={setSearchQuery}
 *     searchPlaceholder={COPY.searchPlaceholder}
 *     gridClassName="xl:grid-cols-[minmax(0,1fr)_13rem_14rem_14rem]"
 *     filters={[
 *       {
 *         value: typeFilter,
 *         onChange: setTypeFilter,
 *         children: (
 *           <>
 *             <option value="all">{COPY.allTypes}</option>
 *             {Object.entries(LEAVE_TYPE_CONFIG).map(([value, config]) => (
 *               <option key={value} value={value}>{config.label}</option>
 *             ))}
 *           </>
 *         ),
 *       },
 *     ]}
 *   />
 */
export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  gridClassName,
}: SearchFilterBarProps) {
  return (
    <div className={cn("mt-5 grid gap-3", gridClassName)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {filters.map((filter, index) => (
        <Select
          key={index}
          value={filter.value}
          onChange={(event) => filter.onChange(event.target.value)}
        >
          {filter.children}
        </Select>
      ))}
    </div>
  );
}
