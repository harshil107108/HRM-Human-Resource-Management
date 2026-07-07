/**
 * useModal.js
 * ---------------------------------------------------------------------------
 * Encapsulates all of the "invisible" behavior an enterprise modal needs:
 *   - body scroll locking while open
 *   - ESC-to-close
 *   - Tab / Shift+Tab focus trapping inside the dialog
 *   - auto-focusing the first input on open
 *   - returning focus to the trigger element on close
 *   - optional "confirm before closing" when the form is dirty
 *
 * This keeps HpCommonModal.jsx focused purely on layout/composition.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useRef, useCallback } from 'react';
import { getFocusableElements, lockBodyScroll, unlockBodyScroll } from './modalUtils';

export function useModal({
  open,
  onClose,
  closeOnEscape = true,
  preventCloseWhileLoading = true,
  loading = false,
  isDirty = false,
  confirmBeforeClose = false,
}) {
  const dialogRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // Attempt to close, honoring loading-guard and dirty-state confirmation.
  const requestClose = useCallback(
    (reason) => {
      if (preventCloseWhileLoading && loading) return;

      if (confirmBeforeClose && isDirty) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to close this window?'
        );
        if (!confirmed) return;
      }

      onClose?.(reason);
    },
    [preventCloseWhileLoading, loading, confirmBeforeClose, isDirty, onClose]
  );

  // Body scroll lock — engaged only while the modal is open.
  useEffect(() => {
    if (!open) return undefined;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open]);

  // Remember the trigger element and restore focus to it on close.
  useEffect(() => {
    if (open) {
      previouslyFocusedElement.current = document.activeElement;
    } else if (previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus?.();
      previouslyFocusedElement.current = null;
    }
  }, [open]);

  // Auto-focus the first focusable element inside the dialog on open.
  useEffect(() => {
    if (!open) return undefined;
    const raf = requestAnimationFrame(() => {
      const focusables = getFocusableElements(dialogRef.current);
      (focusables[0] || dialogRef.current)?.focus?.();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // ESC to close + Tab trapping, attached only while open.
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape' && closeOnEscape) {
        event.stopPropagation();
        requestClose('escape');
        return;
      }

      if (event.key === 'Tab') {
        const focusables = getFocusableElements(dialogRef.current);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open, closeOnEscape, requestClose]);

  return { dialogRef, requestClose };
}