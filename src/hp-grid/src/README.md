# HpGrid

A lightweight, fully custom data-grid component (AG Grid-style) built in
plain React. Editable cells, per-column behaviour, and an imperative
`GetGrid(id)` API so you can control the grid from anywhere in your app —
not just through props.

```
hp-grid/
├── src/
│   ├── HpGrid.jsx        <- main component (render + imperative API)
│   ├── GridRow.jsx        <- renders one row
│   ├── GridCell.jsx       <- renders one cell (editable / readonly)
│   ├── cellTypes.jsx      <- text/number/select/checkbox/date/textarea/actions/status/custom
│   ├── icons.jsx          <- inline SVG icons (pencil/trash/plus/search)
│   ├── utils.js           <- UUID generation, row-id helpers
│   ├── GridRegistry.js    <- powers GetGrid(id)
│   ├── HpGrid.css         <- default styling
│   └── index.js           <- public exports
└── example/
    └── App.jsx            <- full working usage example
```

## Install / Use

Copy the `src/` folder into your project (e.g. `src/components/hp-grid/`)
and import. Requires `react` and `react-dom` (both are peer dependencies of
any React app, and `HpGrid.jsx` uses `react-dom`'s `flushSync` internally):

```jsx
import { HpGrid, GetGrid } from "./components/hp-grid/src";
```

## Basic usage

```jsx
const userRowData = [
  { id: 1, name: "Ravi Shah", age: 28, status: "Active" },
  { id: 2, name: "Priya Mehta", age: 34, status: "Inactive" },
];

const userColDef = [
  {
    id: "name",
    field: "name",
    headerName: "Name",
    type: "text",
    editable: true,
  },
  {
    id: "age",
    field: "age",
    headerName: "Age",
    type: "number",
    editable: true,
    width: 100,
  },
  {
    id: "status",
    field: "status",
    headerName: "Status",
    type: "select",
    editable: true,
    options: ["Active", "Inactive"],
  },
];

function App() {
  return <HpGrid id="abc" rowData={userRowData} colDef={userColDef} />;
}
```

Then, from **any** file / event handler / component:

```js
import { GetGrid } from "./components/hp-grid/src";

const grid = GetGrid("abc");
grid.setRowData(newRows);
grid.setColDef(newCols);
grid.getGridData(); // -> { rowData, colDef }
grid.focusOnCell(row.id, "name"); // by the row's unique id + field/col name
grid.focusOnCellIndex(2, "name"); // by row INDEX (position) + field/col name
```

> **Note on data flow:** `rowData`/`colDef` props seed the grid's _initial_
> state only. After mount, update data via `GetGrid(id).setRowData(...)` /
> `setColDef(...)` rather than by re-passing new props — this keeps the
> grid's internal edit state (focus, selection) intact and matches how
> AG Grid's own imperative API works.

---

## `<HpGrid />` props

| Prop                | Type                                                                      | Description                                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | `string` **required**                                                     | Unique id used to look the grid up via `GetGrid(id)`                                                                                                                                                                                                                |
| `rowData`           | `array`                                                                   | Initial row data                                                                                                                                                                                                                                                    |
| `colDef`            | `array`                                                                   | Initial column definitions (see below)                                                                                                                                                                                                                              |
| `rowHeight`         | `number`                                                                  | Row height in px (default `40`)                                                                                                                                                                                                                                     |
| `headerHeight`      | `number`                                                                  | Header height in px (default `44`)                                                                                                                                                                                                                                  |
| `className`         | `string`                                                                  | Extra class on the grid's root element                                                                                                                                                                                                                              |
| `style`             | `object`                                                                  | Inline style on the grid's root element                                                                                                                                                                                                                             |
| `selectable`        | `boolean`                                                                 | Adds a checkbox selection column                                                                                                                                                                                                                                    |
| `rowClassName`      | `string \| (row, rowIndex) => string`                                     | Per-row class name                                                                                                                                                                                                                                                  |
| `onCellChange`      | `(rowIndex, field, value, row) => void`                                   | Fires when a cell's value is **committed** (Enter / blur), any column                                                                                                                                                                                               |
| `onCellBlur`        | `(rowIndex, field, value, row) => void`                                   | Fires when a cell loses focus, whether or not the value changed                                                                                                                                                                                                     |
| `onCellValueChange` | `({ rowIndex, colIndex, colId, field, oldValue, newValue, row }) => void` | Same commit trigger as `onCellChange`, but with the full before/after payload (AG Grid `onCellValueChanged`-style)                                                                                                                                                  |
| `onKeyDown`         | `(params) => void`                                                        | Fires on every keydown, for any cell, before HpGrid's own Arrow/Enter navigation runs. `params` = `{ event, key, rowIndex, colIndex, colId, field, value, row, colDef, rowData }`. Call `params.event.preventDefault()` inside it to fully take over that key press |
| `onSelectionChange` | `(selectedRows) => void`                                                  | Fires when the selection set changes                                                                                                                                                                                                                                |
| `title`             | `string`                                                                  | Toolbar title, e.g. `"Database & Branch"`                                                                                                                                                                                                                           |
| `icon`              | `ReactNode`                                                               | Small icon rendered in a teal square before the title                                                                                                                                                                                                               |
| `searchable`        | `boolean`                                                                 | Shows a search box in the toolbar; filters visible rows only (row indices used by the API stay correct)                                                                                                                                                             |
| `searchPlaceholder` | `string`                                                                  | Search box placeholder (default `"Search here..."`)                                                                                                                                                                                                                 |
| `onSearchChange`    | `(term) => void`                                                          | Fires as the user types in the search box                                                                                                                                                                                                                           |
| `addButtonLabel`    | `string`                                                                  | Label for the toolbar's add button, e.g. `"+ Add Database"`                                                                                                                                                                                                         |
| `onAddClick`        | `() => void`                                                              | If provided, shows the teal "+ Add" button in the toolbar                                                                                                                                                                                                           |
| `enterKeyMovement`  | `'right' \| 'down'`                                                       | What Enter does after committing a value. `'right'` (default): moves to the next column, same row, wrapping to the next row's first column at the end. `'down'`: classic spreadsheet behaviour, same column next row                                                |
| `getRowId`          | `(row) => string \| number`                                               | How `applyTransaction`'s `update`/`remove` match rows. Defaults to `row.id`                                                                                                                                                                                         |

## Performance model - how editing avoids re-render storms

Each editable cell keeps its own **local, uncommitted buffer**. Typing only
updates that cell's own local state - the shared `rowData` array (and
therefore every other row) is completely untouched while you type. The
value is written back into the grid, and `colDef.onChange` fires, only when:

