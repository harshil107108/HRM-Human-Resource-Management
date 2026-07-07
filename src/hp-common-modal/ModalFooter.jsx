/**
 * ModalFooter.jsx
 * ---------------------------------------------------------------------------
 * Renders the standard Clear / Cancel / Save action row. Supports full
 * override via the `footer` prop, or partial customization by hiding any
 * individual button and rendering your own alongside `children`-less usage.
 * ---------------------------------------------------------------------------
 */

import { Loader2, Save, X, Eraser } from 'lucide-react';
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
        preventCloseWhileLoading,
        saveText,
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
            <div className="hp-modal-footer__left">
                {showClearButton && (
                    <button
                        type="button"
                        className="hp-modal-btn hp-modal-btn--ghost"
                        disabled={disableClear || loading}
                        onClick={onClear}
                    >
                        <Eraser size={16} />
                        {clearText}
                    </button>
                )}
            </div>

            <div className="hp-modal-footer__right">
                <button
                    type="button"
                    className="hp-modal-btn hp-modal-btn--secondary"
                    disabled={cancelDisabled}
                    onClick={() => requestClose('cancel-button')}
                >
                    <X size={16} />
                    {cancelText}
                </button>

                {showSaveButton && (
                    <button
                        type="button"
                        className="hp-modal-btn hp-modal-btn--primary"
                        disabled={disableSave || loading}
                        onClick={onSave}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="hp-modal-spin" />
                                {DEFAULT_SAVING_LABEL}
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                {saveText}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

const DEFAULT_SAVING_LABEL = 'Saving...';