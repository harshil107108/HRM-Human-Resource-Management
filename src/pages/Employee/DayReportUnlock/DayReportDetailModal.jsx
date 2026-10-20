import React, { useEffect } from "react";
import {
  X,
  Lock,
  Unlock,
  Clock,
  Coffee,
  Briefcase,
  PartyPopper,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  BadgeAlert,
} from "lucide-react";
import { getUploadUrl } from "@/utils/fileUpload";

const formatDuration = (mins = 0) => {
  const m = Number(mins) || 0;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
};

export default function DayReportDetailModal({
  isOpen,
  onClose,
  report,
  onUnlock,
  isUnlocking = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const activities = report.activities || [];
  const isLocked = report.isLocked || report.status === "Locked";

  // Compute fallback initials
  const initials = (report.employeeName || "E")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const profileImageUrl = report.profileImage
    ? getUploadUrl(report.profileImage)
    : null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[92%] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Employee Profile Card */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 shrink-0">
          <div className="flex items-center gap-4">
            {/* Employee Image */}
            <div className="relative">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={report.employeeName}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/20 shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg items-center justify-center shadow-md ring-2 ring-blue-500/20 ${
                  profileImageUrl ? "hidden" : "flex"
                }`}
              >
                {initials}
              </div>

              {/* Status Dot */}
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] ${
                  isLocked ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                }`}
                title={isLocked ? "Report is Locked" : "Report is Unlocked"}
              >
                {isLocked ? "🔒" : "✓"}
              </span>
            </div>

            {/* Employee Information */}
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-slate-800 text-lg leading-tight">
                  {report.employeeName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isLocked
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                  <span>{isLocked ? "Locked" : "Unlocked / Draft"}</span>
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="font-mono text-slate-600 font-semibold">
                  {report.employeeCode || "EMP-000"}
                </span>
                <span>•</span>
                <span>{report.designation}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 size={12} />
                  {report.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-slate-700 font-medium">
                  <Calendar size={12} />
                  {report.date}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-3 gap-3 px-6 py-3 bg-slate-50/70 border-b border-slate-100 shrink-0 text-xs">
          <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Work
              </div>
              <div className="text-sm font-bold text-slate-800">
                {formatDuration(report.totalWorkMinutes)}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Coffee size={16} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Break
              </div>
              <div className="text-sm font-bold text-slate-800">
                {formatDuration(report.totalBreakMinutes)}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Activities Logged
              </div>
              <div className="text-sm font-bold text-slate-800">
                {activities.length} items
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Activities Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-0 bg-slate-50/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tasks & Activity Breakdown
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Date: {report.date}
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              <BadgeAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                No activities logged yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                The employee has not logged any task or break sessions for this date.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activities.map((act, index) => {
                const isBreak = act.type === "Break";
                const isMeeting = act.type === "Meeting";
                const isCelebration = act.type === "Celebration";

                const TypeIcon = isBreak
                  ? Coffee
                  : isMeeting
                  ? Users
                  : isCelebration
                  ? PartyPopper
                  : Briefcase;

                const badgeColor = isBreak
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : isMeeting
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : isCelebration
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-blue-50 text-blue-700 border-blue-200";

                return (
                  <div
                    key={act._id || index}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}
                        >
                          <TypeIcon size={12} />
                          <span>{act.type || "Task"}</span>
                        </span>
                        <span className="font-semibold text-slate-800 text-sm">
                          {act.title}
                        </span>
                        {act.category && (
                          <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-100">
                            {act.category}
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-700 block">
                          {act.startTime} {act.endTime ? `— ${act.endTime}` : ""}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {act.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    {/* Remarks Highlight Box */}
                    <div className="mt-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                        Employee Remarks
                      </div>
                      <p className="text-slate-700 italic">
                        {act.remarks ? `"${act.remarks}"` : "— No remarks entered —"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-500">
            {isLocked ? (
              <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                <Lock size={13} className="text-amber-600" />
                Report is Locked. Unlocking allows the employee to add or edit tasks.
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Report is currently Unlocked (Draft mode).
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Close
            </button>

            {isLocked && (
              <button
                type="button"
                onClick={() => onUnlock(report)}
                disabled={isUnlocking}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Unlock size={14} />
                <span>{isUnlocking ? "Unlocking..." : "Unlock This Report"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
