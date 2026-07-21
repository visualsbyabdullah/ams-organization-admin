import { useMemo, useState } from "react";

/**
 * Replaces the `selectedXId` state + `items.find(...)` derivation +
 * `setSelectedXId(null)` close pattern duplicated across workspace files'
 * detail drawers. Does not touch search/filter logic -- that stays
 * bespoke per module since the predicates genuinely differ entity to
 * entity.
 *
 * Usage:
 *   const requestSelection = useEntitySelection(requests, (r) => r.id);
 *   ...
 *   <Drawer open={Boolean(requestSelection.selected)} onClose={requestSelection.clear}>
 *     {requestSelection.selected && <RequestReview request={requestSelection.selected} />}
 *   </Drawer>
 *   <button onClick={() => requestSelection.select(request.id)}>View</button>
 */
export function useEntitySelection<T, Id extends string | number = string>(
  items: readonly T[],
  getId: (item: T) => Id,
) {
  const [selectedId, setSelectedId] = useState<Id | null>(null);

  const selected = useMemo(
    () => items.find((item) => getId(item) === selectedId) ?? null,
    [items, getId, selectedId],
  );

  return {
    selectedId,
    selected,
    select: (id: Id) => setSelectedId(id),
    clear: () => setSelectedId(null),
  };
}
