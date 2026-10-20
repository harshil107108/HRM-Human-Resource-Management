import React from "react";
import { X, Lock } from "lucide-react";

/**
 * FloatingTrigger
 *
 * AssistiveTouch-style floating circular button with layered monochrome design:
 * - Outer dark glassmorphic circle with subtle border and diffuse shadow
 * - Concentric middle ring
 * - Pure white core center
 * - Morphs smoothly into a close indicator when the menu is open
 * - Auto-dims when idle, springs to full prominence on hover or interaction
 */
export default function FloatingTrigger({
  position,
  isDragging,
  isSnapping,
  isIdle,
  isOpen,
  isLocked = false,
  dragProps,
  onKeyDown,
  ariaLabel = "Toggle task shortcut menu",
}) {
  return (
    <button
      type="button"
      {...dragProps}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: "none",
        WebkitTouchCallout: "none",
        userSelect: "none",
      }}
      className={`
        fixed top-0 left-0 z-[9990]
        w-14 h-14 rounded-full
        flex items-center justify-center
        select-none outline-none
        ${isDragging ? "cursor-grabbing scale-105" : "cursor-grab"}
        ${isSnapping ? "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" : ""}
        ${isIdle ? "opacity-55 hover:opacity-100" : "opacity-100"}
        transition-[opacity,box-shadow,transform] duration-200
        focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black
        group
      `}
    >
      {/* Outer Circle: Deep dark glass ring with subtle light reflection */}
      <div
        className={`
          w-14 h-14 rounded-full
          bg-neutral-900/85 backdrop-blur-md
          border border-white/20
          shadow-[0_8px_25px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.3)]
          flex items-center justify-center
          transition-all duration-200
          group-hover:border-white/35 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]
          group-active:scale-95
          ${isOpen ? "ring-2 ring-white/30 bg-neutral-950/95" : ""}
        `}
      >
        {isOpen ? (
          /* When menu is open: crisp monochrome close icon */
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white transition-transform duration-200 hover:rotate-90">
            <X className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
        ) : (
          /* When menu is closed: signature AssistiveTouch concentric concentric circles */
          <div className="w-9 h-9 rounded-full border border-white/30 bg-white/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <div className="w-6 h-6 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.45)] transition-transform duration-200 group-hover:scale-110" />
          </div>
        )}

        {isLocked && !isOpen && (
          <div
            title="Day Report is Locked"
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-sm ring-1 ring-amber-600/30"
          >
            <Lock className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
    </button>
  );
}
