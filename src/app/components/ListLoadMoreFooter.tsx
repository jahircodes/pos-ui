/**
 * Mobile-first footer: shows visible range and a Load more control for long lists.
 */

export const LOAD_MORE_CHUNK = 25;

export interface ListLoadMoreFooterProps {
  totalCount: number;
  visibleCount: number;
  onLoadMore: () => void;
}

/** Renders load-more actions when the filtered list is longer than the visible slice. */
export function ListLoadMoreFooter({
  totalCount,
  visibleCount,
  onLoadMore,
}: ListLoadMoreFooterProps) {
  if (totalCount === 0) {
    return null;
  }

  const showingEnd = Math.min(visibleCount, totalCount);
  const hasMore = visibleCount < totalCount;

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3">
      <p className="mb-2 text-center text-xs tabular-nums text-gray-500">
        Showing 1–{showingEnd} of {totalCount}
      </p>
      {hasMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-800 active:bg-gray-50"
        >
          Load more
        </button>
      ) : (
        <p className="text-center text-xs text-gray-400">All items loaded</p>
      )}
    </div>
  );
}
