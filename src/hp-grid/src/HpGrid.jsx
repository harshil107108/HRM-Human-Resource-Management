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
import GridContextMenu from "./GridContextMenu";
import { PlusIcon, SearchIcon } from "./icons";
import { LayoutGrid, List, ChevronRight, ChevronDown, ChevronsUpDown, ChevronsDownUp, Folder, FolderOpen, CornerDownRight, Eye, Lock } from "lucide-react";
import { useRouteAccess } from "@/context/RouteAccessContext";
import NoPermission from "@/components/common/NoPermission";
import { generateUUID, ensureRowIds, getColumnStyle } from "./utils";
import { Lottie } from "lottie-react";
import loadingAnimation from "../../assets/images/Animation.json";
import noDataImage from "../../assets/images/Nodata.avif";
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

function normalizeColDef(cols) {
  if (!Array.isArray(cols)) return [];
  return cols.map((col, idx) => ({
    ...col,
    id: col.id || col.field || col.key || `col_${idx}`,
    field: col.field || col.key || col.id,
    headerName: col.headerName || col.label || col.header || "",
  }));
}

function getCardStatusTone(status) {
  const normalized = status.toLowerCase();
  if (/available|active|completed|accepted|hired|selected|passed/.test(normalized))
    return "hp-grid-card-status--positive";
  if (/rejected|declined|cancelled|canceled|inactive|lost|disposed|failed/.test(normalized))
    return "hp-grid-card-status--negative";
  if (/pending|draft|scheduled|repair|progress|review|interview|offered/.test(normalized))
    return "hp-grid-card-status--warning";
  return "hp-grid-card-status--neutral";
}

