import React from "react";
import { Coffee, Briefcase, PartyPopper, Users } from "lucide-react";

const useDayReportConfig = ({ isLocked = false, onRemarkChange } = {}) => {
  const dayReportListingColDef = [
    {
      id: "type",
      field: "type",
      headerName: "Type",
      width: 140,
      render: (type) => {
        const isBreak = type === "Break";
        const isCelebration = type === "Celebration";
        const isMeeting = type === "Meeting";

        const badgeClass = isBreak
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : isCelebration
          ? "border-purple-200 bg-purple-50 text-purple-700"
          : isMeeting
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-blue-200 bg-blue-50 text-blue-700";

        const Icon = isBreak
          ? Coffee
          : isCelebration
          ? PartyPopper
          : isMeeting
          ? Users
          : Briefcase;

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${badgeClass}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{type || "Task"}</span>
          </span>
        );
      },
    },
    {
      id: "title",
      field: "title",
      headerName: "Activity / Title",
      width: 320,
      render: (title) => (
        <span className="font-semibold text-slate-800">{title || "—"}</span>
      ),
    },
    {
      id: "category",
      field: "category",
      headerName: "Category",
      width: 180,
      render: (category) => (
        <span className="text-slate-600 font-medium">{category || "—"}</span>
      ),
    },
    {
      id: "timeRange",
      field: "timeRange",
      headerName: "Time",
      width: 180,
      render: (timeRange) => (
        <span className="font-mono text-xs text-slate-700">{timeRange || "—"}</span>
      ),
    },
    {
      id: "remarks",
      field: "remarks",
      headerName: "Remarks / Notes",
      type: "text",
      editable: !isLocked,
      width: 340,
      placeholder: isLocked ? "No remarks" : "Click to enter remarks...",
      onChange: (val, updatedRow, rowIndex) => {
        if (typeof onRemarkChange === "function") {
          onRemarkChange(rowIndex, val, updatedRow);
        }
      },
      render: (remarks) => (
        <span className="text-slate-500 italic truncate block">
          {remarks ? `"${remarks}"` : "—"}
        </span>
      ),
    },
  ];

  return {
    dayReportListingColDef,
  };
};

export default useDayReportConfig;
