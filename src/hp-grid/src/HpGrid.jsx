import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import { flushSync } from "react-dom";
import { registerGrid, unregisterGrid } from "./GridRegistry";
import GridRow from "./GridRow";
import { PlusIcon, SearchIcon } from "./icons";
import { generateUUID, ensureRowIds, getColumnStyle } from "./utils";
import "./HpGrid.css";

/**
 * HpGrid.jsx
 * ------------------------------------------------------------------
 * Usage:
 *
 *   const userColDef = [
 *     { id: 'name',  field: 'name',  headerName: 'Name',  type: 'text',   editable: true },
 *     { id: 'age',   field: 'age',   headerName: 'Age',   type: 'number', editable: true },
 *     { id: 'status',field: 'status',headerName: 'Status',type: 'select', editable: true,
 *       options: ['Active', 'Inactive'] },
 *   ];
 *
 *   <HpGrid id="abc" rowData={userRowData} colDef={userColDef} />
 *
 * Then, from anywhere:
 *
 *   const grid = GetGrid('abc');
 *   grid.setRowData(newRows);
 *   grid.setColDef(newCols);
 *   grid.getGridData();          // { rowData, colDef }
 *   grid.focusOnCellIndex(2, 'name');  // by row INDEX (position) + field/col name
 *   grid.focusOnCell(row.id, 'name');  // by the row's unique id + field/col name
 * ------------------------------------------------------------------
 */

// ---------------------------------------------------------------------
// Column-filter helpers (module scope - pure functions, no component
// state needed).
// ---------------------------------------------------------------------

// Decides which kind of filter CONTROL a column gets in the filter row.
//   colDef.filterable === false  -> 'none' (no control rendered)
//   colDef.filterType            -> explicit override, always wins
//   otherwise falls back based on colDef.type, mirroring cellTypes.jsx
function getColumnFilterType(col) {
  if (col.filterable === false) return "none";
  if (col.filterType) return col.filterType;
  switch (col.type) {
    case "select":
      return "select";
    case "checkbox":
      return "checkbox";
    case "status":
      return "none";
    case "number":
      return "number";
    case "date":
      return "date";
    case "actions":
      return "none";
    case "custom":
      return col.filterable ? "text" : "none";
    default:
      return "text";
  }
}

// Numeric / date filters support an optional leading operator so users can
// type things like ">100", "<=2024-06-01", "=50" as well as a bare value.
const OPERATOR_RE = /^(>=|<=|>|<|=)?\s*(.+)$/;

function compareWithOperator(actual, raw, parse) {
  const match = String(raw).trim().match(OPERATOR_RE);
  if (!match) return true;
  const [, op, rest] = match;
  const target = parse(rest);
  if (target === null || Number.isNaN(target)) return true;
  const value = parse(actual);
  if (value === null || Number.isNaN(value)) return false;
  switch (op) {
    case ">":
      return value > target;
    case "<":
      return value < target;
    case ">=":
      return value >= target;
    case "<=":
      return value <= target;
    default:
      return value === target;
  }
}

// Applies a single column's filter value against a single row's value for
// that column. Returns true when the row should be KEPT.
function matchesColumnFilter(value, filterValue, filterType, col) {
  if (filterValue === undefined || filterValue === null || filterValue === "")
    return true;

  switch (filterType) {
    case "select":
      return String(value ?? "") === String(filterValue);

    case "checkbox": {
      const boolValue =
        col.type === "status" && typeof col.isActive === "function"
          ? !!col.isActive(value)
          : !!value;
      if (filterValue === "true") return boolValue === true;
      if (filterValue === "false") return boolValue === false;
      return true;
    }

    case "number":
      return compareWithOperator(value, filterValue, (v) => {
        const n = Number(v);
        return v === "" || v === null || v === undefined ? null : n;
      });

    case "date":
      return compareWithOperator(value, filterValue, (v) => {
        if (!v) return null;
        const t = new Date(v).getTime();
        return Number.isNaN(t) ? null : t;
      });

    case "text":
    default:
      return String(value ?? "")
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
  }
}

