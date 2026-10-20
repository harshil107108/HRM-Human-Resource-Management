import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Logo from "@/assets/images/Logo.png";
import { getActivityCount, subscribeActivity } from "@/utils/networkActivity";
import "./feedback.css";

const IDLE_SETTLE_MS = 120; // network must stay quiet this long (catches chained requests)
const EXIT_MS = 240;

/**
 * HpPageLoader
 * ---------------------------------------------------------------------------
 * Branded cover for a page that is still loading its data. It sits exactly
 * over `containerRef` (the app's content area), waits until every tracked
 * request — record fetch and dropdown options — has finished and the filled
 * form has painted, then fades away to reveal a complete page.
 *
 *  - Fast loads: the logo never appears (it fades in after ~300ms), so the
 *    user just sees a smooth fade instead of a flash.
 *  - Errors don't trap the user: when requests fail they finish, and the
 *    error dialog (z-index above this cover) is shown as usual.
 *  - `maxWait` guarantees the page is revealed even if something hangs.
 *
 * Rendered by MainLayout for routes with `handle: { pageLoader: true }`;
 * mount it with `key={location.key}` so each navigation gets a fresh cover.
 * ---------------------------------------------------------------------------
 */
export default function HpPageLoader({
    containerRef,
    label = "Loading…",
    minDuration = 650,
    maxWait = 10000,
    onReady,
}) {
    const [phase, setPhase] = useState("loading"); // loading | leaving | done
    const [rect, setRect] = useState(null);
    const onReadyRef = useRef(onReady);

    useLayoutEffect(() => {
        onReadyRef.current = onReady;
    });

    // Track the content area's position so the cover never overlaps the
    // sidebar or header, including while the sidebar animates its width.
    useLayoutEffect(() => {
        const node = containerRef?.current;
        if (!node) return undefined;
        const measure = () => {
            const box = node.getBoundingClientRect();
            // Include the container's left margin so nothing (e.g. the fixed
            // footer, which starts at the sidebar edge) peeks out beside it.
            const marginLeft = parseFloat(getComputedStyle(node).marginLeft) || 0;
            setRect({
                top: box.top,
                left: box.left - marginLeft,
                width: box.width + marginLeft,
                height: box.height,
            });
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        window.addEventListener("resize", measure);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [containerRef]);

    // Wait for compulsory minimum display, network idle, and filled UI to paint.
    useEffect(() => {
        const mountTime = Date.now();
        let settleTimer;
        let finished = false;
        let raf1;
        let raf2;

        const isFormReady = () => {
            if (!containerRef?.current) return true;
            return Boolean(
                containerRef.current.querySelector(
                    "input, select, textarea, form, .hp-company-content, .hp-company-page, [data-field-id]"
                )
            );
        };

        const tryFinish = () => {
            if (finished) return;

            const elapsed = Date.now() - mountTime;
            const remainingMin = Math.max(0, minDuration - elapsed);

            if (remainingMin > 0) {
                settleTimer = window.setTimeout(tryFinish, remainingMin);
                return;
            }

            if (getActivityCount() > 0) {
                // Network requests still in-flight (dropdowns / record data), keep waiting
                return;
            }

            if (!isFormReady()) {
                // Form elements haven't painted into DOM yet, re-check in 50ms
                settleTimer = window.setTimeout(tryFinish, 50);
                return;
            }

            finished = true;
            raf1 = requestAnimationFrame(() => {
                raf2 = requestAnimationFrame(() => {
                    setPhase("leaving");
                    onReadyRef.current?.();
                });
            });
        };

        const check = () => {
            window.clearTimeout(settleTimer);
            if (getActivityCount() === 0) {
                const elapsed = Date.now() - mountTime;
                const delay = Math.max(IDLE_SETTLE_MS, minDuration - elapsed);
                settleTimer = window.setTimeout(tryFinish, delay);
            }
        };

        const unsubscribe = subscribeActivity(check);
        check();
        const capTimer = window.setTimeout(tryFinish, maxWait);

        return () => {
            unsubscribe();
            window.clearTimeout(settleTimer);
            window.clearTimeout(capTimer);
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [containerRef, minDuration, maxWait]);

    useEffect(() => {
        if (phase !== "leaving") return undefined;
        const timer = window.setTimeout(() => setPhase("done"), EXIT_MS);
        return () => window.clearTimeout(timer);
    }, [phase]);

    if (phase === "done") return null;

    const loaderStyle = rect
        ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        : { position: "fixed", inset: 0, zIndex: 45 };

    return (
        <div
            className="hrm-page-loader"
            data-state={phase}
            style={loaderStyle}
            role="status"
            aria-live="polite"
            aria-busy={phase === "loading"}
        >
            <div className="hrm-page-loader__content">
                <div className="hrm-page-loader__mark">
                    <span className="hrm-page-loader__ring" aria-hidden="true" />
                    <span className="hrm-page-loader__badge">
                        <img src={Logo} alt="" draggable={false} />
                    </span>
                </div>
                <p className="hrm-page-loader__label">{label}</p>
            </div>
        </div>
    );
}