- the user presses **Enter**, or
- the cell **blurs** (click away, Tab, focus moves elsewhere)

`colDef.onBlur` fires on every blur regardless of whether the value
actually changed, so you always get a final-value hook.

Combined with `React.memo` on each row (and passing only primitive focus
flags down, not a shared object), typing in one cell never re-renders any
other row.

```jsx
<HpGrid
  id="abc"
  rowData={userRowData}
  colDef={userColDef}
  onCellValueChange={({ rowIndex, field, oldValue, newValue, row }) => {
    console.log(`row ${rowIndex}, ${field}: ${oldValue} -> ${newValue}`, row);
  }}
  onKeyDown={(params) => {
    // Runs for every keydown, before HpGrid's own Enter/Arrow handling.
    // params = { event, key, rowIndex, colIndex, colId, field, value, row, colDef, rowData }
    if (params.key === "s" && (params.event.ctrlKey || params.event.metaKey)) {
      params.event.preventDefault();
      console.log("save shortcut pressed on", params.rowIndex, params.field);
    }
  }}
/>
```

For bulk updates (e.g. applying a batch of changes from a server push),
use `applyTransaction` (below) instead of many individual `updateCell`
calls - it preserves object identity for every row it doesn't touch, so
`React.memo` skips re-rendering them.

## Column definition (`colDef` item)

