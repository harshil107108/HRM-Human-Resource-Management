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

## Props reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | bool | — | Controls visibility |
| `title` / `subTitle` | string | — | Header text |
| `icon` | node | — | Icon rendered left of the title |
| `children` | node | — | Body content |
| `size` | `xs\|sm\|md\|lg\|xl\|2xl\|full` | `md` | Dialog width |
| `formMethod` | RHF instance | — | Enables auto `handleSubmit` wiring |
| `loading` | bool | `false` | Shows spinner, disables actions |
| `active` | bool | `true` | Whether this instance owns focus/ESC (for nested modals) |
| `onSave` / `onClose` / `onClear` | fn | — | Action handlers |
| `saveText` / `cancelText` / `clearText` | string | `Save` / `Cancel` / `Clear` | Button labels |
| `showHeader` / `showFooter` | bool | `true` | Toggle sections |
| `showCloseButton` / `showClearButton` / `showSaveButton` | bool | `true` / `false` / `true` | Toggle buttons |
| `disableSave` / `disableClear` / `disableClose` | bool | `false` | Force-disable a button |
| `closeOnBackdrop` | bool | `true` | Click outside to close |
| `closeOnEscape` | bool | `true` | ESC to close |
| `preventCloseWhileLoading` | bool | `true` | Blocks close actions while `loading` |
| `preventOutsideClick` | bool | `false` | Hard-disables backdrop click regardless of `closeOnBackdrop` |
| `confirmBeforeClose` | bool | `false` | Ask for confirmation if the RHF form is dirty |
| `scrollable` | bool | `true` | Body scrolls independently of header/footer |
| `stickyHeader` / `stickyFooter` | bool | `true` | Keep header/footer pinned during body scroll |
| `bodyClassName` / `headerClassName` / `footerClassName` / `className` | string | — | Extra class hooks |
| `header` / `footer` | node | — | Full custom override of that section |
| `maxHeight` | string | — | Cap on body height |
| `zIndex` | number | `1000` | Stacking context (raise for nested modals) |
| `primaryColor` / `secondaryColor` | CSS color | `#0F766E` / `#115E59` | Icon accent + Save button fill / its hover shade (flat color, no gradient) |
| `errorMessage` / `successMessage` / `validationErrors` | string / string / string[] | — | Banners shown above body content |

## Nested modals

Render a second `<HpCommonModal>` inside the first one's `children`, give it a
higher `zIndex`, and set `active={false}` on the parent while the child is
open so ESC/Tab trapping is owned by the topmost dialog only.