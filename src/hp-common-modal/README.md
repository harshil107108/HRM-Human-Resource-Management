# HpCommonModal

Enterprise-grade, fully reusable modal framework for React 19 + Tailwind CSS,
built for use across every module of the HRM/ERP/CRM suite (Companies,
Branches, Departments, Employees, Designations, Roles, Leave, Payroll,
Attendance, Assets, Projects, Settings, ...).

## Install / Copy

Drop the `hp-common-modal/` folder anywhere in your project (e.g.
`src/components/hp-common-modal`) and import from it:

```jsx
import HpCommonModal from 'src/components/hp-common-modal';
```

Peer dependencies already assumed to be in your project: `react`, `react-dom`,
`react-hook-form`, `lucide-react`, `tailwindcss`.

## Folder structure

```
hp-common-modal/
  index.js            Public exports
  HpCommonModal.jsx    Main component
  ModalHeader.jsx      Header sub-component
  ModalBody.jsx        Scrollable body + error/success/validation banners
  ModalFooter.jsx      Clear / Cancel / Save action row
  ModalPortal.jsx       Portal rendering to document.body
  useModal.js          Focus trap, ESC, scroll lock, focus restore
  modalContext.js       Shared state between sub-components
  modalUtils.js         Framework-agnostic helpers
  modal.constants.js    Sizes, timings, default colors/text
  styles.css            Visual system + animations
  example.usage.jsx      Reference "Add Company" integration (not exported)
```

## Basic usage

```jsx
const formMethod = useForm();

<HpCommonModal
  open={open}
  title="Add Company"
  subTitle="Create a new company"
  size="md"
  icon={<Building2 />}
  formMethod={formMethod}
  loading={loading}
  onSave={handleSave}
  onClose={handleClose}
  onClear={handleClear}
>
  <CompanyForm />
</HpCommonModal>
```

`onSave` is automatically wrapped with `formMethod.handleSubmit(onSave)` when a
`formMethod` is supplied — no extra code required. Without `formMethod`,
`onSave` is called directly.

If `onSave` returns a promise, the modal tracks it: Save shows `Saving…`,
repeat clicks are ignored, and Close / Cancel / ESC / backdrop are blocked until
it settles. Close the modal from your success handler; on failure it stays open
with the user's input intact.

## Behavior

- **Animation** — 200ms fade/scale in, 150ms out (bottom sheet on phones ≤640px).
  The exit animation also plays when a parent unmounts the modal directly
  (`{isOpen && <MyModal open />}`). `prefers-reduced-motion` is respected.
- **Keyboard** — ESC closes the topmost modal only, and is ignored while a
  SweetAlert dialog is open or when a dropdown/date picker consumed the key.
  Tab is trapped inside the dialog; focus returns to the trigger on close.
- **Initial focus** — first field in the body (desktop). On touch devices the
  dialog itself is focused so the virtual keyboard doesn't cover the form.
- **Unsaved changes** — with `confirmBeforeClose`, closing after the user has
  typed/changed anything asks “Discard unsaved changes?”. Edits are detected
  from real user input events (or pass `isDirty` / an RHF `formMethod`).
  `Clear` resets the flag.
- **Layering** — modals `1000`, dropdown/date portals `9999`, image preview
  `1500`, SweetAlert dialogs `100000`, toasts `100010`.
- **Design tokens** — colors, radii, shadows and timings come from the
  `--hrm-*` variables on `:root` in `src/index.css`. Alerts, toasts and image
  previews live in `src/components/feedback` and share the same tokens.

## Props reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | bool | — | Controls visibility |
| `title` / `subTitle` | string | — | Header text |
| `icon` | node | — | Icon rendered left of the title |
| `children` | node | — | Body content |
| `size` | `xs\|sm\|md\|lg\|xl\|2xl\|full` | `md` | Dialog width |
| `formMethod` | RHF instance | — | Enables auto `handleSubmit` wiring |
| `loading` | bool | `false` | Shows a (delayed) loading veil over the body, disables actions |
| `active` | bool | `true` | Whether this instance owns focus/ESC (for nested modals) |
| `onSave` / `onClose` / `onClear` | fn | — | Action handlers |
| `saveText` / `savingText` / `cancelText` / `clearText` | string | `Save` / `Saving…` / `Cancel` / `Clear` | Button labels |
| `showHeader` / `showFooter` | bool | `true` | Toggle sections |
| `showCloseButton` / `showClearButton` / `showSaveButton` | bool | `true` / `false` / `true` | Toggle buttons |
| `disableSave` / `disableClear` / `disableClose` | bool | `false` | Force-disable a button |
| `closeOnBackdrop` | bool | `true` | Click outside to close |
| `closeOnEscape` | bool | `true` | ESC to close |
| `preventCloseWhileLoading` | bool | `true` | Blocks close actions while `loading` |
| `preventOutsideClick` | bool | `false` | Hard-disables backdrop click regardless of `closeOnBackdrop` |
| `confirmBeforeClose` | bool | `false` | Ask before discarding unsaved edits |
| `isDirty` | bool | — | Optional explicit dirty flag (overrides detection) |
| `scrollable` | bool | `true` | Body scrolls independently of header/footer |
| `stickyHeader` / `stickyFooter` | bool | `true` | Keep header/footer pinned during body scroll |
| `bodyClassName` / `headerClassName` / `footerClassName` / `className` | string | — | Extra class hooks |
| `header` / `footer` | node | — | Full custom override of that section |
| `maxHeight` | string | — | Cap on body height |
| `zIndex` | number | `1000` | Stacking context (raise for nested modals) |
| `primaryColor` / `secondaryColor` | CSS color | `#0F766E` / `#115E59` | Header gradient start / end |
| `errorMessage` / `successMessage` / `validationErrors` | string / string / string[] | — | Banners shown above body content |

## Nested modals

Render a second `<HpCommonModal>` inside the first one's `children`, give it a
higher `zIndex`. ESC/Tab handling automatically belongs to the topmost dialog;
`active={false}` on the parent is still supported for explicit control.