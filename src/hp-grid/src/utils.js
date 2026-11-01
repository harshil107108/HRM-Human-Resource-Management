/**
 * utils.js
 * ------------------------------------------------------------------
 * Small standalone helpers - kept in their own file since they're used
 * in a few different places (initial state, addRow, applyTransaction).
 * ------------------------------------------------------------------
 */

/**
 * Generates a UUID. Uses the native crypto.randomUUID() when available
 * (all modern browsers + Node 19+); falls back to a manual RFC4122 v4
 * implementation otherwise so this still works in older environments.
 */
export function generateUUID() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Ensures every row in the array has a stable `id`. Rows that already
 * have one are returned untouched (same object reference - important
 * for React.memo); rows without one get a shallow copy with a fresh
 * UUID attached. This is what gives every row in the grid a particular,
 * stable identity automatically, without the consumer having to manage
 * ids themselves.
 */
// Source row -> the copy that carries an id. Without this, handing the same
// row objects to the grid twice minted a fresh UUID (and a new object) for
// every row each time, so every row was remounted on every data sync.
const rowsWithId = new WeakMap();

export function ensureRowIds(rows) {
  if (!Array.isArray(rows)) {
    if (rows && Array.isArray(rows.data)) return ensureRowIds(rows.data);
    return [];
  }
  return rows.map((row) => {
    if (row && row.id != null) return row;
    if (!row || typeof row !== "object") return { id: generateUUID() };
    let withId = rowsWithId.get(row);
    if (!withId) {
      // Backend documents carry `_id`; reusing it keeps the key stable even
      // when a refetch hands back brand-new objects for the same records.
      withId = { ...row, id: row._id != null ? String(row._id) : generateUUID() };
      rowsWithId.set(row, withId);
    }
    return withId;
  });
}

export function parseColumnWidth(value, fallback = 120) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "auto") return fallback;

    const pxMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)px$/i);
    if (pxMatch) return Number(pxMatch[1]);

    const remMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)rem$/i);
    if (remMatch) return Number(remMatch[1]) * 16;

    const emMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)em$/i);
    if (emMatch) return Number(emMatch[1]) * 16;

    const numeric = Number(trimmed.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(numeric)) return numeric;
  }

  return fallback;
}

export function normalizeStickyPos(col) {
  if (!col) return null;
  const raw =
    col.stickyPos ??
    col.stickPos ??
    col.stickpos ??
    col.sticky ??
    col.pinned;

  if (raw === false || raw === "none" || raw === "false") return null;

  if (raw === undefined || raw === null || raw === "") {
    // Automatically make action columns sticky to the right edge across all modules
    if (col.type === "actions") return "right";
    return null;
  }

  if (raw === true) {
    return col.type === "actions" ? "right" : "left";
  }
  const s = String(raw).toLowerCase().trim();
  if (s === "last" || s === "right" || s === "end") return "right";
  if (s === "first" || s === "left" || s === "start") return "left";
  return null;
}

export function computeStickyColumnStyles(columns, selectable = false) {
  if (!Array.isArray(columns) || columns.length === 0) return [];

  const leftCols = [];
  const middleCols = [];
  const rightCols = [];

  for (const col of columns) {
    const side = normalizeStickyPos(col);
    if (side === "left") {
      leftCols.push({ ...col, _stickySide: "left" });
    } else if (side === "right") {
      rightCols.push({ ...col, _stickySide: "right" });
    } else {
      middleCols.push({ ...col, _stickySide: null, _stickyStyle: undefined });
    }
  }

  // Preserve stable AG-Grid style order: [ ...leftPinned, ...unpinned, ...rightPinned ]
  const ordered = [...leftCols, ...middleCols, ...rightCols];

  // 1. Calculate left offsets for left-pinned columns
  let currentLeft = selectable ? 40 : 0;
  const withLeftOffsets = ordered.map((col) => {
    if (col._stickySide === "left") {
      const fallback = col.type === "actions" ? 80 : 120;
      const colWidth = parseColumnWidth(col.width, fallback);
      const style = {
        position: "sticky",
        left: `${currentLeft}px`,
      };
      currentLeft += colWidth;
      return { ...col, _stickyStyle: style };
    }
    return col;
  });

  // 2. Calculate right offsets for right-pinned columns (from rightmost to innermost)
  let currentRight = 0;
  for (let i = withLeftOffsets.length - 1; i >= 0; i--) {
    const col = withLeftOffsets[i];
    if (col._stickySide === "right") {
      const fallback = col.type === "actions" ? 80 : 120;
      const colWidth = parseColumnWidth(col.width, fallback);
      col._stickyStyle = {
        position: "sticky",
        right: `${currentRight}px`,
      };
      currentRight += colWidth;
    }
  }

  return withLeftOffsets;
}

export function getColumnStyle(column) {
  const baseStyle =
    column.width === undefined || column.width === null
      ? { flex: "1 1 0", minWidth: 0 }
      : (() => {
          const widthPx = `${parseColumnWidth(column.width, 120)}px`;
          return {
            width: widthPx,
            minWidth: widthPx,
            maxWidth: widthPx,
            flex: `0 0 ${widthPx}`,
            boxSizing: "border-box",
          };
        })();

  if (column && column._stickyStyle) {
    return { ...baseStyle, ...column._stickyStyle };
  }

  return baseStyle;
}


