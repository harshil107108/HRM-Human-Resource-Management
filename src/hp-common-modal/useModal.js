/**
 * useModal.js
 * ---------------------------------------------------------------------------
 * Encapsulates all of the "invisible" behavior an enterprise modal needs:
 *   - body scroll locking while open
 *   - ESC-to-close (topmost modal only; ignored while a SweetAlert dialog is
 *     open or when a dropdown/date picker already handled the key)
 *   - Tab / Shift+Tab focus trapping inside the dialog
 *   - auto-focusing the first field on open (not on touch devices, where it
 *     would pop the virtual keyboard over the form)
 *   - returning focus to the trigger element on close/unmount
 *   - optional "confirm before closing" when the form has unsaved edits
 *
 * This keeps HpCommonModal.jsx focused purely on layout/composition.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { confirmDiscardChanges, isDialogOpen } from '@/components/feedback/alertService';
import {
  getFocusableElements,
  isCoarsePointer,
  lockBodyScroll,
  unlockBodyScroll,
} from './modalUtils';

// Stack of open overlays; only the last one reacts to keyboard events.
const overlayStack = [];
let overlayCounter = 0;

export function isTopmostOverlay(token) {
  return token !== null && overlayStack[overlayStack.length - 1] === token;
}

export function useModal({
  open,
  onClose,
  closeOnEscape = true,
  preventCloseWhileLoading = true,
  loading = false,
  isDirty = false,
  confirmBeforeClose = false,
  autoFocus = true,
}) {
  const dialogRef = useRef(null);
  const previouslyFocusedElement = useRef(null);
  const tokenRef = useRef(null);
  const confirmingRef = useRef(false);
  const userEditedRef = useRef(false);

  // Latest props for event handlers, without re-binding listeners each render.
  const latest = useRef({});
  useLayoutEffect(() => {
    latest.current = {
      onClose,
      closeOnEscape,
      preventCloseWhileLoading,
      loading,
      isDirty,
      confirmBeforeClose,
    };
  });

  // Attempt to close, honoring loading-guard and dirty-state confirmation.
  const requestClose = useCallback(async (reason) => {
    const state = latest.current;
    if (state.preventCloseWhileLoading && state.loading) return false;
    if (confirmingRef.current) return false;

    if (state.confirmBeforeClose && (state.isDirty || userEditedRef.current)) {
      confirmingRef.current = true;
      try {
        const discard = await confirmDiscardChanges();
        if (!discard) return false;
      } finally {
        confirmingRef.current = false;
      }
    }

    state.onClose?.(reason);
    return true;
  }, []);

  /** Mark the form as edited by the user (wired to input/change events). */
  const markEdited = useCallback((event) => {
    const native = event?.nativeEvent ?? event;
    if (native && native.isTrusted === false) return;
    userEditedRef.current = true;
  }, []);

  /** Reset the edited flag, e.g. after the form is cleared or re-loaded. */
  const markClean = useCallback(() => {
    userEditedRef.current = false;
  }, []);

  // Overlay stack, scroll lock and focus restoration — tied to `open`.
  useEffect(() => {
    if (!open) return undefined;

    overlayCounter += 1;
    const token = overlayCounter;
    tokenRef.current = token;
    overlayStack.push(token);
    previouslyFocusedElement.current = document.activeElement;
    userEditedRef.current = false;
    lockBodyScroll();

    return () => {
      const index = overlayStack.indexOf(token);
      if (index !== -1) overlayStack.splice(index, 1);
      if (tokenRef.current === token) tokenRef.current = null;
      unlockBodyScroll();

      const trigger = previouslyFocusedElement.current;
      previouslyFocusedElement.current = null;
      const active = document.activeElement;
      // Read at cleanup time on purpose: we need the dialog as it is now.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const dialog = dialogRef.current;
      const focusWasLost =
        !active || active === document.body || !active.isConnected ||
        Boolean(dialog?.contains(active));
      if (focusWasLost && trigger?.isConnected && typeof trigger.focus === 'function') {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [open]);

  // Initial focus: first field in the body, else the dialog itself.
  useEffect(() => {
    if (!open || !autoFocus) return undefined;
    const raf = requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(document.activeElement)) return;
      const body = dialog.querySelector('[data-hp-modal-body]');
      const firstField = isCoarsePointer() ? null : getFocusableElements(body)[0];
      (firstField || dialog).focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [open, autoFocus]);

  // ESC to close + Tab trapping, attached only while open. Bubble phase, so
  // react-select / date picker handlers run first and can preventDefault.
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (!isTopmostOverlay(tokenRef.current)) return;
      // A SweetAlert dialog above us owns the keyboard.
      if (isDialogOpen()) return;

      if (event.key === 'Escape') {
        if (event.defaultPrevented || event.isComposing) return;
        if (!latest.current.closeOnEscape) return;
        event.preventDefault();
        requestClose('escape');
        return;
      }

      if (event.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = getFocusableElements(dialog);
        const active = document.activeElement;

        if (focusables.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (!dialog.contains(active)) {
          // Focus is in a portaled dropdown/date picker: leave it alone,
          // unless it fell back to <body> — then pull it into the dialog.
          if (!active || active === document.body) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
          }
          return;
        }

        if (event.shiftKey && (active === first || active === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, requestClose]);

  return { dialogRef, requestClose, markEdited, markClean };
}
