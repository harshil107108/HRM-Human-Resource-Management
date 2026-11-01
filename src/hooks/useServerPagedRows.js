/**
 * useServerPagedRows.js
 * ------------------------------------------------------------------
 * Drives an HpGrid from a server-paged list endpoint (see
 * HRM-backend/utils/pagination.js for the request/response contract).
 *
 *   const paged = useServerPagedRows({
 *     api: api + apiEndpoints.attendance.log.LogGetData,
 *     params: { employeeId },           // extra fixed request fields
 *     mapRow: (item) => ({ ...item, label: "..." }),
 *   });
 *
 *   <HpGrid
 *     rowData={paged.rows}
 *     serverSide
 *     onSearchChange={paged.setSearch}
 *     onColumnFiltersChange={paged.setFilters}
 *     onLoadMore={paged.loadMore}
 *     hasMore={paged.hasMore}
 *     loadingMore={paged.loadingMore}
 *     loadMoreError={paged.loadMoreError}
 *     onRetryLoadMore={paged.retryLoadMore}
 *     totalCount={paged.total}
 *     panding={paged.loading}
 *   />
 *
 * Guarantees
 *  - one request per page: loadMore() is ignored while a page is in flight
 *    or after a failure (until retryLoadMore())
 *  - a change to params / search / filters starts over from page 1, aborts
 *    anything still in flight, and discards responses from the old query
 *    (a slow old response can never overwrite newer results)
 *  - search / filter typing is debounced into one request
 *  - rows are de-duplicated by `_id`, so a record that shifts between pages
 *    while data changes server-side is never shown twice
 *  - a failed NEXT page shows an inline retry; the blocking error dialog is
 *    reserved for the first page, where there is nothing else to show
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import useApiCall from "@/hooks/useApiCall";

let instanceCounter = 0;

export default function useServerPagedRows({
  api,
  params,
  mapRow,
  pageSize = 50,
  debounceMs = 300,
  enabled = true,
}) {
  const { apiCall, cancel } = useApiCall();
  const instanceId = useRef(`pagedRows${++instanceCounter}`).current;
  const firstCallId = `${instanceId}:first`;
  const moreCallId = `${instanceId}:more`;

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, total: 0, hasMore: false });
  // Starts true so the first paint shows the loader, not a flash of "no data".
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [query, setQuery] = useState({ search: "", filters: {} });
  const [reloadToken, setReloadToken] = useState(0);

  // Latest inputs, read inside async code without re-creating callbacks.
  const latest = useRef({});
  useLayoutEffect(() => {
    latest.current = { api, params, mapRow, pageSize, query };
  });

  const generationRef = useRef(0); // bumped on every reset; stamps each request
  const nextPageRef = useRef(1);
  const inFlightRef = useRef(false);
  const seenIdsRef = useRef(new Set());
  const hasMoreRef = useRef(false);

  const fetchPage = useCallback(
    async (page, generation) => {
      const { api: url, params: fixed, mapRow: map, pageSize: limit, query: q } = latest.current;
      const isFirst = page === 1;
      inFlightRef.current = true;
      if (isFirst) setLoading(true);
      else setLoadingMore(true);

      const res = await apiCall({
        id: isFirst ? firstCallId : moreCallId,
        api: url,
        payload: { ...fixed, page, limit, search: q.search, filters: q.filters },
        // Next-page failures are shown inline with a Retry button.
        silent: !isFirst,
      });

      if (generation !== generationRef.current) return; // superseded: drop silently
      inFlightRef.current = false;
      if (isFirst) setLoading(false);
      else setLoadingMore(false);
      if (res.aborted) return;

      if (!res.success) {
        if (!isFirst) {
          setLoadMoreError(
            res.error?.response?.data?.message || "Couldn't load more records.",
          );
        }
        return;
      }

      const body = res.data || {};
      const incoming = [];
      for (const item of body.data || []) {
        const key = String(item?._id ?? "");
        if (key && seenIdsRef.current.has(key)) continue;
        if (key) seenIdsRef.current.add(key);
        incoming.push(typeof map === "function" ? map(item) : item);
      }

      setRows((prev) => (isFirst ? incoming : prev.concat(incoming)));
      nextPageRef.current = page + 1;
      hasMoreRef.current = !!body.pagination?.hasMore;
      setPagination({
        page,
        total: body.pagination?.total ?? 0,
        hasMore: hasMoreRef.current,
      });
    },
    [apiCall, firstCallId, moreCallId],
  );

  // Start over whenever the query (params / search / filters) changes.
  const paramsKey = JSON.stringify(params ?? null);
  const queryKey = JSON.stringify(query);
  useEffect(() => {
    if (!enabled) return undefined;
    const generation = ++generationRef.current;
    cancel(firstCallId);
    cancel(moreCallId);
    seenIdsRef.current = new Set();
    nextPageRef.current = 1;
    hasMoreRef.current = false;
    inFlightRef.current = false;
    setLoadMoreError(null);
    setLoadingMore(false);
    fetchPage(1, generation);
    return () => {
      // Invalidates any in-flight response (also covers unmount).
      generationRef.current += 1;
      cancel(firstCallId);
      cancel(moreCallId);
    };
  }, [enabled, paramsKey, queryKey, reloadToken, fetchPage, cancel, firstCallId, moreCallId]);

  const loadMore = useCallback(() => {
    if (inFlightRef.current || !hasMoreRef.current) return;
    fetchPage(nextPageRef.current, generationRef.current);
  }, [fetchPage]);

  const retryLoadMore = useCallback(() => {
    if (inFlightRef.current) return;
    setLoadMoreError(null);
    fetchPage(nextPageRef.current, generationRef.current);
  }, [fetchPage]);

  // Refetch from page 1 with the current query (after add / edit / delete).
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  // Debounced search / column filters. The grid may call these from inside
  // its own state updater, so they only write refs + a timer - never React
  // state directly.
  const pendingQuery = useRef({ search: "", filters: {} });
  const timer = useRef(null);
  const scheduleCommit = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const next = pendingQuery.current;
      setQuery((prev) =>
        prev.search === next.search &&
        JSON.stringify(prev.filters) === JSON.stringify(next.filters)
          ? prev
          : { search: next.search, filters: next.filters },
      );
    }, debounceMs);
  }, [debounceMs]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const setSearch = useCallback(
    (term) => {
      pendingQuery.current = { ...pendingQuery.current, search: String(term ?? "").trim() };
      scheduleCommit();
    },
    [scheduleCommit],
  );
  const setFilters = useCallback(
    (filters) => {
      pendingQuery.current = { ...pendingQuery.current, filters: { ...(filters || {}) } };
      scheduleCommit();
    },
    [scheduleCommit],
  );

  return useMemo(
    () => ({
      rows,
      total: pagination.total,
      hasMore: pagination.hasMore,
      loading,
      loadingMore,
      loadMoreError,
      loadMore,
      retryLoadMore,
      reload,
      setSearch,
      setFilters,
    }),
    [rows, pagination, loading, loadingMore, loadMoreError, loadMore, retryLoadMore, reload, setSearch, setFilters],
  );
}
