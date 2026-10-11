/**
 * HpCommonModal.jsx
 * ---------------------------------------------------------------------------
 * Enterprise-grade, fully reusable modal component used across every module
 * of the HRM/ERP/CRM suite (Companies, Branches, Departments, Employees,
 * Payroll, Attendance, Assets, Projects, Settings, ...).
 *
 * Responsibilities:
 *   - Portal rendering + backdrop
 *   - Open/close enter-exit animation (CSS keyframes; exit also plays when
 *     the parent unmounts the modal directly — see playExitGhost)
 *   - Save handling: if `onSave` returns a promise the Save button shows a
 *     "Saving…" state, the dialog can't be closed, and repeat clicks are
 *     ignored until it settles
 *   - React Hook Form integration (FormProvider + handleSubmit wiring)
 *   - Composition of Header / Body / Footer via ModalContext
 *   - Delegates keyboard/focus/scroll-lock behavior to useModal()
 * ---------------------------------------------------------------------------
 */

import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { FormProvider } from 'react-hook-form';
import ModalPortal from './ModalPortal';
import ModalHeader from './ModalHeader';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import { ModalContext } from './modalContext';
import { useModal } from './useModal';
import { cx, resolveModalWidth, generateModalId, prefersReducedMotion } from './modalUtils';
import {
    ANIMATION_DURATION_MS,
    DEFAULT_Z_INDEX,
    DEFAULT_TEXT,
    DEFAULT_PRIMARY_COLOR,
    DEFAULT_SECONDARY_COLOR,
} from './modal.constants';
import { Lock } from 'lucide-react';
import { useRouteAccess, canSaveForm } from '@/context/RouteAccessContext';
import './styles.css';

