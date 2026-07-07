/**
 * modalUtils.js
 * ---------------------------------------------------------------------------
 * Small, dependency-free helper functions shared across the modal library.
 * Kept framework-agnostic (no React imports) so they stay easy to unit test.
 * ---------------------------------------------------------------------------
 */

import { MODAL_SIZES, DEFAULT_MODAL_SIZE, FOCUSABLE_SELECTOR } from './modal.constants';

/**
 * Merge class names, filtering out falsy values.
 * Lightweight stand-in for libraries like `clsx` so the package has zero
 * runtime dependencies beyond React itself.
 */
export function cx(...classNames) {
  return classNames.filter(Boolean).join(' ');
}

/**
 * Resolve the pixel/viewport width for a given `size` prop value.
 * Falls back to the default size for unknown/invalid values so a typo
 * in a consuming component never breaks the layout.
 */
export function resolveModalWidth(size) {
  return MODAL_SIZES[size] || MODAL_SIZES[DEFAULT_MODAL_SIZE];
}

/**
 * Return every focusable element inside a container, in DOM order.
 * Used by the focus-trap logic to figure out the first/last tab stops.
 */
export function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

/**
 * Locks/unlocks body scroll. Stores the original inline style so nested
 * modals (or a modal opening while a drawer is open) don't clobber each
 * other's cleanup.
 */
let scrollLockCount = 0;
let originalBodyOverflow = '';

export function lockBodyScroll() {
  if (scrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
}

export function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
  }
}

/**
 * Generates a stable, unique-enough id for ARIA attributes
 * (aria-labelledby / aria-describedby) without needing React 18's
 * useId in consuming code that may still be on older setups.
 */
let idCounter = 0;
export function generateModalId(prefix = 'hp-modal') {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
}