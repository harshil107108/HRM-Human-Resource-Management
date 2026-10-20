import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  MessageSquareText,
  Copy,
  Check,
  Calendar,
  Lock,
  Unlock,
  Clock,
  Briefcase,
} from "lucide-react";

const RemarksPreviewModal = ({ isOpen, onClose, report }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  const fullRemarks =
    report.remarksSummary && report.remarksSummary !== "No remarks"
      ? report.remarksSummary
      : "No remarks recorded for this day.";

  const handleCopy = () => {
    if (!fullRemarks) return;
    navigator.clipboard.writeText(fullRemarks);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLocked = report.status === "Locked" || report.status === "Submitted";
  const activities = report.activities || [];

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="remarks-preview-title"
    >
      <div
        className="relative max-w-2xl w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] p-6 sm:p-8 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <MessageSquareText size={20} />
            </div>
            <div>
              <h3
                id="remarks-preview-title"
                className="text-lg font-bold text-slate-800 leading-tight"
              >
                Remarks & Notes Preview
              </h3>
              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">
                  {report.employeeName}
                </span>
                <span>•</span>
                <span className="font-mono">{report.employeeCode}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <Calendar size={11} className="text-slate-400" />
                  <span>{report.date}</span>
                </span>
                <span>•</span>
                {isLocked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Lock size={10} className="text-amber-600" />
                    <span>Locked</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Unlock size={10} className="text-emerald-600" />
                    <span>Unlocked</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
            title="Close Preview (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Main Full Remarks Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Remarks Text
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">
                      Copied to clipboard
                    </span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs">
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words font-normal">
                "{fullRemarks}"
              </p>
            </div>
          </div>

          {/* Activity Breakdown List (if activities exist) */}
          {activities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Briefcase size={14} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Associated Activities ({activities.length})
                </span>
              </div>

              <div className="space-y-2.5">
                {activities.map((act, idx) => (
                  <div
                    key={act._id || idx}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-blue-50 text-blue-700 border border-blue-100">
                          {act.type || "Task"}
                        </span>
                        <span className="font-bold text-slate-800 truncate">
                          {act.title || "Activity"}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono shrink-0">
                        <Clock size={11} />
                        <span>
                          {act.startTime}
                          {act.endTime ? ` - ${act.endTime}` : ""}
                        </span>
                        <span>({act.durationMinutes || 0}m)</span>
                      </span>
                    </div>

                    {act.remarks ? (
                      <div className="mt-1.5 pl-2.5 border-l-2 border-blue-500 text-slate-700 italic break-words">
                        "{act.remarks}"
                      </div>
                    ) : (
                      <div className="mt-1 text-slate-400 italic">
                        No specific note for this item
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">Esc</kbd> to close
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default RemarksPreviewModal;