function HpGridBase(props) {
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
    onContextMenu, // (params) => void -- optional external listener
    contextData, // Array | ({ row, rowIndex, data, event, colDef }) => Array -- defines right-click context menu
    pending = false,
    panding = false,

    // ---- toolbar (title bar / search / + Add button, like the reference UI) ----
    title, // e.g. "Database & Branch"
    icon, // any ReactNode - rendered in a small teal square before the title
    searchable = false,
    searchPlaceholder = "Search here...",
    onSearchChange, // (term) => void -- optional external listener
    addButtonLabel = "Add New", // e.g. "+ Add Database" / "+ Add Group"
    onAddClick, // if provided, the "+ Add" button is shown
    addDisabled = false, // shows the Add button disabled (no Add permission)
    addDisabledReason = "You don't have permission to add",
    toggle = false,
    defaultView = "list", // "list" | "card"
    cardTitleField,
    cardSubtitleField,
    cardFields,
    cardStatusField,
    onCardClick,
    cardDraggable = false,
    onCardDragStart,
    onCardDragEnd,
    onCardDragOver,
    onCardDragLeave,
    onCardDrop,
    getCardClassName,
    renderCardProgress,

    // ---- row drag and drop support ----
    rowDraggable = false,
    onRowDragStart,
    onRowDragEnd,
    onRowDragOver,
    onRowDragLeave,
    onRowDrop,

    // ---- per-column filter row (rendered directly under the header) ----
    columnFilterable = true, // set false to hide the whole filter row
    filterPlaceholder = "Filter...", // default placeholder for text/number/date filter inputs
    onColumnFiltersChange, // (filters) => void -- optional external listener, fires with the full { field: value } map

    // ---- tree expand / collapse support ----
    expand = false,
    defaultExpanded = false,
    treeField,
    childrenField = "children",
    parentIdField = "parentMenu",

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

  const isLoading = pending || panding;

  if (!id) {
    throw new Error(
      '[HpGrid] The "id" prop is required, e.g. <HpGrid id="abc" ... />',
    );
  }

  const [rowData, setRowDataState] = useState(() =>
    ensureRowIds(initialRowData),
  );
  const [colDef, setColDefState] = useState(() => normalizeColDef(initialColDef));
  const [selectedIndices, setSelectedIndices] = useState(() => new Set());
  const [focusedCell, setFocusedCell] = useState({
    rowIndex: null,
    colIndex: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState(defaultView);
  const [columnResize, setColumnResize] = useState(null);
  // Context menu state for right click on row
  const [contextMenu, setContextMenu] = useState(null);
  // Per-column filters: { [field]: filterValue }. Only fields with a
  // non-empty value are considered "active" - see displayRows below.
  const [columnFilters, setColumnFiltersState] = useState({});

  // Tree expand/collapse state
  const [expandedRowKeys, setExpandedRowKeys] = useState(() => new Set());
  const [hasInitializedExpanded, setHasInitializedExpanded] = useState(false);

  // Group rows if expand is true
  const treeModel = useMemo(() => {
    if (!expand || !Array.isArray(rowData) || !rowData.length) return null;

    const getId = (r) => String(r._id || r.id || r.menuCode || "");
    const getParentVal = (r) => {
      const p = r[parentIdField] ?? r.parentId ?? r.parent;
      if (!p) return null;
      if (typeof p === "object") return String(p._id || p.id || p.menuCode || "");
      return String(p);
    };

    const hasPreNested = rowData.some((r) => Array.isArray(r[childrenField]) && r[childrenField].length > 0);
    if (hasPreNested) {
      const parentKeys = new Set();
      const roots = rowData.map((r, idx) => {
        const key = getId(r) || `row_${idx}`;
        const kids = (r[childrenField] || []).map((k, kIdx) => ({
          ...k,
          _rowKey: getId(k) || `${key}_k_${kIdx}`,
          _isChild: true,
          _level: 1,
          _parentId: key,
          _parentName: r.menuName || r.displayName || r.name || "",
        }));
        if (kids.length > 0) parentKeys.add(key);
        return {
          ...r,
          _rowKey: key,
          _isParent: kids.length > 0,
          _hasChildren: kids.length > 0,
          _childrenCount: kids.length,
          _children: kids,
          _level: 0,
        };
      });
      return { roots, parentKeys };
    }

    const roots = [];
    const childrenMap = new Map();
    const parentKeys = new Set();

    rowData.forEach((r, idx) => {
      const pid = getParentVal(r);
      const key = getId(r) || `row_${idx}`;
      if (!pid) {
        roots.push({ ...r, _rowKey: key, _level: 0 });
      } else {
        if (!childrenMap.has(pid)) childrenMap.set(pid, []);
        childrenMap.get(pid).push({
          ...r,
          _rowKey: key,
          _isChild: true,
          _level: 1,
          _parentId: pid,
        });
      }
    });

    const assembledRoots = roots.map((root) => {
      const key = root._rowKey;
      const kids = (childrenMap.get(key) || []).map((k) => ({
        ...k,
        _parentName: root.menuName || root.displayName || root.name || "",
      }));
      childrenMap.delete(key);
      if (kids.length > 0) parentKeys.add(key);
      return {
        ...root,
        _isParent: kids.length > 0,
        _hasChildren: kids.length > 0,
        _childrenCount: kids.length,
        _children: kids,
      };
    });

    childrenMap.forEach((orphanKids) => {
      orphanKids.forEach((k) => {
        assembledRoots.push({ ...k, _isChild: false, _hasChildren: false, _children: [] });
      });
    });

    return { roots: assembledRoots, parentKeys };
  }, [expand, rowData, childrenField, parentIdField]);

  useEffect(() => {
    if (expand && treeModel?.parentKeys && !hasInitializedExpanded) {
      if (defaultExpanded) {
        setExpandedRowKeys(new Set(treeModel.parentKeys));
      } else {
        setExpandedRowKeys(new Set());
      }
      setHasInitializedExpanded(true);
    }
  }, [expand, treeModel, defaultExpanded, hasInitializedExpanded]);

  const toggleRowExpanded = useCallback((rowKey) => {
    setExpandedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (treeModel?.parentKeys) {
      setExpandedRowKeys(new Set(treeModel.parentKeys));
    }
  }, [treeModel]);

  const collapseAll = useCallback(() => {
    setExpandedRowKeys(new Set());
  }, []);

  const areAllExpanded = useMemo(() => {
    if (!treeModel?.parentKeys?.size) return false;
    for (const key of treeModel.parentKeys) {
      if (!expandedRowKeys.has(key)) return false;
    }
    return true;
  }, [treeModel, expandedRowKeys]);

  useEffect(() => {
    setRowDataState(ensureRowIds(initialRowData));
  }, [initialRowData]);

  useEffect(() => {
    setColDefState(normalizeColDef(initialColDef));
  }, [initialColDef]);

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

  const scrollAreaRef = useRef(null);
  const [scrollAreaWidth, setScrollAreaWidth] = useState(0);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const updateWidth = () => {
      if (el) {
        setScrollAreaWidth(el.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    window.addEventListener("resize", updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

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

  const handleRowContextMenu = useCallback(
    ({ event, row, rowIndex, data, colDef: rowColDef }) => {
      if (typeof onContextMenu === "function") {
        onContextMenu({ event, row, rowIndex, data, colDef: rowColDef });
      }

      if (!contextData) return;

      let items = [];
      if (typeof contextData === "function") {
        items =
          contextData({ row, rowIndex, data, event, colDef: rowColDef }) || [];
      } else if (Array.isArray(contextData)) {
        items = contextData;
      }

      if (items && items.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          row,
          rowIndex,
          items,
        });
      }
    },
    [contextData, onContextMenu],
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

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
      const list = Array.isArray(rowDataRef.current) ? rowDataRef.current : [];
      const next = new Set(list.map((_, i) => i));
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
      closeContextMenu: handleCloseContextMenu,
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
      handleCloseContextMenu,
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
  const safeRowData = Array.isArray(rowData) ? rowData : [];
  const allSelected =
    safeRowData.length > 0 && selectedIndices.size === safeRowData.length;

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

  const effectiveColDef = useMemo(() => {
    if (!expand) return colDef;

    const targetField =
      treeField ||
      colDef.find((c) => c.type !== "actions" && c.type !== "checkbox" && c.type !== "status")?.field ||
      colDef[0]?.field;

    return colDef.map((col) => {
      if (col.field !== targetField) return col;

      const userRender = col.render;

      return {
        ...col,
        render: (value, row, rowIndex) => {
          const rawContent = userRender
            ? userRender(value, row, rowIndex)
            : col.type === "status"
              ? value
              : value ?? "-";

          const hasKids = Boolean(row._hasChildren);
          const isKid = Boolean(row._isChild || (row._level > 0));
          const isExp = Boolean(row._isExpanded);

          return (
            <div
              className={`hp-grid-tree-cell ${isKid ? "hp-grid-tree-cell--child" : "hp-grid-tree-cell--parent"}`}
              style={isKid ? { paddingLeft: `${(row._level || 1) * 26}px` } : undefined}
              onClick={
                hasKids
                  ? (e) => {
                      e.stopPropagation();
                      toggleRowExpanded(row._rowKey);
                    }
                  : undefined
              }
            >
              {hasKids ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpanded(row._rowKey);
                    }}
                    className={`hp-grid-tree-btn ${isExp ? "hp-grid-tree-btn--expanded" : ""}`}
                    title={isExp ? "Collapse group" : "Expand group"}
                    aria-expanded={isExp}
                  >
                    {isExp ? (
                      <ChevronDown size={13} className="hp-grid-tree-chevron" />
                    ) : (
                      <ChevronRight size={13} className="hp-grid-tree-chevron" />
                    )}
                  </button>
                  <span className="hp-grid-tree-folder-wrap" aria-hidden="true">
                    {isExp ? (
                      <FolderOpen size={16} className="hp-grid-tree-folder text-blue-600 fill-blue-100" />
                    ) : (
                      <Folder size={16} className="hp-grid-tree-folder text-slate-500 fill-slate-100" />
                    )}
                  </span>
                </>
              ) : isKid ? (
                <div className="hp-grid-tree-branch-wrap" aria-hidden="true">
                  <CornerDownRight size={13} className="hp-grid-tree-corner-icon text-slate-400 stroke-[2.2]" />
                  <span className="hp-grid-tree-child-dot" />
                </div>
              ) : (
                <span className="hp-grid-tree-empty-spacer" />
              )}

              <div className="hp-grid-tree-text truncate flex-1 font-medium">
                {rawContent}
              </div>

              {hasKids && (
                <span
                  className="hp-grid-tree-badge"
                  title={`${row._childrenCount} sub-items under ${row.menuName || "this module"}`}
                >
                  <span className="hp-grid-tree-badge-count">{row._childrenCount}</span>
                  <span className="hp-grid-tree-badge-label">routes</span>
                </span>
              )}
            </div>
          );
        },
      };
    });
  }, [colDef, expand, treeField, toggleRowExpanded]);

  const resolvedRowClassName = useCallback(
    (row, rowIndex) => {
      const userClass =
        typeof rowClassName === "function"
          ? rowClassName(row, rowIndex)
          : rowClassName || "";
      if (!expand) return userClass;

      const treeClass = row._hasChildren
        ? "hp-grid-row--parent font-semibold"
        : row._isChild
          ? "hp-grid-row--child"
          : "";
      return [userClass, treeClass].filter(Boolean).join(" ");
    },
    [rowClassName, expand]
  );

  const displayRows = useMemo(() => {
    if (expand && treeModel) {
      const { roots } = treeModel;
      const flattened = [];
      const term = searchable && searchTerm.trim() ? searchTerm.trim().toLowerCase() : "";
      const hasColumnFilters = columnFilterable && activeColumnFilterFields.length > 0;

      const rowMatchesFilters = (r) => {
        if (!hasColumnFilters) return true;
        return activeColumnFilterFields.every((field) => {
          const col = colDef.find((c) => c.field === field);
          if (!col) return true;
          const filterType = getColumnFilterType(col);
          return matchesColumnFilter(
            r[field],
            columnFilters[field],
            filterType,
            col,
          );
        });
      };

      const rowMatchesSearch = (r) => {
        if (!term) return true;
        return colDef.some((col) =>
          String(r[col.field] ?? "").toLowerCase().includes(term)
        );
      };

      const isFiltering = Boolean(term || hasColumnFilters);

      roots.forEach((root) => {
        const isExp = expandedRowKeys.has(root._rowKey);
        const kids = root._children || [];

        if (isFiltering) {
          const rootMatches = rowMatchesSearch(root) && rowMatchesFilters(root);
          const matchingKids = kids.filter(
            (kid) => rowMatchesSearch(kid) && rowMatchesFilters(kid)
          );

          if (rootMatches || matchingKids.length > 0) {
            flattened.push({
              ...root,
              _isExpanded: true,
            });
            const toShow = rootMatches ? kids : matchingKids;
            toShow.forEach((k) => flattened.push(k));
          }
        } else {
          flattened.push({
            ...root,
            _isExpanded: isExp,
          });
          if (isExp) {
            kids.forEach((k) => flattened.push(k));
          }
        }
      });

      return flattened.map((row, rowIndex) => ({ row, rowIndex }));
    }

    let indexed = safeRowData.map((row, rowIndex) => ({ row, rowIndex }));

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
    expand,
    treeModel,
    expandedRowKeys,
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
      const nextWidth = Math.max(80, (columnResize.startWidth ?? 120) + delta);
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

  const showToolbar = Boolean(
    title ||
      icon ||
      searchable ||
      onAddClick ||
      toggle ||
      (expand && treeModel?.parentKeys?.size > 0),
  );
  const isCardView = toggle && viewMode === "card";
  const cardTitleColumn =
    colDef.find((col) => col.field === cardTitleField) ||
    colDef.find((col) => col.type !== "actions");
  const cardSubtitleColumn = colDef.find(
    (col) => col.field === cardSubtitleField,
  );
  const cardStatusColumn = colDef.find(
    (col) => col.field === cardStatusField,
  ) || (cardStatusField ? { field: cardStatusField } : undefined);
  const visibleCardFields = useMemo(() => {
    const fields = Array.isArray(cardFields)
      ? cardFields
      : colDef
        .filter(
          (col) =>
            col.type !== "actions" &&
            col.field !== cardTitleColumn?.field &&
            col.field !== cardStatusColumn?.field,
        )
        .slice(0, 4);

    return fields
      .map((item) => (typeof item === "string" ? { field: item } : item))
      .filter(
        (item) =>
          item &&
          typeof item.field === "string" &&
          item.field !== cardTitleColumn?.field &&
          item.field !== cardStatusColumn?.field &&
          item.field !== "deadlineProgress" &&
          colDef.find((col) => col.field === item.field || col.id === item.field)?.type !== "actions",
      )
      .map((item) => ({
        field: item.field,
        label:
          item.label ||
          colDef.find((col) => col.field === item.field || col.id === item.field)?.headerName ||
          item.field,
      }));
  }, [cardFields, cardTitleColumn?.field, cardStatusColumn?.field, colDef]);
  const cardClickHandler =
    typeof onCardClick === "function" ? onCardClick : onDoubleClick;
  const hasOnlyFixedColumns =
    colDef.length > 0 &&
    colDef.every(
      (column) => column.width !== undefined && column.width !== null,
    );

  return (
    <div
      className={["hp-grid", className].filter(Boolean).join(" ")}
      style={{ minHeight: 0, ...style }}
      aria-busy={isLoading}
    >
      {showToolbar && (
        <div className="hp-grid-toolbar">
          <div className="hp-grid-toolbar-title">
            {icon && <span className="hp-grid-toolbar-icon">{icon}</span>}
            {title && <span>{title}</span>}
          </div>
          <div className="hp-grid-toolbar-actions">
            {expand && treeModel?.parentKeys?.size > 0 && (
              <button
                type="button"
                onClick={areAllExpanded ? collapseAll : expandAll}
                className="hp-grid-tree-expand-all"
                title={areAllExpanded ? "Collapse All Groups" : "Expand All Groups"}
              >
                {areAllExpanded ? (
                  <ChevronsDownUp size={14} />
                ) : (
                  <ChevronsUpDown size={14} />
                )}
                <span>{areAllExpanded ? "Collapse All" : "Expand All"}</span>
              </button>
            )}
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
            {toggle && (
              <div
                className="hp-grid-view-toggle"
                role="group"
                aria-label="View mode"
              >
                <button
                  type="button"
                  className={`hp-grid-view-toggle-btn ${viewMode === "list" ? "hp-grid-view-toggle-btn--active" : ""}`}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  title="List view"
                >
                  <List
                    size={14}
                    className="hp-grid-view-toggle-icon"
                    aria-hidden="true"
                  />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  className={`hp-grid-view-toggle-btn ${viewMode === "card" ? "hp-grid-view-toggle-btn--active" : ""}`}
                  onClick={() => setViewMode("card")}
                  aria-label="Cards view"
                  aria-pressed={viewMode === "card"}
                  title="Cards view"
                >
                  <LayoutGrid
                    size={14}
                    className="hp-grid-view-toggle-icon"
                    aria-hidden="true"
                  />
                  <span>Cards</span>
                </button>
              </div>
            )}
            {typeof onAddClick === "function" && (
              <button
                type="button"
                className="hp-grid-add-btn"
                onClick={addDisabled ? undefined : onAddClick}
                disabled={addDisabled}
                aria-disabled={addDisabled || undefined}
                title={addDisabled ? addDisabledReason : undefined}
              >
                {addDisabled ? <Lock size={14} /> : <PlusIcon />}
                {addButtonLabel}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="hp-grid-table-shell">
        <div className="hp-grid-scroll-area" ref={scrollAreaRef}>
          <div
            className={`hp-grid-scroll-content ${hasOnlyFixedColumns ? "hp-grid-scroll-content--fixed-columns" : ""} ${isCardView ? "hp-grid-scroll-content--cards" : ""}`}
          >
            {!isCardView && (
              <div className="hp-grid-header" style={{ height: headerHeight }}>
                {selectable && (
                  <div className="hp-grid-cell hp-grid-cell--select-col hp-grid-header-cell">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        allSelected ? clearSelection() : selectAll()
                      }
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
                      onMouseDown={(event) =>
                        handleColumnResizeStart(event, index)
                      }
                      aria-label={`Resize ${col.headerName ?? col.field} column`}
                      role="separator"
                      tabIndex={-1}
                    />
                  </div>
                ))}
              </div>
            )}

            {columnFilterable && !isCardView && (
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



            <div
              className={`hp-grid-body ${isCardView ? "hp-grid-body--cards hp-grid-card-view" : ""}`}
            >
              {isLoading && (
                <div
                  className="hp-grid-loading"
                  role="status"
                  aria-label="Loading"
                >
                  <Lottie
                    src={loadingAnimation}
                    loop
                    autoplay
                    className="hp-grid-loading-animation"
                  />
                </div>
              )}
              {!isLoading && displayRows.length === 0 && (
                <div
                  className="hp-grid-empty"
                  style={
                    !isCardView && scrollAreaWidth > 0
                      ? {
                        position: "sticky",
                        left: 0,
                        width: `${scrollAreaWidth}px`,
                        maxWidth: `${scrollAreaWidth}px`,
                      }
                      : undefined
                  }
                >
                  <img src={noDataImage} alt="No data" />
                </div>
              )}
              {isCardView
                ? displayRows.map(({ row, rowIndex }) => {
                  const statusValue = cardStatusColumn
                    ? row[cardStatusColumn.field]
                    : undefined;
                  const status =
                    typeof statusValue === "string" ||
                      typeof statusValue === "number"
                      ? String(statusValue)
                      : "";
                  const titleValue = cardTitleColumn
                    ? row[cardTitleColumn.field]
                    : undefined;
                  const subtitleValue = cardSubtitleColumn
                    ? row[cardSubtitleColumn.field]
                    : undefined;
                  const titleText =
                    titleValue === null ||
                      titleValue === undefined ||
                      titleValue === ""
                      ? "Untitled record"
                      : String(titleValue);
                  const subtitleText =
                    subtitleValue !== null &&
                      subtitleValue !== undefined &&
                      subtitleValue !== "" &&
                      typeof subtitleValue !== "object"
                      ? String(subtitleValue)
                      : "";
                  const avatarLetter = (
                    titleText !== "Untitled record"
                      ? titleText
                      : subtitleText || "R"
                  )
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "R";

                  const details = visibleCardFields
                    .map(({ field, label }) => {
                      const col = colDef.find(
                        (c) => c.field === field || c.id === field,
                      );
                      const isFullWidth =
                        field === "assignedToName" ||
                        field === "description" ||
                        field === "deadlineProgress" ||
                        col?.fullWidth ||
                        Boolean(col?.cardFullWidth);

                      if (col && typeof col.render === "function") {
                        const rendered = col.render(row[field], row, rowIndex);
                        if (rendered != null && rendered !== "") {
                          return (
                            <div
                              className={`hp-grid-card-detail ${isFullWidth ? "hp-grid-card-detail--full" : ""}`}
                              key={field}
                            >
                              <span className="hp-grid-card-detail-label">
                                {label}
                              </span>
                              <div className="hp-grid-card-detail-value hp-grid-card-detail-value--custom">
                                {rendered}
                              </div>
                            </div>
                          );
                        }
                      }
                      const value = row[field];
                      if (
                        value === null ||
                        value === undefined ||
                        value === "" ||
                        typeof value === "object"
                      ) {
                        return null;
                      }
                      return (
                        <div
                          className={`hp-grid-card-detail ${isFullWidth ? "hp-grid-card-detail--full" : ""}`}
                          key={field}
                        >
                          <span className="hp-grid-card-detail-label">
                            {label}
                          </span>
                          <span
                            className="hp-grid-card-detail-value"
                            title={String(value)}
                          >
                            {typeof value === "boolean"
                              ? value
                                ? "Yes"
                                : "No"
                              : String(value)}
                          </span>
                        </div>
                      );
                    })
                    .filter(Boolean);

                  const cardContent = (
                    <>
                      <div
                        className="hp-grid-card-top-accent"
                        aria-hidden="true"
                      />
                      <div className="hp-grid-card-heading">
                        <div className="hp-grid-card-top-row">
                          <div
                            className="hp-grid-card-avatar"
                            aria-hidden="true"
                          >
                            {avatarLetter}
                          </div>
                          {status && (
                            <span
                              className={`hp-grid-card-status ${getCardStatusTone(status)}`}
                            >
                              <span
                                className="hp-grid-card-status-dot"
                                aria-hidden="true"
                              />
                              <span className="hp-grid-card-status-text">
                                {status}
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="hp-grid-card-title-wrap">
                          <span
                            className="hp-grid-card-title"
                            title={titleText}
                          >
                            {titleText}
                          </span>
                          {subtitleText && (
                            <span
                              className="hp-grid-card-subtitle"
                              title={subtitleText}
                            >
                              {subtitleText}
                            </span>
                          )}
                        </div>
                      </div>
                      {(() => {
                        const progressNode =
                          typeof renderCardProgress === "function"
                            ? renderCardProgress({ row, rowIndex })
                            : (() => {
                                const col = colDef.find(
                                  (c) =>
                                    c.field === "deadlineProgress" ||
                                    c.id === "deadlineProgress",
                                );
                                return col && typeof col.render === "function"
                                  ? col.render(row.deadlineProgress, row, rowIndex)
                                  : null;
                              })();
                        return progressNode ? (
                          <div className="hp-grid-card-progress-bar-wrap">
                            {progressNode}
                          </div>
                        ) : null;
                      })()}
                      {details.length > 0 && (
                        <div className="hp-grid-card-details">{details}</div>
                      )}
                      <div className="hp-grid-card-footer">
                        <span className="hp-grid-card-meta">
                          #{rowIndex + 1}
                        </span>
                        {cardClickHandler && (
                          <span className="hp-grid-card-action">
                            <span>View details</span>
                            <ChevronRight
                              size={12}
                              className="hp-grid-card-action-icon"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </div>
                    </>
                  );
                  const customCardClass =
                    typeof getCardClassName === "function"
                      ? getCardClassName({ row, rowIndex })
                      : "";
                  const cardClassName = [
                    "hp-grid-card",
                    cardClickHandler && "hp-grid-card--interactive",
                    cardDraggable && "hp-grid-card--draggable",
                    customCardClass,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const dragProps = {
                    draggable: cardDraggable,
                    onDragStart: cardDraggable
                      ? (e) => onCardDragStart?.({ event: e, row, rowIndex })
                      : undefined,
                    onDragEnd: cardDraggable
                      ? (e) => onCardDragEnd?.({ event: e, row, rowIndex })
                      : undefined,
                    onDragOver: (e) =>
                      onCardDragOver?.({ event: e, row, rowIndex }),
                    onDragLeave: (e) =>
                      onCardDragLeave?.({ event: e, row, rowIndex }),
                    onDrop: (e) => onCardDrop?.({ event: e, row, rowIndex }),
                  };

                  return cardClickHandler ? (
                    <button
                      type="button"
                      key={row.id ?? rowIndex}
                      className={cardClassName}
                      onClick={() =>
                        cardClickHandler({ data: row, rowIndex })
                      }
                      {...dragProps}
                    >
                      {cardContent}
                    </button>
                  ) : (
                    <article
                      key={row.id ?? rowIndex}
                      className={cardClassName}
                      {...dragProps}
                    >
                      {cardContent}
                    </article>
                  );
                })
                : displayRows.map(({ row, rowIndex }) => (
                  <GridRow
                    key={row._rowKey ?? row.id ?? rowIndex}
                    row={row}
                    rowIndex={rowIndex}
                    colDef={effectiveColDef}
                    selectable={selectable}
                    isSelected={selectedIndices.has(rowIndex)}
                    onToggleSelect={toggleRowSelection}
                    isRowFocused={focusedCell.rowIndex === rowIndex}
                    focusedColIndex={
                      focusedCell.rowIndex === rowIndex
                        ? focusedCell.colIndex
                        : -1
                    }
                    registerCellRef={registerCellRef}
                    onCellCommit={handleCellCommit}
                    onCellBlur={handleCellBlur}
                    onCellFocus={handleCellFocus}
                    onCellKeyDown={handleCellKeyDown}
                    onDoubleClick={onDoubleClick}
                    onContextMenu={handleRowContextMenu}
                    isContextActive={contextMenu?.rowIndex === rowIndex}
                    rowHeight={rowHeight}
                    rowClassName={resolvedRowClassName}
                    rowDraggable={rowDraggable}
                    onRowDragStart={onRowDragStart}
                    onRowDragEnd={onRowDragEnd}
                    onRowDragOver={onRowDragOver}
                    onRowDragLeave={onRowDragLeave}
                    onRowDrop={onRowDrop}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {contextMenu && (
        <GridContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          row={contextMenu.row}
          rowIndex={contextMenu.rowIndex}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
}

// =================================================================
// Permission-aware wrapper
// -----------------------------------------------------------------
// Applies the current page's rights (RouteAccessContext) to the grid:
//   no view   -> "no permission" panel instead of the grid
//   no add    -> Add button disabled
//   no edit   -> row/card dragging off, cells read-only, context-menu
//                "Edit" becomes "View", status moves hidden
//   no delete -> delete actions disabled
// It also records the add/edit intent so the form that opens knows which
// right applies. Outside a permission-checked page everything is allowed.
// =================================================================

// Remove hidden items, then leading/trailing/double dividers.
const tidyMenuItems = (items, row, rowIndex) => {
  const visible = (items || []).filter((item) => {
    if (!item) return false;
    if (item.divider) return true;
    return typeof item.hidden === "function" ? !item.hidden(row, rowIndex) : !item.hidden;
  });
  const result = [];
  visible.forEach((item) => {
    if (item.divider && (!result.length || result[result.length - 1].divider)) return;
    result.push(item);
  });
  while (result.length && result[result.length - 1].divider) result.pop();
  return result;
};

function HpGrid(props) {
  const { canView, canAdd, canEdit, canDelete, setIntent } = useRouteAccess();
  const {
    colDef,
    onAddClick,
    onDoubleClick,
    onCardClick,
    contextData,
    rowDraggable,
    cardDraggable,
  } = props;

  const gridColDef = useMemo(() => {
    if (canEdit && canDelete) return colDef;
    return (colDef || []).map((col) => {
      if (!col) return col;
      if (col.type === "actions") {
        return { ...col, deleteDisabled: !canDelete, editDisabled: !canEdit };
      }
      return canEdit ? col : { ...col, editable: false };
    });
  }, [colDef, canEdit, canDelete]);

  const handleAddClick = useCallback(
    (...args) => {
      setIntent("add");
      return onAddClick?.(...args);
    },
    [onAddClick, setIntent],
  );

  const handleDoubleClick = useCallback(
    (...args) => {
      setIntent("edit");
      return onDoubleClick?.(...args);
    },
    [onDoubleClick, setIntent],
  );

  const handleCardClick = useCallback(
    (...args) => {
      setIntent("edit");
      return onCardClick?.(...args);
    },
    [onCardClick, setIntent],
  );

  const gridContextData = useMemo(() => {
    if (!contextData) return contextData;
    return (params) => {
      const items = typeof contextData === "function" ? contextData(params) : contextData;
      const adjusted = (items || []).map((item) => {
        if (!item || item.divider) return item;
        switch (item.permission) {
          case "status":
            return canEdit ? item : { ...item, hidden: true };
          case "delete":
            return canDelete ? item : { ...item, disabled: true };
          case "add":
            return canAdd ? item : { ...item, disabled: true };
          case "edit":
            return {
              ...item,
              ...(canEdit ? {} : { text: "View", icon: <Eye size={14} /> }),
              onClick: (row, ctx) => {
                setIntent("edit");
                return item.onClick?.(row, ctx);
              },
            };
          default:
            return item;
        }
      });
      return tidyMenuItems(adjusted, params?.row, params?.rowIndex);
    };
  }, [contextData, canAdd, canEdit, canDelete, setIntent]);

  if (!canView) {
    return (
      <div className={`hp-grid ${props.className || ""}`} style={props.style}>
        <NoPermission
          compact
          message="Your role doesn't include viewing this list. Ask your administrator if you need access."
        />
      </div>
    );
  }

  return (
    <HpGridBase
      {...props}
      colDef={gridColDef}
      onAddClick={typeof onAddClick === "function" ? handleAddClick : undefined}
      addDisabled={!canAdd}
      onDoubleClick={typeof onDoubleClick === "function" ? handleDoubleClick : undefined}
      onCardClick={typeof onCardClick === "function" ? handleCardClick : undefined}
      contextData={gridContextData}
      rowDraggable={canEdit ? rowDraggable : false}
      cardDraggable={canEdit ? cardDraggable : false}
    />
  );
}

export { HpGridBase };
export default HpGrid;
