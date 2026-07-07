/**
 * ModalHeader.jsx
 * ---------------------------------------------------------------------------
 * Renders the modal's title bar: icon + title/subtitle on the left, close
 * button on the right. Fully overridable via the `header` prop on
 * HpCommonModal (custom header render prop / node).
 * ---------------------------------------------------------------------------
 */

import { X } from 'lucide-react';
import { useModalContext } from './modalContext';
import { cx } from './modalUtils';

export default function ModalHeader() {
    const {
        titleId,
        title,
        subTitle,
        icon,
        header,
        showCloseButton,
        showHeader,
        disableClose,
        loading,
        preventCloseWhileLoading,
        requestClose,
        headerClassName,
        stickyHeader,
    } = useModalContext();

    if (!showHeader) return null;

    // Fully custom header takes over the entire bar.
    if (header) {
        return (
            <div
                className={cx(
                    'hp-modal-header hp-modal-header--custom',
                    stickyHeader && 'hp-modal-header--sticky',
                    headerClassName
                )}
            >
                {header}
            </div>
        );
    }

    const closeDisabled = disableClose || (preventCloseWhileLoading && loading);

    return (
        <div
            className={cx(
                'hp-modal-header',
                stickyHeader && 'hp-modal-header--sticky',
                headerClassName
            )}
        >
            <div className="hp-modal-header__main">
                {icon && <span className="hp-modal-header__icon">{icon}</span>}
                <div className="hp-modal-header__text">
                    <h2 id={titleId} className="hp-modal-header__title">
                        {title}
                    </h2>
                    {subTitle && <p className="hp-modal-header__subtitle">{subTitle}</p>}
                </div>
            </div>

            {showCloseButton && (
                <button
                    type="button"
                    className="hp-modal-header__close"
                    aria-label="Close dialog"
                    disabled={closeDisabled}
                    onClick={() => requestClose('close-button')}
                >
                    <X size={20} strokeWidth={2} />
                </button>
            )}
        </div>
    );
}