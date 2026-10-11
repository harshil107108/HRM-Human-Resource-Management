/**
 * alertService.js
 * ---------------------------------------------------------------------------
 * Single source of truth for every SweetAlert2 dialog in the app.
 * useAlert(), useApiCall() and HpCommonModal all route through here, so the
 * look, motion and behavior of dialogs are defined exactly once.
 *
 * Key behaviors:
 *   - confirmDialog({ onConfirm }) keeps the dialog OPEN while the async
 *     action runs (spinner + disabled buttons, Esc/backdrop blocked), closes
 *     it only on success, and shows the failure inline so the user can retry
 *     or cancel. Repeated clicks can't fire duplicate requests.
 *   - Errors raised while such an action is running (e.g. useApiCall's
 *     automatic error popup) are routed into that inline message instead of
 *     replacing the confirm dialog.
 *   - Identical error dialogs are de-duplicated; a replaced dialog always
 *     resolves its promise (SweetAlert2 can otherwise leave it pending).
 * ---------------------------------------------------------------------------
 */

import Swal from "sweetalert2";
import "./feedback.css";
import { ICONS } from "./icons";
import { holdToasts } from "./toast";

export const DIALOG_VARIANTS = ["primary", "danger", "warning", "info", "success"];

const DEFAULT_ICON = {
  primary: "question",
  danger: "error",
  warning: "warning",
  info: "info",
  success: "success",
};

// SweetAlert2 `icon` values (drive its internal classes / semantics).
const SWAL_ICON_TYPE = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  question: "question",
  delete: "warning",
  offline: "error",
  lock: "warning",
};

const HrmSwal = Swal.mixin({
  buttonsStyling: false,
  // Swal's default sets `height:auto !important` on <html>/<body>, which
  // breaks the h-screen app shell and causes a visible layout jump.
  heightAuto: false,
  returnFocus: true,
  showClass: {
    popup: "hrm-alert-show",
    backdrop: "hrm-alert-backdrop-show",
  },
  hideClass: {
    popup: "hrm-alert-hide",
    backdrop: "hrm-alert-backdrop-hide",
  },
});

const BASE_CLASSES = {
  container: "hrm-alert-container",
  popup: "hrm-alert-popup",
  title: "hrm-alert-title",
  htmlContainer: "hrm-alert-message",
  actions: "hrm-alert-actions",
  confirmButton: "hrm-alert-button hrm-alert-button--confirm",
  cancelButton: "hrm-alert-button hrm-alert-button--cancel",
  closeButton: "hrm-alert-close",
  validationMessage: "hrm-alert-inline-error",
};

