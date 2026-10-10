/**
 * ModalPortal.jsx
 * ---------------------------------------------------------------------------
 * Renders its children into a dedicated <div> appended to document.body,
 * outside of the app's normal DOM hierarchy. This prevents parent CSS
 * (overflow: hidden, transform, z-index stacking contexts, etc.) from ever
 * clipping or mis-positioning the modal — a common bug source with the
 * "modal rendered inline" approach in enterprise apps with deep layouts.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModalPortal({ children }) {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        const div = document.createElement('div');
        div.setAttribute('data-hp-common-modal-portal', 'true');
        document.body.appendChild(div);
        setContainer(div);
        return () => {
            if (div.parentNode) {
                div.parentNode.removeChild(div);
            }
        };
    }, []);

    if (!container) return null;
    return createPortal(children, container);
}