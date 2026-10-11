/**
 * modalUtils.js
 * ---------------------------------------------------------------------------
 * Small, dependency-free helper functions shared across the modal library.
 * Kept framework-agnostic (no React imports) so they stay easy to unit test.
 * ---------------------------------------------------------------------------
 */

import {
  MODAL_SIZES,
  DEFAULT_MODAL_SIZE,
  FOCUSABLE_SELECTOR,
  ANIMATION_DURATION_MS,
} from './modal.constants';

/**
 * Merge class names, filtering out falsy values.
 * Lightweight stand-in for libraries like `clsx` so the package has zero
 * runtime dependencies beyond React itself.
 */
export function cx(...classNames) {
  return classNames.filter(Boolean).join(' ');
}

/**
 * Resolve the maximum width for a given `size` prop value.
 * Falls back to the default size for unknown/invalid values so a typo
 * in a consuming component never breaks the layout.
 */
export function resolveModalWidth(size) {
  return MODAL_SIZES[size] || MODAL_SIZES[DEFAULT_MODAL_SIZE];
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  );
}

export function isCoarsePointer() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(pointer: coarse)').matches)
  );
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
 * Locks/unlocks body scroll. Reference-counted so nested modals (or a modal
 * opening while a drawer is open) don't clobber each other's cleanup.
 * Compensates for the disappearing scrollbar to avoid a horizontal shift.
 */
let scrollLockCount = 0;
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';

export function lockBodyScroll() {
  if (scrollLockCount === 0) {
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    originalBodyOverflow = body.style.overflow;
    originalBodyPaddingRight = body.style.paddingRight;
    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
    body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
}

export function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
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

/**
 * Exit animation for overlays that are unmounted while still open.
 *
 * Listings render modals conditionally (`{isOpen && <Modal open />}`), so
 * React removes the DOM immediately and no exit transition can run. Right
 * before removal we clone the overlay into an inert, aria-hidden "ghost"
 * that plays the exit animation and then removes itself.
 *
 * @param {HTMLElement} container portal container about to be removed
 */
export function playExitGhost(container) {
  const overlay = container?.firstElementChild;
  if (!overlay || overlay.getAttribute('data-state') !== 'entered') return;
  if (prefersReducedMotion()) return;

  const ghost = overlay.cloneNode(true);
  ghost.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  ghost.querySelectorAll('[data-state]').forEach((node) => node.setAttribute('data-state', 'exiting'));
  ghost.setAttribute('data-state', 'exiting');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.setAttribute('inert', '');
  ghost.style.pointerEvents = 'none';

  const host = document.createElement('div');
  host.setAttribute('data-hp-overlay-ghost', 'true');
  host.appendChild(ghost);
  document.body.appendChild(host);

  // Keep the scroll position so the content doesn't jump while fading out.
  const liveScrollers = overlay.querySelectorAll('[data-hp-scroll]');
  const ghostScrollers = ghost.querySelectorAll('[data-hp-scroll]');
  liveScrollers.forEach((node, index) => {
    if (ghostScrollers[index]) ghostScrollers[index].scrollTop = node.scrollTop;
  });

  window.setTimeout(() => host.remove(), ANIMATION_DURATION_MS + 60);
}