function mergeClasses(variant, customClass = {}) {
  const merged = { ...BASE_CLASSES };
  Object.entries(customClass || {}).forEach(([key, value]) => {
    if (!value) return;
    merged[key] = merged[key] ? `${merged[key]} ${value}` : value;
  });
  merged.popup = `${merged.popup} hrm-alert-popup--${variant}`;
  return merged;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Convert a message + optional detail list into safe dialog HTML. */
function buildHtml(text, details) {
  const list = Array.isArray(details) ? details.filter(Boolean) : [];
  if (!list.length) return undefined;
  const items = list.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const lead = text ? `<div>${escapeHtml(text)}</div>` : "";
  return `${lead}<ul class="hrm-alert-details">${items}</ul>`;
}

// ---------------------------------------------------------------------------
// Dialog lifecycle bookkeeping
// ---------------------------------------------------------------------------

let currentDialog = null; // { resolve, key, promise }
let pendingAction = null; // { error } while a confirm action is running

const DISMISSED_REPLACED = Object.freeze({
  isConfirmed: false,
  isDenied: false,
  isDismissed: true,
  dismiss: "replaced",
});

function fire(options, { dedupeKey } = {}) {
  if (
    dedupeKey &&
    currentDialog?.key === dedupeKey &&
    Swal.isVisible()
  ) {
    return currentDialog.promise;
  }

  // Resolve whatever was showing before; SweetAlert2 won't if it was busy.
  currentDialog?.resolve(DISMISSED_REPLACED);

  let resolveFn;
  const promise = new Promise((resolve) => {
    resolveFn = resolve;
  });
  const handle = { resolve: resolveFn, key: dedupeKey, promise };
  currentDialog = handle;

  HrmSwal.fire(options).then(
    (result) => {
      if (currentDialog === handle) currentDialog = null;
      resolveFn(result);
    },
    (error) => {
      if (currentDialog === handle) currentDialog = null;
      resolveFn({ isConfirmed: false, isDenied: false, isDismissed: true, dismiss: "error", error });
    },
  );

  return promise;
}

/** True while a confirmDialog's async action is in flight. */
export function isDialogActionPending() {
  return pendingAction !== null;
}

/**
 * If a confirm action is in flight, record `message` as its failure and
 * return true (the confirm dialog will display it inline). Otherwise false.
 */
export function reportPendingActionError(message) {
  if (!pendingAction) return false;
  if (!pendingAction.error) pendingAction.error = message || "The action could not be completed.";
  return true;
}

export function isDialogOpen() {
  return Swal.isVisible();
}

export function closeDialog() {
  if (Swal.isVisible()) Swal.close();
}

// ---------------------------------------------------------------------------
// Public dialog API
// ---------------------------------------------------------------------------

/**
 * Generic dialog. `variant` controls color + default icon.
 * Accepts any SweetAlert2 option for backward compatibility.
 */
export function showDialog(variant = "info", options = {}) {
  const {
    customClass,
    icon,
    iconName,
    details,
    dedupeKey,
    ...rest
  } = options;

  // Per-call colors are owned by the design system (CSS variants).
  delete rest.iconColor;
  delete rest.confirmButtonColor;
  delete rest.cancelButtonColor;

  const safeVariant = DIALOG_VARIANTS.includes(variant) ? variant : "info";
  const name = iconName || icon || DEFAULT_ICON[safeVariant];
  const showIcon = name !== false && name !== null && name !== "none";

  const swalOptions = {
    ...rest,
    customClass: mergeClasses(safeVariant, customClass),
  };

  if (showIcon) {
    swalOptions.icon = SWAL_ICON_TYPE[name] || "info";
    swalOptions.iconHtml = ICONS[name] || ICONS[SWAL_ICON_TYPE[name]] || ICONS.info;
  }

  if (!swalOptions.html) {
    const html = buildHtml(rest.text, details);
    if (html) {
      swalOptions.html = html;
      delete swalOptions.text;
    }
  }

  return fire(swalOptions, { dedupeKey });
}

function setConfirmBusy(button, busy, loadingText) {
  if (!button) return;
  if (busy) {
    button.dataset.hrmLabel = button.innerHTML;
    const spinner = document.createElement("span");
    spinner.className = "hrm-btn-spinner";
    spinner.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = loadingText;
    button.replaceChildren(spinner, label);
    button.setAttribute("aria-busy", "true");
  } else if (button.dataset.hrmLabel !== undefined) {
    button.innerHTML = button.dataset.hrmLabel;
    delete button.dataset.hrmLabel;
    button.removeAttribute("aria-busy");
  }
}

function toErrorMessage(error) {
  if (!error) return "The action could not be completed. Please try again.";
  if (typeof error === "string") return error;
  return error.message || "The action could not be completed. Please try again.";
}

/**
 * Confirmation dialog with optional async action.
 *
 * @param {object}   options
 * @param {"primary"|"danger"|"warning"|"info"} [options.variant]
 * @param {Function} [options.onConfirm]  async work to run before closing.
 *        Throwing, returning `false`, or triggering an app error popup keeps
 *        the dialog open with an inline error.
 * @param {string}   [options.loadingText] confirm button label while busy
 * @returns {Promise<{isConfirmed: boolean, isDismissed: boolean, dismiss?: string}>}
 */
export function confirmDialog({
  variant = "primary",
  onConfirm,
  loadingText = "Please wait…",
  focusCancel,
  ...options
} = {}) {
  // Never stack a second confirmation on top of one that is mid-request.
  if (pendingAction) {
    return Promise.resolve({ isConfirmed: false, isDismissed: true, dismiss: "busy" });
  }

  let busy = false;
  let releaseToasts = null;

  const preConfirm =
    typeof onConfirm === "function"
      ? async () => {
          const popup = Swal.getPopup();
          const action = { error: null };
          busy = true;
          pendingAction = action;
          releaseToasts?.();
          releaseToasts = holdToasts();
          popup?.setAttribute("aria-busy", "true");
          setConfirmBusy(Swal.getConfirmButton(), true, loadingText);

          try {
            const outcome = await onConfirm();
            if (outcome === false && !action.error) {
              action.error = "The action could not be completed. Please try again.";
            }
          } catch (error) {
            if (!action.error) action.error = toErrorMessage(error);
          } finally {
            busy = false;
            if (pendingAction === action) pendingAction = null;
          }

          const stillVisible = Swal.isVisible() && Swal.getPopup() === popup;

          if (action.error) {
            if (stillVisible) {
              popup.removeAttribute("aria-busy");
              setConfirmBusy(Swal.getConfirmButton(), false);
              Swal.enableButtons();
              Swal.showValidationMessage(action.error);
            } else {
              // Our dialog was replaced meanwhile; surface the error normally.
              errorDialog({ text: action.error });
            }
            releaseToasts?.();
            return false;
          }

          return true;
        }
      : undefined;

  return showDialog(variant, {
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    // Destructive dialogs focus Cancel so a stray Enter can't delete data.
    focusCancel: focusCancel ?? (variant === "danger" || variant === "warning"),
    allowOutsideClick: () => !busy,
    allowEscapeKey: () => !busy,
    ...options,
    preConfirm,
    didClose: () => {
      releaseToasts?.();
      options.didClose?.();
    },
  });
}

/**
 * Error dialog. While a confirmDialog action is running, the message is
 * routed into that dialog instead (unless `forceDialog` is set).
 *
 * @param {object} options
 * @param {string} [options.title]
 * @param {string} [options.text]
 * @param {string[]} [options.details] extra lines (e.g. validation errors)
 * @param {boolean} [options.retryable] show "Try again" + "Dismiss"
 * @returns {Promise<{isConfirmed:boolean, routed?:boolean}>}
 *          isConfirmed === true means the user chose "Try again".
 */
export function errorDialog({
  title = "Something went wrong",
  text = "Please try again.",
  details,
  retryable = false,
  forceDialog = false,
  confirmButtonText,
  cancelButtonText,
  ...options
} = {}) {
  if (!forceDialog && reportPendingActionError(text)) {
    return Promise.resolve({ isConfirmed: false, isDismissed: true, routed: true });
  }

  return showDialog("danger", {
    title,
    text,
    details,
    iconName: "error",
    confirmButtonText: confirmButtonText || (retryable ? "Try again" : "OK"),
    showCancelButton: retryable,
    cancelButtonText: cancelButtonText || "Dismiss",
    reverseButtons: true,
    dedupeKey: `error:${title}:${text}:${retryable}`,
    ...options,
    // Red is reserved for destructive actions; acknowledging or retrying
    // an error is a neutral, primary action.
    customClass: {
      ...options.customClass,
      confirmButton: ["hrm-alert-button--accent-primary", options.customClass?.confirmButton]
        .filter(Boolean)
        .join(" "),
    },
  });
}

/** Ask before discarding unsaved form changes. Resolves true to discard. */
export async function confirmDiscardChanges() {
  const result = await confirmDialog({
    variant: "warning",
    title: "Discard unsaved changes?",
    text: "You have unsaved changes in this form. If you close it now, they will be lost.",
    confirmButtonText: "Discard changes",
    cancelButtonText: "Keep editing",
  });
  return Boolean(result.isConfirmed);
}
