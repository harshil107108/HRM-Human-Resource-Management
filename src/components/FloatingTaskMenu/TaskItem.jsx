import React from "react";

/**
 * TaskItem
 *
 * Professional enterprise task shortcut card matching the HRM website theme:
 * - Crisp white surface with light slate border
 * - Blue active / hover highlights matching Header & Sidebar
 * - High-legibility typography & semantic icon badge
 */
export default function TaskItem({
  task,
  isSelected = false,
  onSelect,
  buttonRef,
  tabIndex = 0,
}) {
  const Icon = task.icon;

  return (
    <button
      type="button"
      ref={buttonRef}
      role="menuitem"
      tabIndex={tabIndex}
      aria-label={`${task.label}: ${task.description || ""}`}
      title={task.description || task.label}
      onClick={() => onSelect(task)}
      className={`
        group relative flex flex-col items-center justify-center p-2.5 rounded-xl
        bg-slate-50/70 hover:bg-blue-50/70 active:bg-blue-100/60
        border border-slate-200/80 hover:border-blue-300
        transition-all duration-200 ease-out outline-none select-none cursor-pointer
        hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95
        focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${isSelected ? "bg-blue-50 border-blue-400 ring-1 ring-blue-300" : ""}
      `}
    >
      {/* Icon Container matching enterprise badge style */}
      <div
        className={`
          w-10 h-10 rounded-lg flex items-center justify-center border shadow-xs
          transition-colors duration-200
          ${task.iconBg || "bg-white border-slate-200"}
        `}
      >
        {Icon ? (
          <Icon
            className={`w-5 h-5 ${task.iconColor || "text-blue-600"}`}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        ) : (
          <span className="w-2 h-2 rounded-full bg-blue-600" />
        )}
      </div>

      {/* Primary Label */}
      <span className="mt-2 text-xs font-semibold text-slate-800 group-hover:text-blue-600 tracking-tight leading-tight line-clamp-1 max-w-[84px] text-center">
        {task.shortLabel || task.label}
      </span>

      {/* Category Hint */}
      <span className="mt-0.5 text-[9.5px] font-medium text-slate-400 group-hover:text-slate-500 uppercase tracking-wide">
        {task.category || "Task"}
      </span>
    </button>
  );
}