```js
{
  id: 'name',            // unique column id (falls back to `field`)
  field: 'name',         // key read/written on the row object
  headerName: 'Name',    // header label (falls back to `field`)
  type: 'text',          // 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'textarea' | 'custom' | 'actions' | 'status'
  editable: true,        // boolean, OR (row, rowIndex) => boolean
  skipFocusTrue: true,   // excludes this column from Enter/Arrow keyboard navigation
  width: 160,            // px; omit for flexible width
  className: 'my-cell',  // string, OR (value, row, rowIndex) => string
  options: [...],        // required for type: 'select' -> ['A','B'] or [{value,label}]
  placeholder: '...',    // text/select placeholder
  min, max, step,        // for type: 'number'
  maxLength,              // for type: 'text'
  render: (value, row, rowIndex) => ReactNode,        // custom read-only display
  editRenderer: ({ value, row, rowIndex, onChange, onBlur, innerRef }) => ReactNode, // for type: 'custom'
  onChange: (value, row, rowIndex) => void,           // fires when the value is COMMITTED (Enter / blur) - not per keystroke
  onBlur: (value, row, rowIndex) => void,             // fires on every blur, whether or not the value changed
}
```

## Built-in special column types

**`type: 'actions'`** — always read-only. Renders blue pencil / red trash icon
buttons, matching the reference UI's action column:

```js
{
  id: 'actions', field: 'actions', headerName: '', type: 'actions', width: 90,
  onEdit: (row, rowIndex) => { /* open edit modal, etc */ },
  onDelete: (row, rowIndex) => GetGrid('abc').removeRow(rowIndex),
  // optional extra buttons:
  actions: [{ icon: <MyIcon />, label: 'Duplicate', onClick: (row, rowIndex) => {} }],
}
```

**`type: 'status'`** — renders a small colored dot (teal = active, gray =
inactive), matching the reference UI's "Active" column:

```js
{ id: 'active', field: 'active', headerName: 'Active', type: 'status' }
// or with custom logic:
{ id: 'active', field: 'status', headerName: 'Active', type: 'status',
  isActive: (value) => value === 'HO' }
```

## Registering your own cell type

```js
import { registerCellType } from "./components/hp-grid/src";

registerCellType("rating", {
  renderEdit: ({ value, onChange, innerRef }) => (
    <StarPicker ref={innerRef} value={value} onChange={onChange} />
  ),
  formatView: (value) => "⭐".repeat(value || 0),
});
```

Then use `type: 'rating'` in any column definition.

---

## `GetGrid(id)` — imperative API reference

### Data

| Method                               | Description                                                       |
| ------------------------------------ | ----------------------------------------------------------------- |
| `setRowData(rows \| updaterFn)`      | Replace all row data. Accepts an array or `(prevRows) => newRows` |
| `setColDef(cols \| updaterFn)`       | Replace all column definitions                                    |
| `getRowData()`                       | Returns current row data array                                    |
| `getColDef()`                        | Returns current column definitions                                |
| `getGridData()`                      | Returns `{ rowData, colDef }`                                     |
| `getCellValue(rowIndex, colId)`      | Returns the value at a cell                                       |
| `updateCell(rowIndex, colId, value)` | Sets a single cell's value                                        |

### Row mutation

