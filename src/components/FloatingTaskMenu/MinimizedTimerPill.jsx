import React from "react";
import { Maximize2, Square, Clock } from "lucide-react";

/**
 * Format elapsed seconds into compact HH:MM:SS format.
 */
function formatCompactTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * MinimizedTimerPill
 *
 * Floating compact widget matching HRM enterprise chrome:
 * Shows live Time and End button while allowing multitasking across the app.
 */
export default function MinimizedTimerPill({
  task,
  elapsedSeconds,
  onMaximize,
  onStop,
}) {
  const Icon = task?.icon || Clock;
  const formattedTime = formatCompactTime(elapsedSeconds);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${task?.label} timer active: ${formattedTime}`}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9995] flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-lg shadow-slate-900/10 text-slate-800 select-none animate-in fade-in slide-in-from-bottom-3 duration-150"
    >
      {/* Icon with HRM badge styling */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-2xs ${
          task?.iconBg || "bg-blue-50 border-blue-200"
        }`}
      >
        <Icon
          className={`w-4 h-4 ${task?.iconColor || "text-blue-600"}`}
          strokeWidth={2.2}
        />
      </div>

      {/* Task Name & Live Timer */}
      <div className="flex flex-col cursor-pointer pr-1" onClick={onMaximize}>
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
            {task?.label}
          </span>
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500 animate-pulse" />
        </div>
        <span className="font-mono text-xs font-semibold text-slate-600 mt-0.5 tabular-nums">
          {formattedTime}
        </span>
      </div>

      {/* Maximize Back to Centered Modal */}
      <button
        type="button"
        onClick={onMaximize}
        aria-label="Expand timer"
        title="Expand timer"
        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition active:scale-95 cursor-pointer"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      {/* End Task Button */}
      <button
        type="button"
        onClick={onStop}
        aria-label="End session"
        title="End session"
        className="px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 flex items-center gap-1.5 text-xs font-semibold text-white transition active:scale-95 shadow-2xs cursor-pointer"
      >
        <Square className="w-2.5 h-2.5 fill-current" />
        <span>End</span>
      </button>
    </div>
  );
}
