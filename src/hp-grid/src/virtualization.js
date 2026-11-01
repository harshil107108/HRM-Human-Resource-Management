/**
 * virtualization.js
 * ------------------------------------------------------------------
 * Row windowing for HpGrid. Pure math lives here (unit-tested in
 * virtualization.test.js); the React wiring lives in HpGrid.jsx.
 *
 * Rows have a fixed height, so the visible window is a simple division -
 * no per-row measuring. Only the rows in [start, end) are mounted; the
 * rest of the scroll height is reserved by padding (top) and a spacer
 * (bottom) so the scrollbar and scroll position stay exact.
 * ------------------------------------------------------------------
 */

// Grids with this many rows or fewer render exactly as before. Small
// grids gain nothing from windowing, so they keep the zero-risk path.
export const VIRTUALIZE_THRESHOLD = 100;

// Rows mounted above and below the viewport, so fast scrolling doesn't
// flash blank space before the next frame renders.
export const OVERSCAN_ROWS = 12;

/**
 * @param {object} p
 * @param {number} p.scrollTop      px the viewport top is below the body top
 *                                  (negative while the body is still below it)
 * @param {number} p.viewportHeight px height of the scroll viewport
 * @param {number} p.rowStride      px from one row's top to the next
 * @param {number} p.rowCount       total rows
 * @param {number} [p.overscan]
 * @returns {{start:number, end:number}} half-open range of rows to mount
 */
export function computeWindow({
  scrollTop,
  viewportHeight,
  rowStride,
  rowCount,
  overscan = OVERSCAN_ROWS,
}) {
  if (!(rowCount > 0) || !(rowStride > 0)) return { start: 0, end: 0 };

  const top = Math.max(0, scrollTop);
  const bottom = Math.max(0, scrollTop + viewportHeight);

  let start = Math.floor(top / rowStride) - overscan;
  start = Math.min(Math.max(0, start), rowCount);
  // Keep `start` even: the zebra stripe is `:nth-child(even)`, and the
  // first mounted row must keep the same parity it has in the full list.
  start -= start % 2;

  const end = Math.min(rowCount, Math.ceil(bottom / rowStride) + overscan);
  return { start, end: Math.max(start, end) };
}

/**
 * Scroll offset that brings row `index` fully into view, or `null` when
 * it already is. `stickyTop` is the height of the pinned header rows that
 * cover the top of the viewport.
 */
export function scrollTopToReveal({
  index,
  rowStride,
  bodyTop,
  stickyTop,
  scrollTop,
  viewportHeight,
}) {
  const rowTop = bodyTop + index * rowStride;
  const rowBottom = rowTop + rowStride;
  if (rowTop < scrollTop + stickyTop) return Math.max(0, rowTop - stickyTop);
  if (rowBottom > scrollTop + viewportHeight) {
    return Math.max(0, rowBottom - viewportHeight);
  }
  return null;
}
