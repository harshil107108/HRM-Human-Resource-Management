/**
 * modal.constants.js
 * ---------------------------------------------------------------------------
 * Central configuration for HpCommonModal.
 * Keeping these values in one place means every consumer of the modal
 * (Companies, Branches, Departments, Employees, Payroll, etc.) gets a
 * consistent set of sizes, timings, and defaults without re-declaring them.
 * Visual tokens (colors, radii, shadows) live on :root in src/index.css.
 * ---------------------------------------------------------------------------
 */

// Maximum widths for each supported `size` prop value. The dialog never
// exceeds the viewport: CSS applies `width: min(<size>, 100%)`.
export const MODAL_SIZES = {
  xs: '400px',
  sm: '500px',
  md: '700px',
  lg: '900px',
  xl: '1100px',
  '2xl': '1300px',
  full: '95vw',
};

// Fallback size used when an invalid/unknown size prop is supplied.
export const DEFAULT_MODAL_SIZE = 'md';

// Animation timing — must match the durations used in styles.css.
// Short and non-bouncy: enter 200ms, exit 150ms.
export const ENTER_ANIMATION_MS = 200;
export const ANIMATION_DURATION_MS = 150;

// Base z-index for the portal (mirrors --hrm-z-modal). Dropdown and date
// picker portals use 9999 so they always render above an open modal;
// SweetAlert dialogs (100000) and toasts (100010) sit above everything.
export const DEFAULT_Z_INDEX = 1000;

// Default button labels — can be overridden per-instance via props.
export const DEFAULT_TEXT = {
  save: 'Save',
  saving: 'Saving…',
  cancel: 'Cancel',
  clear: 'Clear',
};

// Default brand colors (teal header gradient). `primaryColor` drives the header
// icon accent and the Save button fill; `secondaryColor` is its hover shade.
// Consumers can still override either via props to match a module's branding.
export const DEFAULT_PRIMARY_COLOR = '#0F766E';
export const DEFAULT_SECONDARY_COLOR = '#115E59';

// Shared design tokens referenced by inline styles (CSS uses the :root vars).
export const MODAL_BORDER_COLOR = '#E2E8F0';
export const MODAL_RADIUS = '14px';
export const MODAL_SHADOW =
  '0 1px 2px rgb(15 23 42 / 0.06), 0 12px 32px -6px rgb(15 23 42 / 0.18), 0 32px 64px -16px rgb(15 23 42 / 0.22)';

// Keys considered "focusable" for the Tab-trapping logic in useModal.js.
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
