import React, { useState, useEffect, useRef, useCallback } from "react";
import { getCellType } from "./cellTypes";

/**
 * GridCell.jsx
 * ------------------------------------------------------------------
 * Renders ONE cell. Behaviour is entirely driven by the column
 * definition (colDef) for that column:
 *
 *   {
 *     id: 'name',            // unique column id (falls back to `field`)
 *     field: 'name',         // key read/written on the row object
 *     headerName: 'Name',
 *     type: 'text',          // 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'textarea' | 'custom' | 'actions' | 'status'
 *     editable: true,        // boolean OR (row, rowIndex) => boolean
 *     skipFocusTrue: true,   // excludes this column from Enter/Arrow keyboard
 *                            // navigation (and native Tab order when read-only) -
 *                            // useful for an actions/buttons column. Doesn't
 *                            // affect onChange/onBlur/onEdit/onDelete, and
 *                            // grid.focusOnCell()/focusOnCellIndex() can still
 *                            // target it directly.
 *     className: 'my-cell',  // string OR (value, row, rowIndex) => string
 *     width: 160,            // px, optional (flex otherwise)
 *     options: [...],        // for type: 'select'
 *     render: (value, row, rowIndex) => ReactNode,      // read-only display
 *     editRenderer: ({ value, onChange, onBlur }) => ReactNode, // for type: 'custom'
 *     onChange: (value, row, rowIndex) => void,  // fires when the value is COMMITTED (Enter / blur), not per keystroke
 *     onBlur: (value, row, rowIndex) => void,    // fires on every blur, regardless of whether the value changed
 *   }
 *
 * PERFORMANCE MODEL:
 * While typing, keystrokes only update this cell's own local buffer
 * (useState below) - the shared grid `rowData` is NOT touched, so no
 * other row or cell re-renders while you type. The value is written
 * back into the grid (and colDef.onChange fires) only when:
 *   - the user presses Enter, or
 *   - the cell blurs (click away / Tab / focus moves elsewhere)
 * This is what keeps typing fast even in a grid with thousands of rows.
 *
 * The `ref` forwarded to this component is attached to the actual
 * focusable/interactive DOM node (input/select/div), which is what
 * makes grid.focusOnCell() / grid.focusOnCellIndex() work.
 * ------------------------------------------------------------------
 */
const GridCell = React.forwardRef(function GridCell(props, ref) {
  const {
    value,
    row,
    rowIndex,
    colDef,
    isFocused,
    onCommit,
    onBlur,
    onFocus,
    onKeyDown,
  } = props;

  const editable =
    typeof colDef.editable === "function"
      ? !!colDef.editable(row, rowIndex)
      : !!colDef.editable;

  const cellType = getCellType(colDef.type);

  const dynamicClassName =
    typeof colDef.className === "function"
      ? colDef.className(value, row, rowIndex)
      : colDef.className || "";

  const wrapperClassName = [
    "hp-grid-cell",
    editable ? "hp-grid-cell--editable" : "hp-grid-cell--readonly",
    colDef.type === "status" ? "hp-grid-cell--status" : "",
    isFocused ? "hp-grid-cell--focused" : "",
    dynamicClassName,
  ]
    .filter(Boolean)
    .join(" ");

  // ---- Local, uncommitted edit buffer (editable cells only) ----
  const [localValue, setLocalValue] = useState(value);
  const lastCommittedRef = useRef(value);

  useEffect(() => {
    // The underlying data changed from OUTSIDE this cell (setRowData,
    // applyTransaction, another user, etc). Only resync while the cell
    // isn't focused, so we never clobber what the person is mid-typing.
    if (!isFocused) {
      setLocalValue(value);
      lastCommittedRef.current = value;
    }
  }, [value, isFocused]);

  const commitIfChanged = useCallback(() => {
    if (localValue !== lastCommittedRef.current) {
      lastCommittedRef.current = localValue;
      onCommit(localValue);
    }
  }, [localValue, onCommit]);

  const handleLocalChange = useCallback((val) => setLocalValue(val), []);

  const handleBlur = useCallback(() => {
    commitIfChanged();
    onBlur(localValue);
  }, [commitIfChanged, onBlur, localValue]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") commitIfChanged();
      onKeyDown(e);
    },
    [commitIfChanged, onKeyDown],
  );

  // ---- Read-only cell: the wrapper div itself is the focusable node ----
  if (!editable) {
    const displayValue = colDef.render
      ? colDef.render(value, row, rowIndex)
      : cellType.formatView
        ? cellType.formatView(value, colDef, row, rowIndex)
        : value;

    return (
      <div
        ref={ref}
        className={wrapperClassName}
        tabIndex={colDef.skipFocusTrue ? -1 : 0}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      >
        {displayValue}
      </div>
    );
  }

  // ---- Editable cell: ref goes to the real input/select element ----
  return (
    <div
      className={wrapperClassName}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
    >
      {cellType.renderEdit({
        value: localValue,
        row,
        rowIndex,
        colDef,
        onChange: handleLocalChange,
        onBlur: handleBlur,
        innerRef: ref,
      })}
    </div>
  );
});

export default GridCell;
