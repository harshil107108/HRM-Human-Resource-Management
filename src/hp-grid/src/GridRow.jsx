import React from "react";
import GridCell from "./GridCell";

/**
 * GridRow.jsx
 * ------------------------------------------------------------------
 * Renders every cell for a single row. Memoized so unrelated rows
 * don't re-render when one cell changes.
 *
 * Note: we receive `isRowFocused` / `focusedColIndex` as plain
 * primitives (not the raw `focusedCell` object) on purpose. If we
 * passed the shared focus-state object straight through, EVERY row
 * would get a new object reference whenever focus moved anywhere in
 * the grid, defeating React.memo for all of them. Primitives compare
 * cheaply and correctly, so only the previously-focused row and the
 * newly-focused row actually re-render.
 * ------------------------------------------------------------------
 */
const GridRow = React.memo(function GridRow({
  row,
  rowIndex,
  colDef,
  selectable,
  isSelected,
  onToggleSelect,
  isRowFocused,
  focusedColIndex,
  registerCellRef,
  onCellCommit,
  onCellBlur,
  onCellFocus,
  onCellKeyDown,
  onDoubleClick,
  rowHeight,
  rowClassName,
}) {
  const dynamicRowClass =
    typeof rowClassName === "function"
      ? rowClassName(row, rowIndex)
      : rowClassName || "";

  const handleDoubleClick = (event) => {
    if (typeof onDoubleClick === "function") {
      onDoubleClick({
        event,
        row,
        rowIndex,
        data: row,
        colDef,
      });
    }
  };

  return (
    <div
      className={[
        "hp-grid-row",
        isSelected ? "hp-grid-row--selected" : "",
        dynamicRowClass,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ height: rowHeight }}
      onDoubleClick={handleDoubleClick}
    >
      {selectable && (
        <div className="hp-grid-cell hp-grid-cell--select-col">
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={() => onToggleSelect(rowIndex)}
          />
        </div>
      )}

      {colDef.map((col, colIndex) => (
        <div
          key={col.id || col.field}
          className="hp-grid-cell-outer"
          style={
            col.width
              ? { width: col.width, flex: `0 0 ${col.width}px` }
              : { flex: 1 }
          }
        >
          <GridCell
            ref={(node) => registerCellRef(rowIndex, colIndex, node)}
            value={row[col.field]}
            row={row}
            rowIndex={rowIndex}
            colIndex={colIndex}
            colDef={col}
            isFocused={isRowFocused && focusedColIndex === colIndex}
            onCommit={(val) => onCellCommit(rowIndex, colIndex, col, val)}
            onBlur={(val) => onCellBlur(rowIndex, colIndex, col, val)}
            onFocus={() => onCellFocus(rowIndex, colIndex)}
            onKeyDown={(e) => onCellKeyDown(e, rowIndex, colIndex)}
          />
        </div>
      ))}
    </div>
  );
});

export default GridRow;