| Method                                                | Description                                                                                                                                                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addRow(row, atIndex?)`                               | Appends a row, or inserts at `atIndex`                                                                                                                                                              |
| `removeRow(rowIndex)`                                 | Removes a row                                                                                                                                                                                       |
| `applyTransaction({ add, addIndex, update, remove })` | Batch add/update/remove in one call. `update`/`remove` match existing rows via `getRowId` (default `row.id`). Preserves the object reference of every untouched row, so those rows don't re-render. |

```js
// Example: apply a batch of server-pushed changes in one call
GetGrid("abc").applyTransaction({
  update: [
    { id: 3, status: "Active" },
    { id: 7, status: "Inactive" },
  ],
  remove: [{ id: 12 }],
  add: [{ id: 99, name: "New Row" }],
});
```

### Focus

| Method                              | Description                                                                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `focusOnCellIndex(rowIndex, field)` | Focuses a cell by numeric row **index** (position in the array) + column field/id name                                                                                                           |
| `focusOnCell(rowId, field)`         | Focuses a cell by the row's **unique id** (via `getRowId`, default `row.id`) + column field/id name. Useful when you know a row's id but not its current position (e.g. after sorting/filtering) |

### Selection (requires `selectable`)

| Method                         | Description                  |
| ------------------------------ | ---------------------------- |
| `selectRow(rowIndex)`          | Selects a row                |
| `deselectRow(rowIndex)`        | Deselects a row              |
| `toggleRowSelection(rowIndex)` | Toggles a row's selection    |
| `selectAll()`                  | Selects every row            |
| `clearSelection()`             | Clears the selection         |
| `getSelectedRows()`            | Returns selected row objects |
| `getSelectedIndices()`         | Returns selected row indices |

### Sorting / misc

| Method                                 | Description                              |
| -------------------------------------- | ---------------------------------------- |
| `sortByColumn(colId, 'asc' \| 'desc')` | Sorts rows by a column's field value     |
| `refresh()`                            | Forces a re-render (new array reference) |
| `getId()`                              | Returns the grid's id                    |

---

## Adding a row and immediately focusing into it

`addRow`, `removeRow`, `setRowData`, and `applyTransaction` are synchronous
from the caller's point of view — by the time they return, React has already
committed the DOM update (they're internally wrapped in React's `flushSync`).
That means this exact pattern works correctly, with the new row already
mounted and focusable on the very next line:

```js
GetGrid("abc").addRow({ id: Date.now(), name: "", status: "Active" });
GetGrid("abc").focusOnCellIndex(2, "name"); // focuses the row that was just added
```

Without this, `focusOnCellIndex` would run before React finished rendering
the new row, and silently fail to find it. You don't need to do anything
special to get this - it's just how `addRow`/`removeRow`/`setRowData`/
`applyTransaction` behave. (This does mean these specific calls are a touch
heavier than a normal `setState`, since they force an immediate synchronous
re-render - fine for the occasional add/remove/replace they're meant for,
which is why the high-frequency typing path from the Performance model
above deliberately does _not_ use this.)

## Row identity (automatic UUIDs)

Every row is guaranteed a stable `id` the moment it enters the grid — on
initial load, via `addRow`, or via `applyTransaction`'s `add`. If a row you
provide already has an `id`, it's left untouched; if not, HpGrid generates
one (`crypto.randomUUID()`, with a manual fallback for older environments)
and attaches it. This `id` is what React uses as the row's list key, what
`applyTransaction`'s `update`/`remove` match against by default, and what
`getRowId` can override if your rows key on something else:

```jsx
<HpGrid id="abc" rowData={rows} colDef={cols} getRowId={(row) => row.sku} />
```

## Skipping a column during keyboard navigation

Set `skipFocusTrue: true` on a column to exclude it from Enter/Arrow-key
navigation entirely — ideal for an actions column made of buttons rather
than editable content:

```js
{
  id: 'actions', field: 'actions', headerName: '', type: 'actions', width: 90,
  skipFocusTrue: true,
  onEdit: (row, rowIndex) => { /* ... */ },
  onDelete: (row, rowIndex) => GetGrid('abc').removeRow(rowIndex),
}
```

With this set, pressing Enter or Arrow Left/Right on an adjacent cell jumps
straight over that column instead of landing on it (and it's skipped in the
native Tab order too, for read-only cells). This is purely a navigation
concern — it doesn't disable anything: `onChange`, `onBlur`, `onEdit`, and
`onDelete` all keep firing exactly as normal, and `grid.focusOnCell()` /
`grid.focusOnCellIndex()` can still target the column directly if you call
them yourself.

## Keyboard navigation (built in)

- **Arrow Up / Down** — move focus one row (works even while a text input is focused)
- **Arrow Left / Right** — move focus one column (only when the focused element isn't a text-editing input, so text cursor movement is never hijacked)
- **Enter** — commits the value, then moves focus to the **next column, same row** by default (`enterKeyMovement="right"`), wrapping to the next row's first column at the end of a row. Set `enterKeyMovement="down"` for classic spreadsheet behaviour (same column, next row) instead.
- **Escape** — blur the current cell

## Styling

All classes live in `HpGrid.css` under the `hp-grid-*` prefix (e.g.
`.hp-grid-row--selected`, `.hp-grid-cell--focused`, `.hp-grid-input`).
Override them globally, or use `colDef.className` / `rowClassName` for
per-cell / per-row overrides.
