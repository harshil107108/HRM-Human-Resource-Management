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
            <div className="hp-modal-footer__right">
                {showClearButton && (
                    <button
                        type="button"
                        className="hp-modal-btn hp-modal-btn--clear"
                        disabled={disableClear || loading}
                        onClick={onClear}
                    >
                        <span className="hp-modal-btn__icon"><Eraser size={16} /></span>
                        {clearText}
                    </button>
                )}

                <button
                    type="button"
                    className="hp-modal-btn hp-modal-btn--cancel"
                    disabled={cancelDisabled}
                    onClick={() => requestClose('cancel-button')}
                >
                    <span className="hp-modal-btn__icon"><X size={16} /></span>
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
                                <span className="hp-modal-btn__icon"><Loader2 size={16} className="hp-modal-spin" /></span>
                                {DEFAULT_SAVING_LABEL}
                            </>
                        ) : (
                            <>
                                <span className="hp-modal-btn__icon"><Save size={16} /></span>
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