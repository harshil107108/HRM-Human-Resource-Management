import { CheckCircle2, Clock3, Folder, UserCheck, User, Calendar, FileText, ArrowRight } from "lucide-react";
import { HpCommonModal } from "@/hp-common-modal";
import TaskDeadlineTimer from "./TaskDeadlineTimer";

const Detail = ({ label, value, className = "", icon: Icon }) => (
  <div className={`min-w-0 rounded-xl border border-slate-200/80 bg-white p-3.5 ${className}`}>
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
      {Icon && <Icon size={13} className="shrink-0 text-slate-400" />}
      {label}
    </div>
    <div className="mt-1.5 break-words text-sm font-semibold leading-5 text-slate-800">
      {value === null || value === undefined || value === "" ? "Not provided" : value}
    </div>
  </div>
);

const SectionHeading = ({ icon: Icon, title, description }) => (
  <div className="mb-3.5 flex items-center gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
      <Icon size={17} />
    </span>
    <span>
      <span className="block text-sm font-bold text-slate-800">{title}</span>
      <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
    </span>
  </div>
);

const TASK_STATUS_COLORS = {
  Assigned: "border-sky-200 bg-sky-50 text-sky-700",
  Running: "border-amber-200 bg-amber-50 text-amber-700",
  "Code Review": "border-violet-200 bg-violet-50 text-violet-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const PRIORITY_COLORS = {
  High: "border-rose-200 bg-rose-50 text-rose-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-slate-200 bg-slate-50 text-slate-600",
};

const TaskDetailsModal = ({
  open,
  task,
  onClose,
  onStatusChange,
  updatingStatus,
  canChangeStatus = true,
}) => {
  if (!task) return null;

  const nextStatuses = {
    Assigned: ["Running"],
    Running: ["Code Review", "Completed"],
    "Code Review": ["Running", "Completed"],
    Completed: ["Running"],
  }[task.status] || [];

  return (
    <HpCommonModal
      open={open}
      title={task.title}
      subTitle={task.projectName ? `Project: ${task.projectName}` : "General Task"}
      size="lg"
      icon={<FileText size={20} />}
      onClose={onClose}
      showClearButton={false}
      showSaveButton={false}
    >
      <div className="space-y-6">
        <div>
          <SectionHeading
            icon={Folder}
            title="Task Overview"
            description="Assignment, schedule, and priority details."
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Assigned To"
              value={task.assignedToName || "Unassigned"}
              icon={UserCheck}
            />
            <Detail
              label="Project"
              value={task.projectName || "General Task"}
              icon={Folder}
            />
            <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-3.5">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <Clock3 size={13} className="shrink-0 text-slate-400" />
                Current Status
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.Assigned
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {task.status}
                </span>
              </div>
            </div>

            <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Priority
              </div>
              <div className="mt-1.5">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium
                  }`}
                >
                  {task.priority || "Medium"}
                </span>
              </div>
            </div>
            <Detail
              label="Estimated Time"
              value={task.estimatedHoursLabel || "Not set"}
              icon={Clock3}
            />
            <Detail
              label="Created By"
              value={task.createdByName || "System"}
              icon={User}
            />

            {/* Deadline Timer Card */}
            <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-3.5 sm:col-span-2 lg:col-span-3">
              <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <Calendar size={13} className="shrink-0 text-slate-400" />
                Deadline Timer &amp; Progress
              </div>
              <TaskDeadlineTimer task={task} showDetails={true} />
            </div>
          </div>
        </div>

        {/* Change Status Action Bar - Only available if user can change status */}
        {canChangeStatus && onStatusChange && nextStatuses.length > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Quick Status Transition
            </div>
            <p className="mt-0.5 text-xs text-blue-700">
              Move this task to the next stage in your workflow:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {nextStatuses.map((nextStatus) => (
                <button
                  key={nextStatus}
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => onStatusChange(task, nextStatus)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm transition hover:bg-blue-50 active:scale-95 disabled:opacity-50"
                >
                  <span>Mark as {nextStatus}</span>
                  <ArrowRight size={13} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionHeading
            icon={FileText}
            title="Description & Acceptance Criteria"
            description="Deliverables, requirements, or guidelines for this task."
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            {task.description ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                {task.description}
              </p>
            ) : (
              <p className="italic text-sm text-slate-400">
                No description was provided for this task.
              </p>
            )}
          </div>
        </div>
      </div>
    </HpCommonModal>
  );
};

export default TaskDetailsModal;
