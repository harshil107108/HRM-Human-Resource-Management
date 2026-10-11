/**
 * Shared feedback system: dialogs, toasts and image preview.
 * Prefer the useAlert() hook inside components; these exports are for
 * non-component code (services, hooks) and advanced usage.
 */

export {
  showDialog,
  confirmDialog,
  errorDialog,
  confirmDiscardChanges,
  closeDialog,
  isDialogOpen,
  isDialogActionPending,
  reportPendingActionError,
  escapeHtml,
  DIALOG_VARIANTS,
} from "./alertService";

export { toast, showToast, holdToasts, dismissAllToasts } from "./toast";

export { default as HpImagePreview } from "./HpImagePreview";
export { default as HpPageLoader } from "./HpPageLoader";
