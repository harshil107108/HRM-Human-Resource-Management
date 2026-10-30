import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Lock,
  Unlock,
  Calendar,
  Clock,
  Coffee,
  ListChecks,
  Briefcase,
  Users,
  Calculator,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import DateField from "@/form-engine/components/fields/DateField";

const formatDuration = (mins = 0) => {
  const m = Number(mins) || 0;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
};

const DayReportLockedOverlay = ({
  isLocked = true,
  date,
  onDateChange,
  summary = { totalWorkMinutes: 0, totalBreakMinutes: 0 },
  stats = null,
  activitiesCount = 0,
  canUnlock = false,
  onUnlock,
  onNavigateToUnlockModule,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLocked]);

  if (!isLocked) return null;

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const overlayContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto select-none animate-in fade-in duration-300"
      style={{ pointerEvents: "all" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-report-locked-title"
    >
      {/* Centered Locked Glassmorphic Modal Card */}
      <div className="relative max-w-lg w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] p-7 sm:p-9 flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* Decorative Ambient Background Rings */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Concentric Glowing Lock Emblem */}
        <div className="relative mb-4 mt-1">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 ring-8 ring-amber-100/90 transition-transform duration-300 hover:scale-105">
            <Lock className="w-10 h-10 sm:w-11 sm:h-11 stroke-[2.2]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white shadow-xs"></span>
          </span>
        </div>

        {/* Title */}
        <h2
          id="day-report-locked-title"
          className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2"
        >
          Day Report is Locked
        </h2>

        {/* Date Selector / Badge */}
        {onDateChange ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-48 text-left">
              <DateField
                id="lockedOverlayDate"
                value={date}
                max={new Date().toISOString().split("T")[0]}
                showRangeHint={false}
                showHint={false}
                onChange={(iso) => {
                  if (iso) {
                    const today = new Date().toISOString().split("T")[0];
                    onDateChange(iso > today ? today : iso);
                  }
                }}
              />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Lock size={12} className="text-amber-600" />
              <span>Locked</span>
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
            <Calendar size={13} className="text-amber-700" />
            <span>{date || "Today"}</span>
            <span>•</span>
            <span>Submitted & Locked</span>
          </div>
        )}

        {/* Professional Explanatory Copy */}
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mb-5">
          Your Day Report has been submitted and locked for today. All tasks,
          break intervals, and remarks are permanently saved in the database.
          You cannot perform any tasks while the report is locked.
        </p>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-3 text-left">
          <div className="p-2.5 bg-blue-50/80 border border-blue-200/80 rounded-xl">
            <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-0.5">
              <Clock size={12} className="text-blue-600" />
              <span>Working Hours</span>
            </div>
            <div className="text-sm font-extrabold text-blue-950">
              {formatDuration(stats?.totalWorkMinutes ?? summary?.totalWorkMinutes)}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50/90 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
              <Briefcase size={12} className="text-blue-500" />
              <span>Tasks</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              {formatDuration(stats?.taskMinutes ?? 0)}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50/90 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
              <Users size={12} className="text-indigo-500" />
              <span>Meetings</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              {formatDuration(stats?.meetingMinutes ?? 0)}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50/90 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
              <Coffee size={12} className="text-amber-500" />
              <span>Breaks</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              {formatDuration(stats?.breakMinutes ?? summary?.totalBreakMinutes)}
            </div>
          </div>
        </div>

        {/* Calculation breakdown pill */}
        <div className="w-full flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium py-1 px-2.5 mb-4 bg-slate-50 border border-slate-200/80 rounded-lg">
          <Calculator size={11} className="text-blue-600" />
          <span>Calculation: Tasks ({formatDuration(stats?.taskMinutes ?? 0)}) + Meetings ({formatDuration(stats?.meetingMinutes ?? 0)}) = <strong>{formatDuration(stats?.totalWorkMinutes ?? summary?.totalWorkMinutes)} Work</strong></span>
        </div>

        {/* Security Authorization Notice */}
        <div className="w-full p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200/90 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5 text-left mb-5">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">
              Unlock Permission Restricted
            </span>
            <span>
              Regular employees cannot unlock their own Day Report. If changes
              are required, please contact your <strong>Team Leader</strong>,{" "}
              <strong>Manager</strong>, or <strong>HR</strong> to unlock your
              report.
            </span>
          </div>
        </div>

        {/* Actions Section */}
        {canUnlock ? (
          /* Supervisor Actions (Only for Admin, HR, Manager, Team Leader) */
          <div className="w-full flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-slate-100">
            {onNavigateToUnlockModule && (
              <button
                type="button"
                onClick={onNavigateToUnlockModule}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Day Report Unlock Module</span>
                <ArrowRight size={13} />
              </button>
            )}

            {onUnlock && (
              <button
                type="button"
                onClick={onUnlock}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-xs font-semibold text-white shadow-md shadow-amber-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Unlock size={14} />
                <span>Unlock Report</span>
              </button>
            )}
          </div>
        ) : (
          /* Regular Employee Actions */
          <div className="w-full flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Awaiting supervisor unlock</span>
            </span>

            {onRefresh && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer active:scale-95"
                title="Check if your report has been unlocked"
              >
                <RefreshCw
                  size={12}
                  className={isRefreshing ? "animate-spin text-amber-600" : ""}
                />
                <span>{isRefreshing ? "Checking..." : "Check Status"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(overlayContent, document.body)
    : overlayContent;
};

export default DayReportLockedOverlay;
