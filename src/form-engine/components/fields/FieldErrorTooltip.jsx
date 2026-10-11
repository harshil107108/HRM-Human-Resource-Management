import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 10; // space between tooltip and the field's top edge (matches the old -top-9)
const EDGE = 4; // minimum distance from the viewport edge
const Z_INDEX = 9998; // above modals (1000), just under dropdown/date portals (9999)

/** Ancestors that clip their content (scroll containers, overflow hidden). */
function getClippingRects(node) {
  const rects = [];
  let el = node?.parentElement;
  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    if (/(auto|scroll|hidden|clip)/.test(style.overflowY + style.overflowX)) {
      rects.push(el.getBoundingClientRect());
    }
    el = el.parentElement;
  }
  return rects;
}

/**
 * FieldErrorTooltip
 * ---------------------------------------------------------------------------
 * The red validation bubble shown above a focused field. Rendered in a portal
 * on <body> with fixed positioning, so it is never clipped by a modal's
 * scrolling body, a card with overflow hidden, or covered by a sticky header.
 *
 * Place it as a child of the field's `relative` wrapper (where the old inline
 * tooltip was): an invisible anchor marks the wrapper's top-left corner.
 * It sits above the field like before, flips below the field when there is no
 * room at the top of the screen, follows scrolling/resizing, and hides when
 * the field itself is scrolled out of view.
 * ---------------------------------------------------------------------------
 */
export default function FieldErrorTooltip({ message }) {
  const anchorRef = useRef(null);
  const tipRef = useRef(null);
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const field = anchor?.parentElement;
    if (!field) return undefined;

    let frame;
    const measure = () => {
      const fieldRect = field.getBoundingClientRect();
      const tipWidth = tipRef.current?.offsetWidth || 220;
      const tipHeight = tipRef.current?.offsetHeight || 26;

      // Hidden when the field is scrolled out of its container's view.
      const visible = getClippingRects(field).every(
        (r) => fieldRect.bottom > r.top && fieldRect.top < r.bottom && fieldRect.right > r.left && fieldRect.left < r.right
      );

      const aboveTop = fieldRect.top - tipHeight - GAP;
      const placement = aboveTop < EDGE ? "bottom" : "top";
      const top = placement === "top" ? aboveTop : fieldRect.bottom + GAP;
      const left = Math.max(EDGE, Math.min(fieldRect.left, window.innerWidth - tipWidth - EDGE));

      setPosition({ top, left, placement, visible, arrowLeft: Math.max(8, fieldRect.left - left + 12) });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [message]);

  const arrowClass =
    position?.placement === "bottom"
      ? "-top-1.5 border-l border-t"
      : "-bottom-1.5 border-b border-r";

  return (
    <>
      <span ref={anchorRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-0 w-0" />
      {typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tipRef}
            role="alert"
            className="pointer-events-none fixed max-w-[220px] rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold leading-4 text-red-700 shadow-lg"
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              zIndex: Z_INDEX,
              visibility: position?.visible ? "visible" : "hidden",
            }}
          >
            <span
              className={`absolute h-2.5 w-2.5 rotate-45 border-red-200 bg-red-50 ${arrowClass}`}
              style={{ left: position?.arrowLeft ?? 12 }}
            />
            {message}
          </div>,
          document.body
        )}
    </>
  );
}