function HpCommonModal({
    open,
    title,
    subTitle,
    icon,
    children,
    size = 'md',
    formMethod,
    loading = false,
    active = true,
    onSave,
    onClose,
    onClear,
    saveText = DEFAULT_TEXT.save,
    savingText = DEFAULT_TEXT.saving,
    cancelText = DEFAULT_TEXT.cancel,
    clearText = DEFAULT_TEXT.clear,
    showHeader = true,
    showFooter = true,
    showCloseButton = true,
    showClearButton = false,
    showSaveButton = true,
    disableSave = false,
    disableClear = false,
    disableClose = false,
    closeOnBackdrop = true,
    closeOnEscape = true,
    preventCloseWhileLoading = true,
    preventOutsideClick = false,
    confirmBeforeClose = false,
    isDirty: isDirtyProp,
    scrollable = true,
    stickyHeader = true,
    stickyFooter = true,
    bodyClassName,
    headerClassName,
    footerClassName,
    className,
    footer,
    header,
    maxHeight,
    zIndex = DEFAULT_Z_INDEX,
    primaryColor = DEFAULT_PRIMARY_COLOR,
    secondaryColor = DEFAULT_SECONDARY_COLOR,
    errorMessage,
    successMessage,
    validationErrors,
}) {
    // Keep the dialog mounted for the duration of the exit animation when a
    // consumer keeps the modal mounted and flips `open` to false.
    const [shouldRender, setShouldRender] = useState(open);
    if (open && !shouldRender) {
        setShouldRender(true);
    }
    const animationPhase = open ? 'entered' : 'exiting';

    useEffect(() => {
        if (open || !shouldRender) return undefined;
        const timeoutId = window.setTimeout(
            () => setShouldRender(false),
            prefersReducedMotion() ? 0 : ANIMATION_DURATION_MS
        );
        return () => window.clearTimeout(timeoutId);
    }, [open, shouldRender]);

    // Stable ids for ARIA wiring between the dialog and its title/description.
    const titleId = useMemo(() => generateModalId('hp-modal-title'), []);
    const descriptionId = useMemo(() => generateModalId('hp-modal-desc'), []);

    // Track async saves so the UI reflects them even when the consumer
    // doesn't pass `loading` (or passes a value that doesn't re-render).
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);
    const mountedRef = useRef(false);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const busy = Boolean(loading) || saving;
    const isDirty = Boolean(isDirtyProp ?? formMethod?.formState?.isDirty);

    const { dialogRef, requestClose, markEdited, markClean } = useModal({
        open: open && active,
        onClose,
        closeOnEscape: closeOnEscape && active,
        preventCloseWhileLoading,
        loading: busy,
        isDirty,
        confirmBeforeClose,
    });

    // If a formMethod (React Hook Form) instance is supplied, Save
    // automatically runs validation via handleSubmit before calling onSave.
    // Otherwise Save calls onSave directly — no extra wiring required either way.
    // Page rights: without Add (new record) / Edit (existing record) the
    // modal opens view-only — fields and Save/Clear are disabled.
    const access = useRouteAccess();
    const readOnly = showSaveButton && typeof onSave === 'function' && !canSaveForm(access);

    const handleSave = useCallback(async () => {
        if (savingRef.current || readOnly) return;

        const run = formMethod?.handleSubmit ? formMethod.handleSubmit(onSave) : onSave;
        const result = run?.();
        if (!result || typeof result.then !== 'function') return;

        savingRef.current = true;
        setSaving(true);
        try {
            await result;
        } finally {
            savingRef.current = false;
            if (mountedRef.current) setSaving(false);
        }
    }, [formMethod, onSave, readOnly]);

    const handleClear = useCallback(() => {
        onClear?.();
        markClean();
    }, [onClear, markClean]);

    // Close on backdrop only when the press both started and ended on it, so
    // selecting text inside the form and releasing outside never closes it.
    const pointerDownOnBackdrop = useRef(false);
    const handleBackdropPointerDown = useCallback((event) => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget;
    }, []);
    const handleBackdropClick = useCallback(
        (event) => {
            const startedOnBackdrop = pointerDownOnBackdrop.current;
            pointerDownOnBackdrop.current = false;
            if (!startedOnBackdrop || event.target !== event.currentTarget) return;
            if (preventOutsideClick || !closeOnBackdrop || !active) return;
            requestClose('backdrop');
        },
        [preventOutsideClick, closeOnBackdrop, active, requestClose]
    );

    if (!shouldRender) return null;

    const contextValue = {
        titleId,
        descriptionId,
        title,
        subTitle,
        icon,
        header,
        footer,
        showHeader,
        showFooter,
        showCloseButton,
        showClearButton,
        showSaveButton,
        disableSave: disableSave || readOnly,
        disableClear: disableClear || readOnly,
        readOnly,
        disableClose,
        loading: busy,
        saving,
        preventCloseWhileLoading,
        saveText,
        savingText,
        cancelText,
        clearText,
        onSave: handleSave,
        onClear: handleClear,
        requestClose,
        headerClassName,
        footerClassName,
        stickyHeader,
        stickyFooter,
        scrollable,
        maxHeight,
        bodyClassName,
        errorMessage,
        successMessage,
        validationErrors,
    };

    const dialogContent = (
        <div
            className="hp-modal-backdrop"
            style={{ zIndex }}
            data-state={animationPhase}
            onPointerDown={handleBackdropPointerDown}
            onClick={handleBackdropClick}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={showHeader && !header ? titleId : undefined}
                aria-label={showHeader && !header ? undefined : (typeof title === 'string' ? title : undefined)}
                aria-describedby={descriptionId}
                aria-busy={busy || undefined}
                tabIndex={-1}
                className={cx('hp-modal-dialog', className)}
                data-state={animationPhase}
                style={{
                    '--hp-modal-width': resolveModalWidth(size),
                    '--hp-modal-primary': primaryColor,
                    '--hp-modal-secondary': secondaryColor,
                }}
                onInputCapture={markEdited}
                onChangeCapture={markEdited}
            >
                <ModalContext.Provider value={contextValue}>
                    <ModalHeader />

                    {formMethod ? (
                        <FormProvider {...formMethod}>
                            <ModalBody>
                {readOnly && (
                    <div className="hp-modal-readonly" role="note">
                        <Lock size={14} aria-hidden="true" />
                        <span>View only — you don't have permission to {access.intent === 'add' ? 'add records' : 'make changes'} here.</span>
                    </div>
                )}
                <fieldset className="hp-modal-fieldset" disabled={readOnly}>
                    {children}
                </fieldset>
            </ModalBody>
                        </FormProvider>
                    ) : (
                        <ModalBody>
                {readOnly && (
                    <div className="hp-modal-readonly" role="note">
                        <Lock size={14} aria-hidden="true" />
                        <span>View only — you don't have permission to {access.intent === 'add' ? 'add records' : 'make changes'} here.</span>
                    </div>
                )}
                <fieldset className="hp-modal-fieldset" disabled={readOnly}>
                    {children}
                </fieldset>
            </ModalBody>
                    )}

                    <ModalFooter />
                </ModalContext.Provider>
            </div>
        </div>
    );

    return <ModalPortal>{dialogContent}</ModalPortal>;
}

export default memo(HpCommonModal);
