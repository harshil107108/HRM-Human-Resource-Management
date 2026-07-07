/**
 * modal.constants.js
 * ---------------------------------------------------------------------------
 * Central configuration for HpCommonModal.
 * Keeping these values in one place means every consumer of the modal
 * (Companies, Branches, Departments, Employees, Payroll, etc.) gets a
 * consistent set of sizes, timings, and defaults without re-declaring them.
 * ---------------------------------------------------------------------------
 */

// Pixel / viewport widths for each supported `size` prop value.
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
// Kept short and non-bouncy to match enterprise UI conventions
// (Dynamics 365 / Fiori / Fluent all favor near-instant, subtle transitions).
export const ANIMATION_DURATION_MS = 150;

// Base z-index for the portal. The backdrop sits at BASE, the dialog at BASE + 1.
// Nested modals stack on top of this using the `zIndex` prop.
export const DEFAULT_Z_INDEX = 1000;

// Default button labels — can be overridden per-instance via props.
export const DEFAULT_TEXT = {
  save: 'Save',
  saving: 'Saving...',
  cancel: 'Cancel',
  clear: 'Clear',
};

// Default brand colors. `primaryColor` drives the icon accent and the Save
// button's solid fill; `secondaryColor` is used as its hover/active shade
// (no gradients — enterprise chrome uses flat, solid color only).
// Consumers can still override either via props to match a module's branding.
export const DEFAULT_PRIMARY_COLOR = '#0F766E';
export const DEFAULT_SECONDARY_COLOR = '#115E59';

// Shared design tokens referenced by styles.css and inline styles.
export const MODAL_BORDER_COLOR = '#E5E7EB';
export const MODAL_RADIUS = '6px';
export const MODAL_SHADOW = '0 2px 10px rgba(0, 0, 0, 0.08)';

// Keys considered "focusable" for the Tab-trapping logic in useModal.js.
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');