import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

/**
 * GridContextMenu.jsx
 * ------------------------------------------------------------------
 * Renders a floating context menu at the mouse click location using a
 * React Portal. Handles edge detection so the menu never renders
 * off-screen, and automatically dismisses on outside clicks, Esc key,
 * or scroll.
 * ------------------------------------------------------------------
 */
export default function GridContextMenu({
  x,
  y,
  items = [],
  row,
  rowIndex,
  onClose,
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: y, left: x, ready: false });

  // Viewport boundary adjustment
  useLayoutEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const margin = 8;

    let nextLeft = x;
    let nextTop = y;

    // Flip or shift horizontally if it overflows the right edge
    if (x + rect.width + margin > window.innerWidth) {
      nextLeft = Math.max(margin, x - rect.width);
    }

    // Flip or shift vertically if it overflows the bottom edge
    if (y + rect.height + margin > window.innerHeight) {
      nextTop = Math.max(margin, y - rect.height);
    }

    setPosition({ top: nextTop, left: nextLeft, ready: true });
  }, [x, y]);

  // Dismiss on outside click, window resize, scroll, or Escape key
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleScroll = (event) => {
      // Don't close if scrolling inside the menu itself (if scrollable)
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      onClose();
    };

    document.addEventListener("mousedown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", onClose);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  if (!items || items.length === 0) return null;

  const handleItemClick = (event, item) => {
    event.stopPropagation();
    event.preventDefault();

    const isDisabled =
      typeof item.disabled === "function"
        ? item.disabled(row, rowIndex)
        : !!item.disabled;

    if (isDisabled) return;

    onClose();

    if (typeof item.onClick === "function") {
      item.onClick(row, {
        row,
        rowIndex,
        data: row,
        event,
      });
    }
  };

  const menuContent = (
    <div
      ref={menuRef}
      className="hp-grid-context-menu"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        visibility: position.ready ? "visible" : "hidden",
        zIndex: 99999,
      }}
      role="menu"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => {
        if (!item) return null;

        // Divider item
        if (item.divider) {
          return (
            <div
              key={`divider-${index}`}
              className="hp-grid-context-menu-divider"
              role="separator"
            />
          );
        }

        const isHidden =
          typeof item.hidden === "function"
            ? item.hidden(row, rowIndex)
            : !!item.hidden;

        if (isHidden) return null;

        const isDisabled =
          typeof item.disabled === "function"
            ? item.disabled(row, rowIndex)
            : !!item.disabled;

        const label = item.text ?? item.label ?? "";

        return (
          <div
            key={item.id || item.text || item.label || index}
            className={[
              "hp-grid-context-menu-item",
              item.danger ? "hp-grid-context-menu-item--danger" : "",
              isDisabled ? "hp-grid-context-menu-item--disabled" : "",
              item.className || "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="menuitem"
            tabIndex={isDisabled ? -1 : 0}
            onClick={(e) => handleItemClick(e, item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleItemClick(e, item);
              }
            }}
          >
            {item.icon && (
              <span className="hp-grid-context-menu-icon" aria-hidden="true">
                {typeof item.icon === "function"
                  ? React.createElement(item.icon, { row, rowIndex })
                  : item.icon}
              </span>
            )}
            <span className="hp-grid-context-menu-text">{label}</span>
          </div>
        );
      })}
    </div>
  );

  return ReactDOM.createPortal(menuContent, document.body);
}
