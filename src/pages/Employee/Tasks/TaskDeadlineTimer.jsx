import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Flame, AlertCircle, PauseCircle } from "lucide-react";
import { getTaskDeadlineInfo } from "@/utils/taskDeadline";

export const TaskDeadlineTimer = ({
  task,
  showDetails = false,
  className = "",
  height = "h-1.5",
}) => {
  const [now, setNow] = useState(() => new Date());

  const isRunning = task?.status === "Running";

  // Update timer every 1 second when task is Running for live ticking!
  // Updates every 10 seconds for non-running tasks.
  useEffect(() => {
    const intervalMs = isRunning ? 1000 : 10000;
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isRunning]);

  const info = getTaskDeadlineInfo(task, now);

  if (!info.hasDeadline && info.state === "none") {
    return (
      <div className={`w-full py-1 ${className}`} title="No deadline set">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span>No deadline set</span>
        </div>
        <div className={`${height} w-full rounded-full bg-slate-100`} />
      </div>
    );
  }

  // Bar fill colors matching urgency thresholds
  const progressColors = {
    overdue: "bg-red-500 shadow-md shadow-red-500/50 animate-pulse",
    critical: "bg-red-500 shadow-md shadow-red-500/50 animate-pulse",
    warning: "bg-amber-400 shadow-sm shadow-amber-400/50",
    normal: "bg-emerald-500 shadow-sm shadow-emerald-500/30",
    completed: "bg-emerald-600",
    review: "bg-violet-500 shadow-sm shadow-violet-500/30",
    paused: "bg-amber-400 shadow-sm shadow-amber-400/40",
    assigned: "bg-slate-300",
    none: "bg-slate-200",
  }[info.state] || "bg-slate-300";

  const StatusIcon = {
    overdue: AlertCircle,
    critical: Flame,
    warning: AlertTriangle,
    normal: Clock3,
    completed: CheckCircle2,
    review: Clock3,
    paused: PauseCircle,
    assigned: Clock3,
    none: Clock3,
  }[info.state] || Clock3;

  const tooltipText = `${info.timerText} • Target: ${info.formattedDeadline}`;

  // Detailed mode for Modal view
  if (showDetails) {
    const badgeStyles = {
      overdue: "bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400/40 font-bold animate-pulse",
      critical: "bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400/40 font-bold animate-pulse",
      warning: "bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-400/30 font-semibold",
      normal: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
      review: "bg-violet-50 text-violet-700 border-violet-200 font-semibold",
      paused: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
      assigned: "bg-slate-100 text-slate-600 border-slate-200 font-medium",
      none: "bg-slate-100 text-slate-600 border-slate-200",
    }[info.state] || "bg-slate-100 text-slate-600 border-slate-200";

    return (
      <div className={`flex flex-col gap-2.5 w-full ${className}`}>
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyles}`}
          >
            <StatusIcon size={13} className="shrink-0" />
            <span>{info.timerText}</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {info.formattedDeadline}
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

  // DEFAULT FOR ROWS & CARDS: Sleek live timer label + animated progress bar
  const textColors = {
    overdue: "text-red-600 font-bold",
    critical: "text-red-600 font-bold",
    warning: "text-amber-700 font-semibold",
    normal: "text-emerald-700 font-medium",
    completed: "text-emerald-700 font-medium",
    review: "text-violet-700 font-medium",
    paused: "text-amber-700 font-semibold",
    assigned: "text-slate-500 font-medium",
    none: "text-slate-400",
  }[info.state] || "text-slate-500";

  return (
    <div
      className={`group/bar relative w-full flex flex-col justify-center py-1 cursor-default ${className}`}
      title={tooltipText}
    >
      <div className="flex items-center justify-between gap-1 mb-1 text-[11px] leading-tight">
        <span className={`inline-flex items-center gap-1 truncate ${textColors}`}>
          <StatusIcon
            size={12}
            className={
              info.isCritical || info.isOverdue
                ? "shrink-0 animate-pulse text-red-600"
                : "shrink-0"
            }
          />
          <span className="truncate">{info.timerText}</span>
        </span>
        <span className="text-[10px] text-slate-400 font-medium shrink-0">
          {info.percent}%
        </span>
      </div>
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
