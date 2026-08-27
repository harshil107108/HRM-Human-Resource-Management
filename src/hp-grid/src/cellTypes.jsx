import React from "react";
import { PencilIcon, TrashIcon } from "./icons";

/**
 * cellTypes.jsx
 * ------------------------------------------------------------------
 * Registry of cell "types". Each type defines:
 *   - renderEdit({ value, row, rowIndex, colDef, onChange, onBlur, innerRef })
 *        -> JSX shown when the cell is editable (colDef.editable === true)
 *   - formatView(value, colDef) [optional]
 *        -> how to format the value when the cell is read-only
 *
 * You are not limited to the built-ins below. Register your own:
 *
 *   import { registerCellType } from './cellTypes';
 *   registerCellType('rating', {
 *     renderEdit: ({ value, onChange }) => <StarPicker value={value} onChange={onChange} />,
 *     formatView: (value) => '⭐'.repeat(value || 0),
 *   });
 *
 * Then simply use `type: 'rating'` in a column definition.
 * ------------------------------------------------------------------
 */

const cellTypeRegistry = new Map();

export function registerCellType(type, definition) {
  cellTypeRegistry.set(type, definition);
}

export function getCellType(type) {
  return cellTypeRegistry.get(type) || cellTypeRegistry.get("text");
}

/* ---------------------------- text ---------------------------- */
registerCellType("text", {
  renderEdit: ({ value, onChange, onBlur, colDef, innerRef }) => (
    <input
      ref={innerRef}
      type="text"
      className="hp-grid-input"
      value={value ?? ""}
      placeholder={colDef.placeholder}
      maxLength={colDef.maxLength}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur && onBlur(e.target.value)}
    />
  ),
});

/* --------------------------- number ---------------------------- */
registerCellType("number", {
  renderEdit: ({ value, onChange, onBlur, colDef, innerRef }) => (
    <input
      ref={innerRef}
      type="number"
      className="hp-grid-input hp-grid-input--number"
      value={value === null || value === undefined ? "" : value}
      min={colDef.min}
      max={colDef.max}
      step={colDef.step ?? 1}
      onChange={(e) =>
        onChange(e.target.value === "" ? "" : Number(e.target.value))
      }
      onBlur={(e) =>
        onBlur && onBlur(e.target.value === "" ? "" : Number(e.target.value))
      }
    />
  ),
});

/* --------------------------- select ----------------------------- */
registerCellType("select", {
  renderEdit: ({ value, onChange, onBlur, colDef, innerRef }) => (
    <select
      ref={innerRef}
      className="hp-grid-select"
      value={value ?? ""}
      onChange={(e) => {
        onChange(e.target.value);
        onBlur && onBlur(e.target.value);
      }}
    >
      <option value="" disabled>
        {colDef.placeholder || "Select..."}
      </option>
      {(colDef.options || []).map((opt) => {
        const v = typeof opt === "object" ? opt.value : opt;
        const label = typeof opt === "object" ? opt.label : opt;
        return (
          <option key={v} value={v}>
            {label}
          </option>
        );
      })}
    </select>
  ),
  formatView: (value, colDef) => {
    const match = (colDef.options || []).find(
      (o) => (typeof o === "object" ? o.value : o) === value,
    );
    if (!match) return value ?? "";
    return typeof match === "object" ? match.label : match;
  },
});

/* -------------------------- checkbox ---------------------------- */
registerCellType("checkbox", {
  renderEdit: ({ value, onChange, onBlur, innerRef }) => (
    <input
      ref={innerRef}
      type="checkbox"
      className="hp-grid-checkbox"
      checked={!!value}
      onChange={(e) => {
        onChange(e.target.checked);
        onBlur && onBlur(e.target.checked);
      }}
    />
  ),
  formatView: (value) => (value ? "✓" : ""),
});

/* ----------------------------- date ------------------------------ */
registerCellType("date", {
  renderEdit: ({ value, onChange, onBlur, innerRef }) => (
    <input
      ref={innerRef}
      type="date"
      className="hp-grid-input"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur && onBlur(e.target.value)}
    />
  ),
});

/* --------------------------- textarea ----------------------------- */
registerCellType("textarea", {
  renderEdit: ({ value, onChange, onBlur, innerRef }) => (
    <textarea
      ref={innerRef}
      rows={1}
      className="hp-grid-textarea"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur && onBlur(e.target.value)}
    />
  ),
});

/* ---------------------------- custom ------------------------------ */
// Fully custom edit/view renderer supplied per-column via colDef.editRenderer
// and colDef.render. Falls back to plain text if not supplied.
registerCellType("custom", {
  renderEdit: ({
    value,
    row,
    rowIndex,
    colDef,
    onChange,
    onBlur,
    innerRef,
  }) => {
    if (typeof colDef.editRenderer === "function") {
      return colDef.editRenderer({
        value,
        row,
        rowIndex,
        onChange,
        onBlur,
        innerRef,
      });
    }
    return (
      <span ref={innerRef} tabIndex={0}>
        {value}
      </span>
    );
  },
});

/* ---------------------------- actions ------------------------------ */
// Always read-only. Renders row-level icon buttons (edit / delete / custom),
// matching the pencil + trash action column used throughout the reference UI.
//
//   { id: 'actions', field: 'actions', headerName: '', type: 'actions', width: 90,
//     onEdit: (row, rowIndex) => {...},
//     onDelete: (row, rowIndex) => {...},
//     actions: [ { icon: <MyIcon/>, label: 'Duplicate', onClick: (row, rowIndex) => {} } ] // optional extras
//   }
registerCellType("actions", {
  formatView: (value, colDef, row, rowIndex) => (
    <div className="hp-grid-actions">
      {typeof colDef.onClick === "function" && (
        <button
          type="button"
          className="hp-grid-action-btn hp-grid-action-btn--delete"
          title={colDef.actionLabel || "Delete"}
          onClick={() => colDef.onClick(row, rowIndex)}
        >
          <TrashIcon />
        </button>
      )}
      {typeof colDef.onEdit === "function" && (
        <button
          type="button"
          className="hp-grid-action-btn hp-grid-action-btn--edit"
          title="Edit"
          onClick={() => colDef.onEdit(row, rowIndex)}
        >
          <PencilIcon />
        </button>
      )}
      {typeof colDef.onDelete === "function" && (
        <button
          type="button"
          className="hp-grid-action-btn hp-grid-action-btn--delete"
          title="Delete"
          onClick={() => colDef.onDelete(row, rowIndex)}
        >
          <TrashIcon />
        </button>
      )}
      {Array.isArray(colDef.actions) &&
        colDef.actions.map((action, i) => (
          <button
            key={i}
            type="button"
            className={`hp-grid-action-btn hp-grid-action-btn--${action.type || "default"}`}
            title={action.label}
            onClick={() => action.onClick(row, rowIndex)}
          >
            {action.icon}
          </button>
        ))}
    </div>
  ),
});

/* ---------------------------- status ------------------------------- */
// Renders a small colored dot, matching the "Active" column dot indicator.
//
//   { id: 'active', field: 'active', headerName: 'Active', type: 'status' }
registerCellType("status", {
  formatView: (value, colDef) => {
    const isActive =
      typeof colDef.isActive === "function" ? colDef.isActive(value) : !!value;
    return (
      <span
        className={`hp-grid-status-dot ${isActive ? "hp-grid-status-dot--active" : "hp-grid-status-dot--inactive"}`}
      />
    );
  },
});
