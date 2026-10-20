import React from "react";
import { Lock, Unlock, Eye, Clock, Coffee, CheckCircle2 } from "lucide-react";
import { getUploadUrl } from "@/utils/fileUpload";

const formatDuration = (mins = 0) => {
  const m = Number(mins) || 0;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
};

const useDayReportUnlockConfig = ({
  onUnlockClick,
  onViewClick,
  onImageClick,
  onRemarksDoubleClick,
} = {}) => {
  const dayReportUnlockColDef = [
    {
      id: "employee",
      field: "employeeName",
      headerName: "Employee",
      width: 260,
      render: (name, row) => {
        const initials = (name || "E")
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        const profileImageUrl = row.profileImage
          ? getUploadUrl(row.profileImage)
          : null;

        return (
          <div className="flex items-center gap-3 py-1">
            {/* Circular Profile Image with elegant border & fallback (Click to preview) */}
            <div
              className="relative shrink-0 cursor-pointer group focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onImageClick?.({
                  name,
                  employeeCode: row.employeeCode,
                  designation: row.designation,
                  department: row.department,
                  profileImage: profileImageUrl,
                  initials,
                });
              }}
              title="Click to view circular image preview"
              role="button"
              tabIndex={0}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200/90 shadow-2xs group-hover:ring-blue-500 group-hover:scale-105 transition-all duration-150"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs items-center justify-center ring-2 ring-slate-200/90 shadow-2xs group-hover:ring-blue-500 group-hover:scale-105 transition-all duration-150 ${
                  profileImageUrl ? "hidden" : "flex"
                }`}
              >
                {initials}
              </div>
            </div>

            {/* Name, Code & Email */}
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 text-sm truncate block leading-tight">
                {name || "Employee"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono block mt-0.5 truncate">
                {row.employeeCode || "EMP-000"} {row.email ? `• ${row.email}` : ""}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "designation",
      field: "designation",
      headerName: "Designation & Dept",
      width: 190,
      render: (designation, row) => (
        <div>
          <span className="font-medium text-slate-800 text-xs block leading-tight">
            {designation || "—"}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {row.department || "—"}
          </span>
        </div>
      ),
    },
    {
      id: "date",
      field: "date",
      headerName: "Date",
      width: 120,
      render: (date) => (
        <span className="font-mono text-xs text-slate-700 font-medium">
          {date || "—"}
        </span>
      ),
    },
    {
      id: "totalWorkMinutes",
      field: "totalWorkMinutes",
      headerName: "Work Time",
      width: 120,
      render: (mins) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          <Clock size={12} className="text-blue-600" />
          <span>{formatDuration(mins)}</span>
        </span>
      ),
    },
    {
      id: "totalBreakMinutes",
      field: "totalBreakMinutes",
      headerName: "Break Time",
      width: 120,
      render: (mins) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
          <Coffee size={12} className="text-amber-600" />
          <span>{formatDuration(mins)}</span>
        </span>
      ),
    },
    {
      id: "activitiesCount",
      field: "activitiesCount",
      headerName: "Activities",
      width: 110,
      render: (count) => (
        <span className="text-xs text-slate-700 font-medium">
          {count || 0} items
        </span>
      ),
    },
    {
      id: "remarksSummary",
      field: "remarksSummary",
      headerName: "Remarks / Notes",
      width: 250,
      render: (remarks, row) => (
        <div
          className="flex items-center gap-1.5 cursor-pointer group py-1 min-w-0"
          onDoubleClick={(e) => {
            e.stopPropagation();
            onRemarksDoubleClick?.(row);
          }}
          title={
            remarks && remarks !== "No remarks"
              ? `"${remarks}" • Double-click to preview full remarks`
              : "No remarks recorded"
          }
        >
          <span className="text-slate-600 italic truncate block text-xs group-hover:text-blue-600 group-hover:underline transition-colors">
            {remarks && remarks !== "No remarks" ? `"${remarks}"` : "—"}
          </span>
          {remarks && remarks !== "No remarks" && (
            <span className="text-[10px] text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              [Preview]
            </span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      field: "status",
      headerName: "Status",
      width: 120,
      render: (status) => {
        const isLocked = status === "Locked" || status === "Submitted";
        return isLocked ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Lock size={11} className="text-amber-600" />
            <span>Locked</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Unlock size={11} className="text-emerald-600" />
            <span>Unlocked</span>
          </span>
        );
      },
    },
    {
      id: "actions",
      field: "actions",
      headerName: "Actions",
      width: 180,
      render: (_, row) => {
        const isLocked = row.status === "Locked" || row.status === "Submitted";

        return (
          <div className="flex items-center gap-2">
            {/* View Details / Remarks */}
            <button
              type="button"
              onClick={() => onViewClick && onViewClick(row)}
              className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition cursor-pointer"
              title="View Tasks & Remarks"
            >
              <Eye size={14} />
            </button>

            {/* Unlock Button for Locked Reports */}
            {isLocked ? (
              <button
                type="button"
                onClick={() => onUnlockClick && onUnlockClick(row)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                title="Unlock this employee report"
              >
                <Unlock size={12} />
                <span>Unlock</span>
              </button>
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50">
                <CheckCircle2 size={12} />
                <span>Editable</span>
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return {
    dayReportUnlockColDef,
  };
};

export default useDayReportUnlockConfig;
