import React from "react";
import { Square, Minimize2, Clock } from "lucide-react";

/**
 * Format elapsed seconds into HH:MM:SS format with stable tabular width.
 */
function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num) => String(num).padStart(2, "0");

  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}

/**
 * FullScreenTimer / CenteredTimer
 *
 * Professional centered timer modal styled natively to match the HRM website:
 * - Whole page background is softly blurred with backdrop-blur
 * - Centered card with clean white surface, hairline slate border, and soft shadow
 * - Displays ONLY the live Time counter and the End button (no Pause button)
 */
export default function FullScreenTimer({
  task,
  elapsedSeconds,
  onStop,
  onMinimize,
}) {
  const time = formatTime(elapsedSeconds);
  const Icon = task?.icon || Clock;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${task?.label || "Task"} Timer`}
      className="fixed inset-0 z-[100000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      {/* Background click listener to minimize */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onMinimize}
        aria-hidden="true"
      />

      {/* Centered Modal Card matching HpCommonModal */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 text-center shadow-xl shadow-slate-900/15 animate-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
          {/* Active Status Badge matching HRM system */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span>Session Active</span>
          </span>

          {/* Quick Header Minimize */}
          {onMinimize && (
            <button
              type="button"
              onClick={onMinimize}
              aria-label="Minimize timer to floating HUD"
              title="Minimize to HUD"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Task Icon & Label */}
        <div className="flex flex-col items-center">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center border shadow-2xs mb-2.5 ${
              task?.iconBg || "bg-blue-50 border-blue-200"
            }`}
          >
            <Icon
              className={`w-7 h-7 ${task?.iconColor || "text-blue-600"}`}
              strokeWidth={2.2}
            />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {task?.label}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 max-w-xs mx-auto">
            {task?.description || "Active tracking session"}
          </p>
        </div>

        {/* Big Time Display in Center */}
        <div className="my-5 py-4 px-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="font-mono font-black tabular-nums tracking-tight text-4xl sm:text-5xl text-slate-900">
            <span>{time.hours}</span>
            <span className="text-slate-400 mx-1 animate-pulse">:</span>
            <span>{time.minutes}</span>
            <span className="text-slate-400 mx-1 animate-pulse">:</span>
            <span className="text-blue-600">{time.seconds}</span>
          </div>

          <div className="grid grid-cols-3 text-[9.5px] font-semibold uppercase tracking-widest text-slate-400 mt-1 max-w-[180px] mx-auto">
            <span>Hours</span>
            <span>Mins</span>
            <span>Secs</span>
          </div>
        </div>

        {/* Single End Button (matches HRM primary danger button) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStop}
            className="w-full py-2.5 px-5 rounded-lg font-semibold text-sm bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>End {task?.label || "Task"}</span>
          </button>
        </div>

        {/* Minimize Action */}
        {onMinimize && (
          <button
            type="button"
            onClick={onMinimize}
            className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <Minimize2 className="w-3 h-3" />
            <span>Minimize to background</span>
          </button>
        )}
      </div>
    </div>
  );
}
