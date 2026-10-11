/**
 * ModalFooter.jsx
 * ---------------------------------------------------------------------------
 * Renders the standard Clear / Cancel / Save action row. Supports full
 * override via the `footer` prop, or partial customization by hiding any
 * individual button.
 *
 * Layout: Clear / Cancel / Save grouped on the right, color-coded
 * (amber / red / green) outline buttons.
 * ---------------------------------------------------------------------------
 */

import { Loader2, Save, X, Eraser, Lock } from 'lucide-react';
import { useModalContext } from './modalContext';
import { cx } from './modalUtils';

export default function ModalFooter() {
    const {
        footer,
        showFooter,
        showSaveButton,
        showClearButton,
        disableSave,
        disableClear,
        loading,
        saving,
        readOnly,
        preventCloseWhileLoading,
        saveText,
        savingText,
        cancelText,
        clearText,
        onSave,
        onClear,
        requestClose,
        footerClassName,
        stickyFooter,
    } = useModalContext();

    if (!showFooter) return null;

    if (footer) {
        return (
            <div
                className={cx(
                    'hp-modal-footer',
                    stickyFooter && 'hp-modal-footer--sticky',
                    footerClassName
                )}
            >
                {footer}
            </div>
        );
    }

    const cancelDisabled = preventCloseWhileLoading && loading;

    return (
        <div
            className={cx('hp-modal-footer', stickyFooter && 'hp-modal-footer--sticky', footerClassName)}
        >
            <div className="hp-modal-footer__right">
                {showClearButton && (
                    <button
                        type="button"
                        className="hp-modal-btn hp-modal-btn--clear"
                        disabled={disableClear || loading}
                        onClick={onClear}
                    >
                        <span className="hp-modal-btn__icon" aria-hidden="true"><Eraser size={16} /></span>
                        {clearText}
                    </button>
                )}

                <button
                    type="button"
                    className="hp-modal-btn hp-modal-btn--cancel"
                    disabled={cancelDisabled}
                    onClick={() => requestClose('cancel-button')}
                >
                    <span className="hp-modal-btn__icon" aria-hidden="true"><X size={16} /></span>
                    {cancelText}
                </button>

                {showSaveButton && (
                    <button
                        type="button"
                        className={cx('hp-modal-btn hp-modal-btn--primary', readOnly && 'hp-modal-btn--readonly')}
                        disabled={disableSave || loading || readOnly}
                        title={readOnly ? 'You have read-only access to this module. Saving is disabled.' : undefined}
                        aria-busy={saving || undefined}
                        onClick={onSave}
                    >
                        {readOnly ? (
                            <>
                                <span className="hp-modal-btn__icon" aria-hidden="true">
                                    <Lock size={15} />
                                </span>
                                Read-Only
                            </>
                        ) : saving ? (
                            <>
                                <span className="hp-modal-btn__icon" aria-hidden="true">
                                    <Loader2 size={16} className="hp-modal-spin" />
                                </span>
                                {savingText}
                            </>
                        ) : (
                            <>
                                <span className="hp-modal-btn__icon" aria-hidden="true"><Save size={16} /></span>
                                {saveText}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
