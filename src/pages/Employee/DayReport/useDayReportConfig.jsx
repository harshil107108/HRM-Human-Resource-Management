import React from "react";
import { Coffee, Briefcase, PartyPopper, Users, Clock } from "lucide-react";

export const parseTimeMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const getActivityDuration = (act) => {
  if (!act) return 0;
  if (typeof act.durationMinutes === "number" && act.durationMinutes > 0) {
    return act.durationMinutes;
  }
  if (act.startTime && act.endTime) {
    const s = parseTimeMinutes(act.startTime);
    const e = parseTimeMinutes(act.endTime);
    if (s !== null && e !== null) {
      let diff = e - s;
      if (diff < 0) diff += 24 * 60; // crossed midnight
      return diff;
    }
  }
  return Number(act.durationMinutes) || 0;
};

export const formatDuration = (mins = 0) => {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
};

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
      id: "durationMinutes",
      field: "durationMinutes",
      headerName: "Duration",
      width: 120,
      render: (duration, row) => {
        const mins = getActivityDuration(row);
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {formatDuration(mins)}
          </span>
        );
      },
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
