/**
 * HpCommonModal.jsx
 * ---------------------------------------------------------------------------
 * Enterprise-grade, fully reusable modal component used across every module
 * of the HRM/ERP/CRM suite (Companies, Branches, Departments, Employees,
 * Payroll, Attendance, Assets, Projects, Settings, ...).
 *
 * Responsibilities:
 *   - Portal rendering + backdrop
 *   - Open/close enter-exit animation
 *   - React Hook Form integration (FormProvider + handleSubmit wiring)
 *   - Composition of Header / Body / Footer via ModalContext
 *   - Delegates keyboard/focus/scroll-lock behavior to useModal()
 * ---------------------------------------------------------------------------
 */

import { memo, useEffect, useMemo, useState, useCallback } from 'react';
import { FormProvider } from 'react-hook-form';
import ModalPortal from './ModalPortal';
import ModalHeader from './ModalHeader';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import { ModalContext } from './modalContext';
import { useModal } from './useModal';
import { cx, resolveModalWidth, generateModalId } from './modalUtils';
import {
    ANIMATION_DURATION_MS,
    DEFAULT_Z_INDEX,
    DEFAULT_TEXT,
    DEFAULT_PRIMARY_COLOR,
    DEFAULT_SECONDARY_COLOR,
} from './modal.constants';
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
    // Keep the dialog mounted for the duration of the exit animation, even
    // after the consumer has already flipped `open` to false.
    const [shouldRender, setShouldRender] = useState(open);
    const [animationPhase, setAnimationPhase] = useState(open ? 'entered' : 'exited');

    useEffect(() => {
        let timeoutId;
        if (open) {
            setShouldRender(true);
            // Next tick so the browser registers the "enter from" state first.
            timeoutId = window.setTimeout(() => setAnimationPhase('entered'), 10);
        } else if (shouldRender) {
            setAnimationPhase('exiting');
            timeoutId = window.setTimeout(() => {
                setShouldRender(false);
                setAnimationPhase('exited');
            }, ANIMATION_DURATION_MS);
        }
        return () => window.clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Stable ids for ARIA wiring between the dialog and its title/description.
    const titleId = useMemo(() => generateModalId('hp-modal-title'), []);
    const descriptionId = useMemo(() => generateModalId('hp-modal-desc'), []);

    const isDirty = Boolean(formMethod?.formState?.isDirty);

    const { dialogRef, requestClose } = useModal({
        open: open && active,
        onClose,
        closeOnEscape: closeOnEscape && active,
        preventCloseWhileLoading,
        loading,
        isDirty,
        confirmBeforeClose,
    });

    // If a formMethod (React Hook Form) instance is supplied, Save
    // automatically runs validation via handleSubmit before calling onSave.
    // Otherwise Save calls onSave directly — no extra wiring required either way.
    const handleSave = useCallback(() => {
        if (formMethod?.handleSubmit) {
            formMethod.handleSubmit(onSave)();
        } else {
            onSave?.();
        }
    }, [formMethod, onSave]);

    const handleBackdropClick = useCallback(
        (event) => {
            if (preventOutsideClick) return;
            if (event.target !== event.currentTarget) return;
            if (!closeOnBackdrop) return;
            requestClose('backdrop');
        },
        [preventOutsideClick, closeOnBackdrop, requestClose]
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
        disableSave,
        disableClear,
        disableClose,
        loading,
        preventCloseWhileLoading,
        saveText,
        cancelText,
        clearText,
        onSave: handleSave,
        onClear,
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
            onMouseDown={handleBackdropClick}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className={cx('hp-modal-dialog', className)}
                data-state={animationPhase}
                style={{
                    width: resolveModalWidth(size),
                    '--hp-modal-primary': primaryColor,
                    '--hp-modal-secondary': secondaryColor,
                }}
                onMouseDown={(event) => event.stopPropagation()}
            >
                {loading && (
                    <div className="hp-modal-loading-overlay" aria-hidden="true">
                        <div className="hp-modal-loading-spinner" />
                    </div>
                )}

                <ModalContext.Provider value={contextValue}>
                    <ModalHeader />

                    {formMethod ? (
                        <FormProvider {...formMethod}>
                            <ModalBody>{children}</ModalBody>
                        </FormProvider>
                    ) : (
                        <ModalBody>{children}</ModalBody>
                    )}

                    <ModalFooter />
                </ModalContext.Provider>
            </div>
        </div>
    );

    return <ModalPortal>{dialogContent}</ModalPortal>;
}

export default memo(HpCommonModal);