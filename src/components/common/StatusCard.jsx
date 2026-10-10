import React from "react";

/**
 * StatusCard
 * 
 * Reusable executive-level summary & status card for listings (Asset, Candidates, Interviews, Offers, Onboarding).
 * Displays metric count and acts as a drop target for cards/rows.
 * 
 * Features:
 * - Pure drop target (status cards are non-draggable per requirement)
 * - Zero harsh black borders; sleek modern borders and subtle themed glows
 * - Clean minimal UI: no drag handles, no clutter text
 * - Dynamic drop feedback when an item is dragged over
 * - Clean active filter state
 */
const StatusCard = ({
  id,
  title,
  value,
  icon,
  type = "blue",
  isDisabled = false,
  isDropTarget = false,
  isDraggingAny = false,
  isSelectedFilter = false,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}) => {
  const themeStyles = {
    blue: {
      baseBg: "bg-white",
      baseBorder: "border-slate-200/90 hover:border-blue-300 hover:shadow-sm",
      iconWrapper: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
      accentText: "text-blue-700",
      selected: "border-blue-400 bg-blue-50/50 shadow-xs ring-1 ring-blue-400/40",
      dropActive: "border-blue-500 bg-blue-100/70 ring-2 ring-blue-400/40 shadow-md scale-[1.02]",
      badge: "bg-blue-50 text-blue-700 border-blue-200/60",
      dot: "bg-blue-500",
    },
    green: {
      baseBg: "bg-white",
      baseBorder: "border-slate-200/90 hover:border-emerald-300 hover:shadow-sm",
      iconWrapper: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
      accentText: "text-emerald-700",
      selected: "border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400/40",
      dropActive: "border-emerald-500 bg-emerald-100/80 ring-2 ring-emerald-400/40 shadow-md scale-[1.02]",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      dot: "bg-emerald-500",
    },
    purple: {
      baseBg: "bg-white",
      baseBorder: "border-slate-200/90 hover:border-violet-300 hover:shadow-sm",
      iconWrapper: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
      accentText: "text-violet-700",
      selected: "border-violet-500 bg-violet-50/50 shadow-xs ring-1 ring-violet-400/40",
      dropActive: "border-violet-500 bg-violet-100/80 ring-2 ring-violet-400/40 shadow-md scale-[1.02]",
      badge: "bg-violet-50 text-violet-700 border-violet-200/60",
      dot: "bg-violet-500",
    },
    orange: {
      baseBg: "bg-white",
      baseBorder: "border-slate-200/90 hover:border-amber-300 hover:shadow-sm",
      iconWrapper: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
      accentText: "text-amber-700",
      selected: "border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-400/40",
      dropActive: "border-amber-500 bg-amber-100/80 ring-2 ring-amber-400/40 shadow-md scale-[1.02]",
      badge: "bg-amber-50 text-amber-700 border-amber-200/60",
      dot: "bg-amber-500",
    },
    red: {
      baseBg: "bg-white",
      baseBorder: "border-slate-200/90 hover:border-rose-300 hover:shadow-sm",
      iconWrapper: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
      accentText: "text-rose-700",
      selected: "border-rose-500 bg-rose-50/50 shadow-xs ring-1 ring-rose-400/40",
      dropActive: "border-rose-500 bg-rose-100/80 ring-2 ring-rose-400/40 shadow-md scale-[1.02]",
      badge: "bg-rose-50 text-rose-700 border-rose-200/60",
      dot: "bg-rose-500",
    },
    cyan: {
      baseBg: "bg-white",
      baseBorder: "border-slate-200/90 hover:border-sky-300 hover:shadow-sm",
      iconWrapper: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
      accentText: "text-sky-700",
      selected: "border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-400/40",
      dropActive: "border-sky-500 bg-sky-100/80 ring-2 ring-sky-400/40 shadow-md scale-[1.02]",
      badge: "bg-sky-50 text-sky-700 border-sky-200/60",
      dot: "bg-sky-500",
    },
  };

  const currentTheme = themeStyles[type] || themeStyles.blue;

  const getCardClasses = () => {
    if (isDropTarget && !isDisabled) {
      return currentTheme.dropActive;
    }

    if (isSelectedFilter) {
      return currentTheme.selected;
    }

    if (isDraggingAny && !isDisabled) {
      return "border-dashed border-slate-300 bg-slate-50/50 hover:border-slate-400";
    }

    return `${currentTheme.baseBg} ${currentTheme.baseBorder}`;
  };

  return (
    <div
      id={`status-card-${id || title?.toLowerCase().replace(/\s+/g, "-")}`}
      draggable={false}
      onDragOver={!isDisabled ? onDragOver : (e) => { e.dataTransfer.dropEffect = "none"; }}
      onDragLeave={!isDisabled ? onDragLeave : undefined}
      onDrop={!isDisabled ? onDrop : undefined}
      onClick={onClick}
      className={`
        group
        relative
        flex
        h-[76px]
        w-full
        items-center
        rounded-xl
        border
        px-3.5
        py-2
        select-none
        cursor-pointer
        transition-all
        duration-200
        ease-out
        ${getCardClasses()}
      `}
      title={
        isDisabled
          ? "Total count overview"
          : isDropTarget
          ? `Release to change status to ${title}`
          : isDraggingAny
          ? `Drop item here to mark as ${title}`
          : `Click to filter by ${title}`
      }
    >
      {/* Top right status badge / indicator */}
      <div className="absolute right-2.5 top-2 z-10 flex items-center gap-1 pointer-events-none">
        {isDropTarget && !isDisabled ? (
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-slate-700 shadow-xs backdrop-blur-xs animate-pulse">
            <span className={`h-1.5 w-1.5 rounded-full ${currentTheme.dot}`} />
            Drop here
          </span>
        ) : isSelectedFilter ? (
          <span className="flex items-center gap-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 shadow-2xs">
            <span className={`h-1.5 w-1.5 rounded-full ${currentTheme.dot}`} />
            Filtered
          </span>
        ) : isDisabled ? (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-slate-400">
            All
          </span>
        ) : null}
      </div>

      <div className="flex w-full items-center gap-3">
        {/* Modern Icon Box */}
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            transition-transform
            duration-200
            group-hover:scale-105
            ${currentTheme.iconWrapper}
          `}
        >
          {React.isValidElement(icon) ? (
            icon
          ) : (
            <span className="text-base font-bold leading-none">{icon}</span>
          )}
        </div>

        {/* Text & Count Info */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-semibold tracking-wide text-slate-500">
            {title}
          </div>

          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-[21px] font-bold tracking-tight text-slate-900 leading-tight">
              {value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
