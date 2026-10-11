/**
 * ModalPortal.jsx
 * ---------------------------------------------------------------------------
 * Renders its children into a dedicated <div> appended to document.body,
 * outside of the app's normal DOM hierarchy. This prevents parent CSS
 * (overflow: hidden, transform, z-index stacking contexts, etc.) from ever
 * clipping or mis-positioning the modal — a common bug source with the
 * "modal rendered inline" approach in enterprise apps with deep layouts.
 *
 * The container is created in a layout effect, so the follow-up render
 * happens before the browser paints (no blank first frame). When the portal
 * unmounts while its overlay is still open, an exit "ghost" animates out.
 * ---------------------------------------------------------------------------
 */

import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { playExitGhost } from './modalUtils';

export default function ModalPortal({ children }) {
    const [container, setContainer] = useState(null);

    useLayoutEffect(() => {
        const div = document.createElement('div');
        div.setAttribute('data-hp-common-modal-portal', 'true');
        document.body.appendChild(div);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- must mount into an attached node
        setContainer(div);
        return () => {
            // Layout cleanup runs before React removes the portal's children,
            // so the overlay can still be cloned for its exit animation.
            playExitGhost(div);
            div.remove();
        };
    }, []);

    if (!container) return null;
    return createPortal(children, container);
}
