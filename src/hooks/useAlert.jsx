import { useCallback, useMemo } from "react";
import {
    confirmDialog,
    errorDialog,
    showDialog,
    showToast,
} from "@/components/feedback";

/**
 * useAlert
 * ---------------------------------------------------------------------------
 * App-wide alert API. All signatures are backward compatible with the
 * previous SweetAlert2-only implementation; visuals and behavior now come
 * from the shared feedback system (src/components/feedback).
 *
 *  deleteAlert / confirmAlert — the dialog stays open with a loading state
 *      while `onClick` runs, closes only when it succeeds, and shows the
 *      failure inline (with the option to retry or cancel). Resolves `true`
 *      once confirmed and completed, `false` otherwise.
 *  successAlert — a non-blocking toast by default. Pass `toast: false` (or
 *      `showConfirmButton: true`) when the user must acknowledge it.
 *  errorAlert / warningAlert / infoAlert — dialogs.
 *  toastAlert — toast of any type.
 *  showAlert(message, type) — shorthand; "info"/"success" are toasts.
 * ---------------------------------------------------------------------------
 */

const toToastResult = ({ closed }) =>
    closed.then(({ reason }) => ({
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
        dismiss: reason,
    }));

const DESTRUCTIVE_WORDS = /delete|remove|discard|archive/i;

export default function useAlert() {
    const deleteAlert = useCallback(async ({
        title = "Delete this item?",
        text = "This action cannot be undone.",
        confirmButtonText = "Delete",
        cancelButtonText = "Cancel",
        loadingText,
        onClick,
        icon,
        ...options
    } = {}) => {
        const isDelete = DESTRUCTIVE_WORDS.test(`${title} ${confirmButtonText}`);
        const result = await confirmDialog({
            variant: "danger",
            iconName: icon || (isDelete ? "delete" : "warning"),
            title,
            text,
            confirmButtonText,
            cancelButtonText,
            loadingText: loadingText || (isDelete ? "Deleting…" : "Processing…"),
            onConfirm: onClick,
            ...options,
        });
        return Boolean(result.isConfirmed);
    }, []);

    const confirmAlert = useCallback(async ({
        title = "Are you sure?",
        text = "",
        icon = "question",
        confirmButtonText = "Confirm",
        cancelButtonText = "Cancel",
        loadingText = "Processing…",
        onClick,
        ...options
    } = {}) => {
        const result = await confirmDialog({
            variant: "primary",
            iconName: icon,
            title,
            text,
            confirmButtonText,
            cancelButtonText,
            loadingText,
            onConfirm: onClick,
            ...options,
        });
        return Boolean(result.isConfirmed);
    }, []);

    const successAlert = useCallback(({
        title = "Success",
        text = "",
        timer,
        toast = true,
        ...options
    } = {}) => {
        const needsAcknowledgement = toast === false || options.showConfirmButton === true;

        if (needsAcknowledgement) {
            return showDialog("success", {
                title,
                text,
                confirmButtonText: "OK",
                timer,
                timerProgressBar: Boolean(timer),
                ...options,
            });
        }

        return toToastResult(showToast({
            type: "success",
            title,
            message: text,
            duration: timer,
        }));
    }, []);

    const errorAlert = useCallback(({
        title = "Something went wrong",
        text = "Please try again.",
        confirmButtonText = "OK",
        ...options
    } = {}) => errorDialog({
        title,
        text,
        confirmButtonText,
        ...options,
    }), []);

    const warningAlert = useCallback(({
        title = "Warning",
        text = "",
        confirmButtonText = "OK",
        ...options
    } = {}) => showDialog("warning", {
        title,
        text,
        confirmButtonText,
        showCancelButton: false,
        ...options,
    }), []);

    const infoAlert = useCallback(({
        title = "Information",
        text = "",
        confirmButtonText = "OK",
        ...options
    } = {}) => showDialog("info", {
        title,
        text,
        confirmButtonText,
        showCancelButton: false,
        ...options,
    }), []);

    const toastAlert = useCallback(({
        title = "",
        text = "",
        type = "success",
        timer = 3000,
        action,
    } = {}) => toToastResult(showToast({
        type,
        title: title || text,
        message: title ? text : "",
        duration: timer,
        action,
    })), []);

    const showAlert = useCallback((message, type = "info") => {
        const options = typeof message === "string" ? { text: message } : message;
        const isPlainMessage = typeof message === "string";

        switch (type?.toLowerCase()) {
            case "success":
                return successAlert(isPlainMessage ? { title: message } : options);
            case "error":
            case "danger":
                return errorAlert(options);
            case "warning":
                return warningAlert(options);
            case "info":
            default:
                // Plain informational strings are status updates — keep them
                // non-blocking. Object options still get a full dialog.
                return isPlainMessage
                    ? toastAlert({ title: message, type: "info", timer: 4000 })
                    : infoAlert(options);
        }
    }, [errorAlert, infoAlert, successAlert, toastAlert, warningAlert]);

    return useMemo(() => ({
        deleteAlert,
        confirmAlert,
        successAlert,
        errorAlert,
        warningAlert,
        infoAlert,
        toastAlert,
        showAlert,
    }), [confirmAlert, deleteAlert, errorAlert, infoAlert, showAlert, successAlert, toastAlert, warningAlert]);
}
