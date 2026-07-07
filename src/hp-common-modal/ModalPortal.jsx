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

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModalPortal({ children }) {
    const containerRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    if (!containerRef.current && typeof document !== 'undefined') {
        containerRef.current = document.createElement('div');
        containerRef.current.setAttribute('data-hp-common-modal-portal', 'true');
    }

    useEffect(() => {
        const node = containerRef.current;
        document.body.appendChild(node);
        setMounted(true);
        return () => {
            document.body.removeChild(node);
        };
    }, []);

    if (!mounted) return null;
    return createPortal(children, containerRef.current);
}