function HpGrid(props) {
  const {
    id,
    rowData: initialRowData = [],
    colDef: initialColDef = [],
    rowHeight = 32,
    headerHeight = 36,
    className = "",
    style,
    selectable = false,
    rowClassName,
    onCellChange, // (rowIndex, field, value, row) => void  -- global fallback
    onCellBlur, // (rowIndex, field, value, row) => void
    onCellValueChange, // ({ rowIndex, colIndex, colId, field, oldValue, newValue, row }) => void -- fires on COMMIT only (Enter / blur), with old + new value
    onKeyDown, // (params) => void -- fires for every keydown on any cell, BEFORE HpGrid's own navigation logic runs. `params` = { event, key, rowIndex, colIndex, colId, field, value, row, colDef, rowData }. Call params.event.preventDefault() inside it to fully take over that key press yourself. Note: on an Enter press, `row`/`value` here may still be one tick behind (state hasn't flushed yet) - use onCellValueChange if you need the guaranteed up-to-date value.
    onSelectionChange, // (selectedRows) => void
    onDoubleClick,

    // ---- toolbar (title bar / search / + Add button, like the reference UI) ----
    title, // e.g. "Database & Branch"
    icon, // any ReactNode - rendered in a small teal square before the title
    searchable = false,
    searchPlaceholder = "Search here...",
    onSearchChange, // (term) => void -- optional external listener
    addButtonLabel = "Add New", // e.g. "+ Add Database" / "+ Add Group"
    onAddClick, // if provided, the "+ Add" button is shown

    // ---- per-column filter row (rendered directly under the header) ----
    columnFilterable = true, // set false to hide the whole filter row
    filterPlaceholder = "Filter...", // default placeholder for text/number/date filter inputs
    onColumnFiltersChange, // (filters) => void -- optional external listener, fires with the full { field: value } map

    // ---- keyboard behaviour ----
    // 'right' (default): Enter commits the value and moves focus to the
    //                     NEXT COLUMN in the same row (wraps to the next
    //                     row's first column at the end of a row).
    // 'down'            : Enter commits the value and moves focus straight
    //                     down to the same column, next row (classic
    //                     spreadsheet-style behaviour).
    enterKeyMovement = "right",

    // ---- row identity, used by applyTransaction's update/remove matching ----
    // Defaults to `row.id`. Provide this if your rows don't have an `id` field.
    getRowId,
  } = props;

  if (!id) {
    throw new Error(
      '[HpGrid] The "id" prop is required, e.g. <HpGrid id="abc" ... />',
    );
  }

  const [rowData, setRowDataState] = useState(() =>
    ensureRowIds(initialRowData),
  );
  const [colDef, setColDefState] = useState(initialColDef);
  const [selectedIndices, setSelectedIndices] = useState(() => new Set());
  const [focusedCell, setFocusedCell] = useState({
    rowIndex: null,
    colIndex: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [columnResize, setColumnResize] = useState(null);
  // Per-column filters: { [field]: filterValue }. Only fields with a
  // non-empty value are considered "active" - see displayRows below.
  const [columnFilters, setColumnFiltersState] = useState({});

  useEffect(() => {
    setRowDataState(ensureRowIds(initialRowData));
  }, [initialRowData]);

  // Keep latest state in refs so imperative API methods (which are only
  // created once) always read fresh data instead of a stale closure.
  //
  // useLayoutEffect (not useEffect) matters here: it's what guarantees these
  // refs are already updated by the time a flushSync()-wrapped call below
  // (addRow, removeRow, setRowData, applyTransaction) returns control to the
  // caller - so a follow-up focusOnCellIndex()/focusOnCell() call right
  // after addRow() sees the new row immediately instead of one tick late.
  const rowDataRef = useRef(rowData);
  const colDefRef = useRef(colDef);
  const selectedRef = useRef(selectedIndices);
  const columnFiltersRef = useRef(columnFilters);
  useLayoutEffect(() => {
    rowDataRef.current = rowData;
  }, [rowData]);
  useLayoutEffect(() => {
    colDefRef.current = colDef;
  }, [colDef]);
  useLayoutEffect(() => {
    selectedRef.current = selectedIndices;
  }, [selectedIndices]);
  useLayoutEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  // Updates (or clears, when value === "") a single column's filter value.
  // Defined up here (rather than next to displayRows) so it - and
  // clearColumnFilters below - are already initialized by the time the
  // imperative `api` useMemo below reads them.
  const handleColumnFilterChange = useCallback(
    (field, value) => {
      setColumnFiltersState((prev) => {
        const next = { ...prev };
        if (value === "" || value === undefined || value === null) {
          delete next[field];
        } else {
          next[field] = value;
        }
        if (typeof onColumnFiltersChange === "function")
          onColumnFiltersChange(next);
        return next;
      });
    },
    [onColumnFiltersChange],
  );

  const clearColumnFilters = useCallback(() => {
    setColumnFiltersState({});
    if (typeof onColumnFiltersChange === "function") onColumnFiltersChange({});
  }, [onColumnFiltersChange]);

  // rowIndex-colIndex -> actual focusable DOM node
  const cellRefs = useRef({});
  const registerCellRef = useCallback((rowIndex, colIndex, node) => {
    const key = `${rowIndex}-${colIndex}`;
    if (node) cellRefs.current[key] = node;
    else delete cellRefs.current[key];
  }, []);

  /* ----------------------------------------------------------------
   * Cell edit plumbing
   *   handleCellCommit fires only when a value is actually committed
   *   (Enter key or blur) - see GridCell.jsx for the local edit buffer
   *   that keeps every keystroke from touching this shared state.
   * ---------------------------------------------------------------- */
  const applyCellValue = useCallback((rowIndex, col, value) => {
    setRowDataState((prev) => {
      const next = prev.slice();
      next[rowIndex] = { ...next[rowIndex], [col.field]: value };
      return next;
    });
  }, []);

  const handleCellCommit = useCallback(
    (rowIndex, colIndex, col, value) => {
      // Build the updated row locally rather than reading rowDataRef right
      // after scheduling the state update - setRowDataState is async, so
      // rowDataRef wouldn't reflect the new value yet at this point.
      const oldRow = rowDataRef.current[rowIndex];
      const oldValue = oldRow?.[col.field];
      const updatedRow = { ...oldRow, [col.field]: value };

      applyCellValue(rowIndex, col, value);

      if (typeof col.onChange === "function")
        col.onChange(value, updatedRow, rowIndex);
      if (typeof onCellChange === "function")
        onCellChange(rowIndex, col.field, value, updatedRow);
      if (typeof onCellValueChange === "function") {
        onCellValueChange({
          rowIndex,
          colIndex,
          colId: col.id || col.field,
          field: col.field,
          oldValue,
          newValue: value,
          row: updatedRow,
        });
      }
    },
    [applyCellValue, onCellChange, onCellValueChange],
  );

  const handleCellBlur = useCallback(
    (rowIndex, colIndex, col, value) => {
      const updatedRow = {
        ...rowDataRef.current[rowIndex],
        [col.field]: value,
      };
      if (typeof col.onBlur === "function")
        col.onBlur(value, updatedRow, rowIndex);
      if (typeof onCellBlur === "function")
        onCellBlur(rowIndex, col.field, value, updatedRow);
    },
    [onCellBlur],
  );

  const handleCellFocus = useCallback((rowIndex, colIndex) => {
    setFocusedCell({ rowIndex, colIndex });
  }, []);

  /* ----------------------------------------------------------------
   * Row identity - used by applyTransaction's update/remove matching,
   * and by focusOnCell's row-id lookup below.
   * ---------------------------------------------------------------- */
  const resolveRowId = useCallback(
    (row, fallbackIndex) =>
      typeof getRowId === "function"
        ? getRowId(row)
        : (row?.id ?? fallbackIndex),
    [getRowId],
  );

  /* ----------------------------------------------------------------
   * Keyboard navigation
   *   - Arrow Up / Down : always move focus a row (works while editing)
   *   - Arrow Left/Right: only when the target isn't a text-editing
   *                        input, so cursor movement inside inputs
   *                        is never hijacked
   *   - Enter           : commits the value, then moves focus per
   *                        `enterKeyMovement` ('right' by default, 'down'
   *                        for classic spreadsheet behaviour)
   *   - Escape          : blur current cell
   * ---------------------------------------------------------------- */

  // Private, position-based focus - takes numeric row/col indices directly.
  // Used internally by arrow-key/Enter navigation, where we already know the
  // exact position and resolving a field name on every keypress would be
  // wasted work. Not part of the public GetGrid(id) API.
  const focusCellAt = useCallback((rowIndex, colIndex) => {
    const totalRows = rowDataRef.current.length;
    const totalCols = colDefRef.current.length;
    if (
      rowIndex < 0 ||
      rowIndex >= totalRows ||
      colIndex < 0 ||
      colIndex >= totalCols
    )
      return false;
    const node = cellRefs.current[`${rowIndex}-${colIndex}`];
    if (node && typeof node.focus === "function") {
      node.focus();
      setFocusedCell({ rowIndex, colIndex });
      return true;
    }
    return false;
  }, []);

  const resolveColIndex = useCallback((fieldOrColId) => {
    return colDefRef.current.findIndex(
      (c) => c.id === fieldOrColId || c.field === fieldOrColId,
    );
  }, []);

  // Public API - focus by numeric row INDEX + column field/id name.
  //   GetGrid('abc').focusOnCellIndex(2, 'name')
  const focusOnCellIndex = useCallback(
    (rowIndex, field) => {
      const colIndex = resolveColIndex(field);
      if (colIndex === -1) {
        console.warn(`[HpGrid] focusOnCellIndex: column "${field}" not found.`);
        return false;
      }
      return focusCellAt(rowIndex, colIndex);
    },
    [resolveColIndex, focusCellAt],
  );

  // Public API - focus by the row's unique id (not its position) + column
  // field/id name. Handy when you only know a row's id (e.g. from a server
  // response) and not where it currently sits in the array/after sorting.
  //   GetGrid('abc').focusOnCell(row.id, 'name')
  const focusOnCell = useCallback(
    (rowId, field) => {
      const rowIndex = rowDataRef.current.findIndex(
        (row, i) => resolveRowId(row, i) === rowId,
      );
      if (rowIndex === -1) {
        console.warn(`[HpGrid] focusOnCell: no row found with id "${rowId}".`);
        return false;
      }
      const colIndex = resolveColIndex(field);
      if (colIndex === -1) {
        console.warn(`[HpGrid] focusOnCell: column "${field}" not found.`);
        return false;
      }
      return focusCellAt(rowIndex, colIndex);
    },
    [resolveRowId, resolveColIndex, focusCellAt],
  );

  // Walks columns from `startColIndex` in `direction` (+1/-1), within a
  // single row, skipping any column marked `skipFocusTrue`. Returns -1 if
  // every remaining column in that row is skipped. Used by Arrow Left/Right
  // and Enter navigation so keyboard focus never lands on columns like an
  // actions column that only expose buttons, not editable/focusable content.
  const findFocusableColInRow = useCallback((startColIndex, direction) => {
    const totalCols = colDefRef.current.length;
    let c = startColIndex;
    while (c >= 0 && c < totalCols) {
      if (!colDefRef.current[c]?.skipFocusTrue) return c;
      c += direction;
    }
    return -1;
  }, []);

  const handleCellKeyDown = useCallback(
    (e, rowIndex, colIndex) => {
      if (typeof onKeyDown === "function") {
        const col = colDefRef.current[colIndex];
        const row = rowDataRef.current[rowIndex];
        onKeyDown({
          event: e,
          key: e.key,
          rowIndex,
          colIndex,
          colId: col?.id || col?.field,
          field: col?.field,
          value: row ? row[col?.field] : undefined,
          row,
          colDef: col,
          rowData: rowDataRef.current,
        });
        // Let the consumer fully take over this key press if they want to -
        // call params.event.preventDefault() inside their onKeyDown to skip
        // HpGrid's own Arrow/Enter navigation below.
        if (e.defaultPrevented) return;
      }

      const isTextEditingTarget = ["INPUT", "TEXTAREA", "SELECT"].includes(
        e.target.tagName,
      );

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          focusCellAt(rowIndex - 1, colIndex);
          break;
        case "ArrowDown":
          e.preventDefault();
          focusCellAt(rowIndex + 1, colIndex);
          break;
        case "Enter": {
          // The value itself was already committed by GridCell before this
          // handler runs (see GridCell.jsx's handleKeyDown) - this only
          // moves focus.
          e.preventDefault();
          if (enterKeyMovement === "down") {
            focusCellAt(rowIndex + 1, colIndex);
          } else {
            const nextCol = findFocusableColInRow(colIndex + 1, 1);
            if (nextCol !== -1) {
              focusCellAt(rowIndex, nextCol);
            } else {
              // End of row - wrap to the next row's first focusable column.
              const wrappedCol = findFocusableColInRow(0, 1);
              if (wrappedCol !== -1) focusCellAt(rowIndex + 1, wrappedCol);
            }
          }
          break;
        }
        case "ArrowLeft":
          if (!isTextEditingTarget) {
            e.preventDefault();
            const prevCol = findFocusableColInRow(colIndex - 1, -1);
            if (prevCol !== -1) focusCellAt(rowIndex, prevCol);
          }
          break;
        case "ArrowRight":
          if (!isTextEditingTarget) {
            e.preventDefault();
            const nextCol = findFocusableColInRow(colIndex + 1, 1);
            if (nextCol !== -1) focusCellAt(rowIndex, nextCol);
          }
          break;
        case "Escape":
          e.target.blur();
          break;
        default:
          break;
      }
    },
    [focusCellAt, enterKeyMovement, findFocusableColInRow, onKeyDown],
  );

  /* ----------------------------------------------------------------
   * Selection
   * ---------------------------------------------------------------- */
  const emitSelectionChange = useCallback(
    (nextSet) => {
      if (typeof onSelectionChange === "function") {
        onSelectionChange(
          Array.from(nextSet).map((i) => rowDataRef.current[i]),
        );
      }
    },
    [onSelectionChange],
  );

  const toggleRowSelection = useCallback(
    (rowIndex) => {
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        if (next.has(rowIndex)) next.delete(rowIndex);
        else next.add(rowIndex);
        emitSelectionChange(next);
        return next;
      });
    },
    [emitSelectionChange],
  );

  const selectRow = useCallback(
    (rowIndex) => {
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        next.add(rowIndex);
        emitSelectionChange(next);
        return next;
      });
    },
    [emitSelectionChange],
  );

  const deselectRow = useCallback(
    (rowIndex) => {
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        next.delete(rowIndex);
        emitSelectionChange(next);
        return next;
      });
    },
    [emitSelectionChange],
  );

  const clearSelection = useCallback(() => {
    setSelectedIndices(() => {
      const next = new Set();
      emitSelectionChange(next);
      return next;
    });
  }, [emitSelectionChange]);

  const selectAll = useCallback(() => {
    setSelectedIndices(() => {
      const next = new Set(rowDataRef.current.map((_, i) => i));
      emitSelectionChange(next);
      return next;
    });
  }, [emitSelectionChange]);

  /* ----------------------------------------------------------------
   * Imperative API (this is what GetGrid(id) returns)
   * ---------------------------------------------------------------- */
  const api = useMemo(
    () => ({
      // ---- data ----
      setRowData: (updater) =>
        flushSync(() => {
          setRowDataState((prev) =>
            ensureRowIds(
              typeof updater === "function" ? updater(prev) : updater,
            ),
          );
        }),
      setColDef: (updater) =>
        setColDefState((prev) =>
          typeof updater === "function" ? updater(prev) : updater,
        ),
      getRowData: () => rowDataRef.current,
      getColDef: () => colDefRef.current,
      getGridData: () => ({
        rowData: rowDataRef.current,
        colDef: colDefRef.current,
      }),

      // ---- row mutation ----
      addRow: (row, atIndex) =>
        flushSync(() => {
          setRowDataState((prev) => {
            const rowWithId =
              row && row.id != null ? row : { ...row, id: generateUUID() };
            const next = prev.slice();
            if (atIndex === undefined || atIndex === null) next.push(rowWithId);
            else next.splice(atIndex, 0, rowWithId);
            return next;
          });
        }),
      removeRow: (rowIndex) =>
        flushSync(() => {
          setRowDataState((prev) => prev.filter((_, i) => i !== rowIndex));
        }),
      updateCell: (rowIndex, colId, value) => {
        const col = colDefRef.current.find(
          (c) => c.id === colId || c.field === colId,
        );
        if (!col) {
          console.warn(`[HpGrid] updateCell: column "${colId}" not found.`);
          return;
        }
        applyCellValue(rowIndex, col, value);
      },
      getCellValue: (rowIndex, colId) => {
        const col = colDefRef.current.find(
          (c) => c.id === colId || c.field === colId,
        );
        if (!col) return undefined;
        return rowDataRef.current[rowIndex]?.[col.field];
      },

      // ---- focus ----
      focusOnCell,
      focusOnCellIndex,

      // ---- selection ----
      selectRow,
      deselectRow,
      toggleRowSelection,
      clearSelection,
      selectAll,
      getSelectedRows: () =>
        Array.from(selectedRef.current).map((i) => rowDataRef.current[i]),
      getSelectedIndices: () => Array.from(selectedRef.current),

      // ---- batch mutation (preserves object identity for untouched rows,
      //      so React.memo skips re-rendering rows that didn't change -
      //      use this instead of several addRow/removeRow/updateCell calls
      //      when updating many rows at once, e.g. from a data feed) ----
      applyTransaction: ({ add, addIndex, update, remove } = {}) => {
        flushSync(() => {
          setRowDataState((prev) => {
            let next = prev;

            if (Array.isArray(remove) && remove.length) {
              const removeIds = new Set(remove.map((r) => resolveRowId(r)));
              next = next.filter(
                (row, i) => !removeIds.has(resolveRowId(row, i)),
              );
            }

            if (Array.isArray(update) && update.length) {
              const updateMap = new Map(
                update.map((r) => [resolveRowId(r), r]),
              );
              next = next.map((row, i) => {
                const id = resolveRowId(row, i);
                return updateMap.has(id)
                  ? { ...row, ...updateMap.get(id) }
                  : row;
              });
            }

            if (Array.isArray(add) && add.length) {
              const rowsWithIds = ensureRowIds(add);
              next = next.slice();
              if (addIndex === undefined || addIndex === null)
                next.push(...rowsWithIds);
              else next.splice(addIndex, 0, ...rowsWithIds);
            }

            return next;
          });
        });
      },

      // ---- sorting ----
      sortByColumn: (colId, direction = "asc") => {
        const col = colDefRef.current.find(
          (c) => c.id === colId || c.field === colId,
        );
        if (!col) {
          console.warn(`[HpGrid] sortByColumn: column "${colId}" not found.`);
          return;
        }
        setRowDataState((prev) => {
          const next = prev.slice();
          next.sort((a, b) => {
            const av = a[col.field];
            const bv = b[col.field];
            if (av === bv) return 0;
            const result = av > bv ? 1 : -1;
            return direction === "desc" ? -result : result;
          });
          return next;
        });
      },

      // ---- column filters ----
      setColumnFilters: (updater) =>
        setColumnFiltersState((prev) => {
          const next =
            typeof updater === "function" ? updater(prev) : updater || {};
          if (typeof onColumnFiltersChange === "function")
            onColumnFiltersChange(next);
          return next;
        }),
      getColumnFilters: () => columnFiltersRef.current,
      clearColumnFilters,

      // ---- misc ----
      refresh: () => setRowDataState((prev) => prev.slice()),
      getId: () => id,
    }),
    [
      applyCellValue,
      focusOnCell,
      focusOnCellIndex,
      selectRow,
      deselectRow,
      toggleRowSelection,
      clearSelection,
      selectAll,
      resolveRowId,
      clearColumnFilters,
      onColumnFiltersChange,
      id,
    ],
  );

  useEffect(() => {
    registerGrid(id, api);
    return () => unregisterGrid(id);
  }, [id, api]);

  /* ----------------------------------------------------------------
   * Render
   * ---------------------------------------------------------------- */
  const allSelected =
    rowData.length > 0 && selectedIndices.size === rowData.length;

  // Search filters what's displayed only - the original array index is kept
  // as `rowIndex` for every row, so focusOnCellIndex/updateCell/etc. always
  // stay correct regardless of how the list is currently filtered.
  const activeColumnFilterFields = useMemo(
    () =>
      Object.keys(columnFilters).filter(
        (field) => columnFilters[field] !== "" && columnFilters[field] != null,
      ),
    [columnFilters],
  );

  const displayRows = useMemo(() => {
    let indexed = rowData.map((row, rowIndex) => ({ row, rowIndex }));

    if (searchable && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      indexed = indexed.filter(({ row }) =>
        colDef.some((col) =>
          String(row[col.field] ?? "")
            .toLowerCase()
            .includes(term),
        ),
      );
    }

    if (columnFilterable && activeColumnFilterFields.length) {
      indexed = indexed.filter(({ row }) =>
        activeColumnFilterFields.every((field) => {
          const col = colDef.find((c) => c.field === field);
          if (!col) return true;
          const filterType = getColumnFilterType(col);
          return matchesColumnFilter(
            row[field],
            columnFilters[field],
            filterType,
            col,
          );
        }),
      );
    }

    return indexed;
  }, [
    rowData,
    colDef,
    searchable,
    searchTerm,
    columnFilterable,
    columnFilters,
    activeColumnFilterFields,
  ]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (typeof onSearchChange === "function") onSearchChange(value);
  };

  const updateColumnWidth = useCallback((colIndex, nextWidth) => {
    setColDefState((prev) =>
      prev.map((col, index) => {
        if (index !== colIndex) return col;
        const width = Math.max(80, Number.isFinite(nextWidth) ? nextWidth : 80);
        return { ...col, width };
      }),
    );
  }, []);

  useEffect(() => {
    if (!columnResize) return undefined;

    const handleMouseMove = (event) => {
      const delta = event.clientX - columnResize.startX;
      const nextWidth = Math.max(
        80,
        (columnResize.startWidth ?? 120) + delta,
      );
      updateColumnWidth(columnResize.colIndex, nextWidth);
    };

    const handleMouseUp = () => setColumnResize(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [columnResize, updateColumnWidth]);

  const handleColumnResizeStart = (event, colIndex) => {
    if (event.button !== 0) return;
    const target = event.currentTarget.parentElement;
    const rect = target?.getBoundingClientRect();
    const currentWidth = rect?.width ?? 120;

    setColumnResize({
      colIndex,
      startX: event.clientX,
      startWidth: currentWidth,
    });
    event.preventDefault();
  };

  // Renders the actual control (text input / select / etc.) for one column's
  // filter cell, based on getColumnFilterType(col). Returns null for columns
  // that opted out (filterType === 'none'), so an empty placeholder cell is
  // rendered instead to keep column alignment intact.
  const renderFilterControl = (col) => {
    const filterType = getColumnFilterType(col);
    if (filterType === "none") return null;

    const filterValue = columnFilters[col.field] ?? "";
    const onChange = (value) => handleColumnFilterChange(col.field, value);

    if (filterType === "select") {
      return (
        <select
          className="hp-grid-filter-select"
          value={filterValue}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">All</option>
          {(col.options || []).map((opt) => {
            const v = typeof opt === "object" ? opt.value : opt;
            const label = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={v} value={v}>
                {label}
              </option>
            );
          })}
        </select>
      );
    }

    if (filterType === "checkbox") {
      return (
        <select
          className="hp-grid-filter-select"
          value={filterValue}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }

    if (filterType === "number") {
      return (
        <input
          type="text"
          className="hp-grid-filter-input"
          value={filterValue}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    if (filterType === "date") {
      return (
        <input
          type="text"
          className="hp-grid-filter-input"
          value={filterValue}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    return (
      <input
        type="text"
        className="hp-grid-filter-input"
        value={filterValue}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  const showToolbar = Boolean(title || icon || searchable || onAddClick);
  const hasOnlyFixedColumns =
    colDef.length > 0 &&
    colDef.every((column) => column.width !== undefined && column.width !== null);

  return (
    <div
      className={["hp-grid", className].filter(Boolean).join(" ")}
      style={{ minHeight: 0, ...style }}
    >
      {showToolbar && (
        <div className="hp-grid-toolbar">
          <div className="hp-grid-toolbar-title">
            {icon && <span className="hp-grid-toolbar-icon">{icon}</span>}
            {title && <span>{title}</span>}
          </div>
          <div className="hp-grid-toolbar-actions">
            {searchable && (
              <div className="hp-grid-search">
                <SearchIcon className="hp-grid-search-icon" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            )}
            {typeof onAddClick === "function" && (
              <button
                type="button"
                className="hp-grid-add-btn"
                onClick={onAddClick}
              >
                <PlusIcon />
                {addButtonLabel}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="hp-grid-table-shell">
        <div className="hp-grid-scroll-area">
          <div
            className={`hp-grid-scroll-content ${hasOnlyFixedColumns ? "hp-grid-scroll-content--fixed-columns" : ""}`}
          >
            <div
              className="hp-grid-header"
              style={{ height: headerHeight }}
            >
              {selectable && (
                <div className="hp-grid-cell hp-grid-cell--select-col hp-grid-header-cell">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => (allSelected ? clearSelection() : selectAll())}
                  />
                </div>
              )}
              {colDef.map((col, index) => (
                <div
                  key={col.id || col.field}
                  className="hp-grid-header-cell"
                  style={getColumnStyle(col)}
                >
                  <span className="hp-grid-header-label">
                    {col.headerName ?? col.field}
                  </span>
                  <span
                    className="hp-grid-column-resizer"
                    onMouseDown={(event) => handleColumnResizeStart(event, index)}
                    aria-label={`Resize ${col.headerName ?? col.field} column`}
                    role="separator"
                    tabIndex={-1}
                  />
                </div>
              ))}
            </div>

            {columnFilterable && (
              <div className="hp-grid-header-filters">
                {selectable && (
                  <div className="hp-grid-cell hp-grid-cell--select-col hp-grid-filter-cell hp-grid-filter-cell--empty" />
                )}
                {colDef.map((col) => (
                  <div
                    key={col.id || col.field}
                    className="hp-grid-filter-cell-outer"
                    style={getColumnStyle(col)}
                  >
                    {renderFilterControl(col) || (
                      <div className="hp-grid-filter-cell hp-grid-filter-cell--empty" />
                    )}
                  </div>
                ))}
                {activeColumnFilterFields.length > 0 && (
                  <button
                    type="button"
                    className="hp-grid-filter-clear-btn"
                    onClick={clearColumnFilters}
                    title="Clear all column filters"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            <div className="hp-grid-body">
              {displayRows.length === 0 && (
                <div className="hp-grid-empty">
                  {searchTerm.trim() || activeColumnFilterFields.length > 0
                    ? "No matching rows"
                    : "No rows to display"}
                </div>
              )}
              {displayRows.map(({ row, rowIndex }) => (
                <GridRow
                  key={row.id ?? rowIndex}
                  row={row}
                  rowIndex={rowIndex}
                  colDef={colDef}
                  selectable={selectable}
                  isSelected={selectedIndices.has(rowIndex)}
                  onToggleSelect={toggleRowSelection}
                  isRowFocused={focusedCell.rowIndex === rowIndex}
                  focusedColIndex={
                    focusedCell.rowIndex === rowIndex ? focusedCell.colIndex : -1
                  }
                  registerCellRef={registerCellRef}
                  onCellCommit={handleCellCommit}
                  onCellBlur={handleCellBlur}
                  onCellFocus={handleCellFocus}
                  onCellKeyDown={handleCellKeyDown}
                  onDoubleClick={onDoubleClick}
                  rowHeight={rowHeight}
                  rowClassName={rowClassName}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HpGrid;