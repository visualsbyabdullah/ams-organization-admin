import { useCallback, useMemo, useState } from "react";

/**
 * Replaces the `selectedXId` state + `items.find(...)` derivation +
 * `setSelectedXId(null)` close pattern duplicated across workspace files'
 * detail drawers. Does not touch search/filter logic -- that stays
 * bespoke per module since the predicates genuinely differ entity to
 * entity.
 *
 * `select`/`clear` are wrapped in useCallback with stable identity (like
 * a useState setter) so existing `useMemo`/`useCallback` call sites that
 * reference them in an empty dependency array keep working correctly.
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

  const select = useCallback((id: Id) => setSelectedId(id), []);
  const clear = useCallback(() => setSelectedId(null), []);

  return useMemo(
    () => ({ selectedId, selected, select, clear }),
    [selectedId, selected, select, clear],
  );
}
