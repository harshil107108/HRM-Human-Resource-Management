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
export function ensureRowIds(rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row) =>
    row && row.id != null ? row : { ...row, id: generateUUID() },
  );
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

export function getColumnStyle(column) {
  if (column.width === undefined || column.width === null) {
    return { flex: "1 1 0", minWidth: 0 };
  }

  const widthPx = `${parseColumnWidth(column.width, 120)}px`;

  return {
    width: widthPx,
    minWidth: widthPx,
    maxWidth: widthPx,
    flex: `0 0 ${widthPx}`,
    boxSizing: "border-box",
  };
}
