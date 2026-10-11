/**
 * ModalBody.jsx
 * ---------------------------------------------------------------------------
 * The scrollable content region. Header and footer stay fixed; only this
 * area scrolls when form content overflows the available height.
 * Also renders the optional error / success / validation-summary bands that
 * sit above the form content, a common enterprise-form requirement, and the
 * loading veil shown while data loads or a save is in progress.
 * ---------------------------------------------------------------------------
 */

import { AlertCircle, CheckCircle2, ListTree } from 'lucide-react';
import { useModalContext } from './modalContext';
import { cx } from './modalUtils';

export default function ModalBody({ children }) {
    const {
        descriptionId,
        scrollable,
        maxHeight,
        bodyClassName,
        errorMessage,
        successMessage,
        validationErrors,
        loading,
        saving,
    } = useModalContext();

    const hasValidationErrors = Array.isArray(validationErrors) && validationErrors.length > 0;

    return (
        <div className="hp-modal-body-region">
            <div
                id={descriptionId}
                data-hp-modal-body
                data-hp-scroll
                className={cx('hp-modal-body', scrollable && 'hp-modal-body--scrollable', bodyClassName)}
                style={maxHeight ? { maxHeight } : undefined}
            >
                {errorMessage && (
                    <div className="hp-modal-banner hp-modal-banner--error" role="alert">
                        <AlertCircle size={18} aria-hidden="true" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="hp-modal-banner hp-modal-banner--success" role="status">
                        <CheckCircle2 size={18} aria-hidden="true" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {hasValidationErrors && (
                    <div className="hp-modal-banner hp-modal-banner--validation" role="alert">
                        <ListTree size={18} aria-hidden="true" />
                        <div>
                            <p className="hp-modal-banner__title">Please fix the following before continuing:</p>
                            <ul className="hp-modal-banner__list">
                                {validationErrors.map((message, index) => (
                                    <li key={`${message}-${index}`}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {children}
            </div>

            {loading && (
                <div className="hp-modal-loading-overlay" role="status" aria-live="polite">
                    <div className="hp-modal-loading-spinner" aria-hidden="true" />
                    <span className="hp-modal-sr-only">{saving ? 'Saving…' : 'Loading…'}</span>
                </div>
            )}
        </div>
    );
}
