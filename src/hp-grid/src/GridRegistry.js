/**
 * GridRegistry.js
 * ------------------------------------------------------------------
 * Central, module-level registry that maps a grid's `id` prop to the
 * live imperative API exposed by that <HpGrid /> instance.
 *
 * This is what makes `GetGrid('abc')` work from ANYWHERE in your app
 * (a button click handler, another component, a websocket callback,
 * etc.) without you having to pass refs down through props.
 *
 * Internal - not exported from the package's public surface directly,
 * but re-exported via index.js as `GetGrid`.
 * ------------------------------------------------------------------
 */

const registry = new Map();

/**
 * Called internally by <HpGrid /> on mount / api-change.
 * @param {string} id
 * @param {object} api - the imperative grid API (setRowData, focusOnCell, ...)
 */
export function registerGrid(id, api) {
  if (!id) {
    throw new Error(
      '[HpGrid] Every <HpGrid /> requires a unique "id" prop to be registered.',
    );
  }
  registry.set(id, api);
}

/**
 * Called internally by <HpGrid /> on unmount.
 * @param {string} id
 */
export function unregisterGrid(id) {
  registry.delete(id);
}

/**
 * Public API - fetch a live grid instance by id.
 *
 *   const grid = GetGrid('abc');
 *   grid.setRowData(newRows);
 *   grid.focusOnCell(0, 'name');
 *
 * @param {string} id
 * @returns {object|null} the grid's imperative API, or null if not mounted
 */
export function GetGrid(id) {
  const api = registry.get(id);
  if (!api) {
    console.warn(
      `[HpGrid] GetGrid("${id}") - no grid is currently mounted with this id.`,
    );
    return null;
  }
  return api;
}

/** Debug helper - list every currently mounted grid id. */
export function getAllGridIds() {
  return Array.from(registry.keys());
}
