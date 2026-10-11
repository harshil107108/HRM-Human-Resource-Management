import { HpCommonModal } from "@/hp-common-modal";
import {
  CalendarDays,
  CalendarCheck2,
  Clock3,
  FileText,
  Mail,
  UserRound,
  UserRoundCheck,
} from "lucide-react";

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
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
      <Icon size={17} />
    </span>
    <span>
      <span className="block text-sm font-bold text-slate-800">{title}</span>
      <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
    </span>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return "Not provided";
  const isDateOnly =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const normalizedValue =
    isDateOnly ? `${value}T12:00:00` : value;
  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime())
    ? "Not provided"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        ...(isDateOnly ? {} : { timeStyle: "short" }),
      }).format(date);
};

const LeaveApprovalDetailsModal = ({ open, request, onClose }) => {
  if (!request) return null;

  const employee = request.employeeId;
  const leaveType = request.leaveType;
  const approver = request.approverId;
  const approverName = approver
    ? [approver.firstName, approver.middleName, approver.lastName]
        .filter(Boolean)
        .join(" ")
    : "";
  const statusStyle = {
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    Cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  }[request.status] || "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <HpCommonModal
      open={open}
      title="Leave Request Details"
      subTitle="Review the submitted leave application"
      icon={<CalendarCheck2 size={20} />}
      size="lg"
      onClose={onClose}
      showSaveButton={false}
      showClearButton={false}
      showFooter={false}
      bodyClassName="space-y-5 bg-slate-50/70"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-teal-50/60 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
              {request.employeeName
                ?.split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("") || <UserRound size={19} />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold text-slate-900">
                {request.employeeName || "Employee"}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {request.leaveTypeName || "Leave request"}
                {employee?.employeeId ? ` · ${employee.employeeId}` : ""}
              </span>
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${statusStyle}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {request.status || "Pending"}
          </span>
        </div>

        <div className="space-y-5 p-5">
          <section>
            <SectionHeading
              icon={UserRound}
              title="Employee"
              description="Contact details associated with this request"
            />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Detail label="Employee ID" value={employee?.employeeId} icon={UserRound} />
              <Detail label="Official Email" value={employee?.officialEmail} icon={Mail} />
            </div>
          </section>

          <section>
            <SectionHeading
              icon={CalendarDays}
              title="Leave schedule"
              description="Requested dates and leave allocation"
            />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Detail label="Leave Type" value={request.leaveTypeName} icon={CalendarCheck2} />
              <Detail label="Leave Type Code" value={leaveType?.typeCode} icon={FileText} />
              <Detail label="Start Date" value={formatDateTime(request.startDate)} icon={CalendarDays} />
              <Detail label="End Date" value={formatDateTime(request.endDate)} icon={CalendarDays} />
              <Detail label="Total Days" value={request.days} icon={Clock3} />
              <Detail
                label="Leave Duration"
                value={request.isHalfDay ? "Half day" : "Full day"}
                icon={Clock3}
              />
              <Detail
                label="Paid Leave"
                value={
                  typeof leaveType?.isPaid === "boolean"
                    ? leaveType.isPaid
                      ? "Yes"
                      : "No"
                    : undefined
                }
                icon={CalendarCheck2}
              />
            </div>
          </section>

          <section>
            <SectionHeading
              icon={FileText}
              title="Request reason"
              description="Reason provided by the employee"
            />
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-sm leading-6 text-slate-700">
              {request.reason || "No reason provided."}
            </div>
          </section>

          <section>
            <SectionHeading
              icon={UserRoundCheck}
              title="Review activity"
              description="Approval record and request timeline"
            />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Detail label="Reviewed By" value={approverName} icon={UserRoundCheck} />
              <Detail label="Reviewer Employee ID" value={approver?.employeeId} icon={UserRound} />
              <Detail label="Submitted" value={formatDateTime(request.createdAt)} icon={Clock3} />
              <Detail label="Last Updated" value={formatDateTime(request.updatedAt)} icon={Clock3} />
            </div>
          </section>
        </div>
      </div>
    </HpCommonModal>
  );
};

export default LeaveApprovalDetailsModal;
