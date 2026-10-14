import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Flame, AlertCircle } from "lucide-react";
import { getTaskDeadlineInfo } from "@/utils/taskDeadline";

export const TaskDeadlineTimer = ({
  task,
  showDetails = false,
  className = "",
  height = "h-2",
}) => {
  const [now, setNow] = useState(() => new Date());

  // Update timer every 30 seconds for live ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const info = getTaskDeadlineInfo(task, now);

  if (!info.hasDeadline) {
    return (
      <div className={`w-full py-1 ${className}`} title="No deadline set">
        <div className={`${height} w-full rounded-full bg-slate-100`} />
      </div>
    );
  }

  // Bar fill colors matching urgency thresholds
  const progressColors = {
    overdue: "bg-red-500 shadow-sm shadow-red-500/50 animate-pulse",
    critical: "bg-rose-500 shadow-sm shadow-rose-500/50",
    warning: "bg-amber-400 shadow-sm shadow-amber-400/50",
    normal: "bg-emerald-500",
    completed: "bg-emerald-600",
    none: "bg-slate-300",
  }[info.state] || "bg-slate-300";

  const tooltipText = `${info.timerText} • Target: ${info.formattedDeadline}`;

  // Detailed mode for Modal view
  if (showDetails) {
    const badgeStyles = {
      overdue: "bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400/30 font-bold",
      critical: "bg-rose-100 text-rose-800 border-rose-300 ring-1 ring-rose-400/30 font-bold",
      warning: "bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-400/30 font-bold",
      normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
      none: "bg-slate-100 text-slate-600 border-slate-200",
    }[info.state] || "bg-slate-100 text-slate-600 border-slate-200";

    const StatusIcon = {
      overdue: AlertCircle,
      critical: Flame,
      warning: AlertTriangle,
      normal: Clock3,
      completed: CheckCircle2,
      none: Clock3,
    }[info.state] || Clock3;

    return (
      <div className={`flex flex-col gap-2 w-full ${className}`}>
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyles}`}
          >
            <StatusIcon size={13} className="shrink-0" />
            <span>{info.timerText}</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Due: {info.formattedDeadline}
          </span>
        </div>
        <div className="w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/90 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColors}`}
              style={{ width: `${info.percent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT FOR ROWS & CARDS: ONLY THE SLEEK LOADING BAR!
  return (
    <div
      className={`group/bar relative w-full flex items-center py-1 cursor-default ${className}`}
      title={tooltipText}
    >
      <div className={`${height} w-full overflow-hidden rounded-full bg-slate-200/90 shadow-inner`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColors}`}
          style={{ width: `${info.percent}%` }}
        />
      </div>
    </div>
  );
};

export default TaskDeadlineTimer;
