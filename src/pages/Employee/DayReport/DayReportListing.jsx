import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HpGrid } from "@/hp-grid/src";
import DateField from "@/form-engine/components/fields/DateField";
import { Calendar, Lock, Unlock, CheckCircle2 } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useAuth } from "@/context/AuthContext";
import useDayReportConfig from "./useDayReportConfig";
import DayReportLockedOverlay from "./DayReportLockedOverlay";

const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};


const DayReportListing = () => {
  const navigate = useNavigate();
  const { confirmAlert, successAlert, errorAlert } = useAlert();
  const { apiCall, isPending } = useApiCall();
  const { user, isSuperAdmin } = useAuth();

  // Check if current user is supervisor (Team Leader, HR, Admin, Manager)
  const canUnlock =
    isSuperAdmin ||
    ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER", "TEAM_LEADER", "TL", "LEAD"].includes(
      String(user?.roleCode || user?.role || "").toUpperCase()
    );

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [activitiesData, setActivitiesData] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isUnlockedBySupervisor, setIsUnlockedBySupervisor] = useState(false);
  const [dayReportId, setDayReportId] = useState(null);
  const [summary, setSummary] = useState({
    totalWorkMinutes: 0,
    totalBreakMinutes: 0,
  });

  const handleRemarkChange = useCallback(
    (rowIndex, val, updatedRow) => {
      setActivitiesData((prev) => {
        const next = [...prev];
        if (next[rowIndex]) {
          next[rowIndex] = updatedRow || { ...next[rowIndex], remarks: val };
        }
        return next;
      });

      if (dayReportId && updatedRow?._id) {
        apiCall({
          id: `updateRemark_${updatedRow._id}`,
          api: `${api}${apiEndpoints.employee.dayReport.updateActivity}`,
          payload: {
            dayReportId,
            activityId: updatedRow._id,
            remarks: val,
          },
          silent: true,
        }).catch((e) => console.error("Failed to auto-save remark:", e));
      }
    },
    [apiCall, dayReportId]
  );

  const handleCellChange = useCallback(
    (rowIndex, field, val, updatedRow) => {
      setActivitiesData((prev) => {
        const next = [...prev];
        if (next[rowIndex]) {
          next[rowIndex] = updatedRow || { ...next[rowIndex], [field]: val };
        }
        return next;
      });

      if (field === "remarks" && dayReportId && updatedRow?._id) {
        apiCall({
          id: `updateRemark_${updatedRow._id}`,
          api: `${api}${apiEndpoints.employee.dayReport.updateActivity}`,
          payload: {
            dayReportId,
            activityId: updatedRow._id,
            remarks: val,
          },
          silent: true,
        }).catch((e) => console.error("Failed to auto-save remark:", e));
      }
    },
    [apiCall, dayReportId]
  );

  const { dayReportListingColDef } = useDayReportConfig({
    isLocked,
    onRemarkChange: handleRemarkChange,
  });

  // Fetch Day Report for selected date
  const getDayReportListing = useCallback(
    async (dateToFetch = selectedDate) => {
      try {
        const res = await apiCall({
          id: "getDayReport",
          api: `${api}${apiEndpoints.employee.dayReport.getDayReport}`,
          payload: { date: dateToFetch },
        });

        if (res?.success) {
          const report = res.data?.data;
          setDayReportId(report?._id || null);
          const unlockedBySup = Boolean(report?.unlockedBySupervisor);
          const locked = !unlockedBySup && report?.status === "Locked";
          setIsLocked(locked);
          setIsUnlockedBySupervisor(unlockedBySup);

          const totalWork = Number(report?.totalWorkMinutes) || 0;
          const totalBreak = Number(report?.totalBreakMinutes) || 0;
          setSummary({
            totalWorkMinutes: totalWork,
            totalBreakMinutes: totalBreak,
          });

          const list = (report?.activities || []).map((act, index) => {
            const timeRange = act.endTime
              ? `${act.startTime} - ${act.endTime}`
              : `${act.startTime}`;

            return {
              ...act,
              id: act._id || `act_${index}`,
              timeRange,
            };
          });

          setActivitiesData(list);
        }
      } catch (err) {
        console.error("Failed to fetch day report:", err);
      }
    },
    [apiCall, selectedDate]
  );

  useEffect(() => {
    getDayReportListing(selectedDate);
  }, [selectedDate, getDayReportListing]);

  // Automatically refresh when a timer or task finishes and logs an activity
  useEffect(() => {
    const handleReportUpdate = (e) => {
      const eventDate = e?.detail?.date;
      if (!eventDate || eventDate === selectedDate) {
        getDayReportListing(selectedDate);
      }
    };
    window.addEventListener("dayReportUpdated", handleReportUpdate);
    window.addEventListener("dayReportLockChanged", handleReportUpdate);
    return () => {
      window.removeEventListener("dayReportUpdated", handleReportUpdate);
      window.removeEventListener("dayReportLockChanged", handleReportUpdate);
    };
  }, [selectedDate, getDayReportListing]);

  const handleToday = () => {
    setSelectedDate(getTodayDateString());
  };

  // Toggle Lock Report Handler
  const handleToggleLock = () => {
    const today = getTodayDateString();
    if (selectedDate > today) {
      errorAlert({
        title: "Future Date Restricted",
        text: "Cannot submit or lock Day Report for a future date. Only today or past dates are accessible.",
      });
      return;
    }

    const nextLocked = !isLocked;

    // If an employee attempts to unlock, reject immediately
    if (!nextLocked && !canUnlock) {
      errorAlert({
        title: "Access Restricted",
        text: "Employees cannot unlock a locked Day Report. Please contact your Team Leader, Manager, or HR to unlock your report.",
      });
      return;
    }

    confirmAlert({
      title: nextLocked ? "Lock Day Report?" : "Unlock Day Report?",
      text: nextLocked
        ? `Are you sure you want to lock the day report for ${selectedDate}? All remarks will be saved and no further tasks can be performed.`
        : `Are you sure you want to unlock the day report for ${selectedDate}?`,
      confirmButtonText: nextLocked ? "Save & Lock Report" : "Unlock Report",
      cancelButtonText: "Cancel",
      onClick: async () => {
        try {
          const res = await apiCall({
            id: "toggleLock",
            api: `${api}${apiEndpoints.employee.dayReport.toggleLock}`,
            payload: {
              date: selectedDate,
              status: nextLocked ? "Locked" : "Draft",
              activities: activitiesData,
            },
          });

          if (res?.success) {
            setIsLocked(nextLocked);
            successAlert({
              title: nextLocked ? "Day Report Locked" : "Day Report Unlocked",
              text: nextLocked
                ? `Day report for ${selectedDate} has been saved and locked.`
                : `Day report for ${selectedDate} has been unlocked.`,
            });
            window.dispatchEvent(
              new CustomEvent("dayReportLockChanged", {
                detail: {
                  date: selectedDate,
                  isLocked: nextLocked,
                },
              })
            );
            getDayReportListing(selectedDate);
          }
        } catch (err) {
          errorAlert({
            title: "Operation Failed",
            text:
              err?.response?.data?.message ||
              "Failed to update Day Report lock status.",
          });
        }
      },
    });
  };

  useDocumentTitle("orvexa | Day Report");

  // Date controls: DateField + Today button (strictly restricted to today or past dates)
  const toolbarDateControls = (
    <div className="flex items-center gap-2.5">
      <div className="w-56">
        <DateField
          id="dayReportDate"
          value={selectedDate}
          max={getTodayDateString()}
          showRangeHint={false}
          showHint={false}
          onChange={(iso) => {
            if (iso) {
              const today = getTodayDateString();
              setSelectedDate(iso > today ? today : iso);
            }
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleToday}
        className="hp-grid-add-btn cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
        title="Jump to Today"
      >
        <Calendar size={13} />
        <span>Today</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-white relative">
      {/* 1. Full-Screen Centered Modal with Blurred Background when Locked */}
      {isLocked && (
        <DayReportLockedOverlay
          isLocked={isLocked}
          date={selectedDate}
          onDateChange={(newDate) => {
            if (newDate) {
              const today = getTodayDateString();
              setSelectedDate(newDate > today ? today : newDate);
            }
          }}
          summary={summary}
          activitiesCount={activitiesData.length}
          canUnlock={canUnlock}
          onUnlock={handleToggleLock}
          onNavigateToUnlockModule={() =>
            navigate("/employee/day-report-unlock")
          }
          onRefresh={() => getDayReportListing(selectedDate)}
        />
      )}

      {/* 2. Full-Height HpGrid with Editable Remarks */}
      <div className="flex-1 min-h-0">
        <HpGrid
          id="dayReportListing"
          title={`Day Report (${selectedDate})`}
          icon={<Calendar size={15} />}
          rowData={activitiesData}
          colDef={dayReportListingColDef}
          style={{ height: "100%" }}
          toolbarRight={toolbarDateControls}
          searchable={false}
          toggle={false}
          defaultView="list"
          columnFilterable={true}
          onCellChange={handleCellChange}
          panding={isPending("getDayReport") || isPending("toggleLock")}
        />
      </div>

      {/* Footer with Save & Lock Button or Submitted (Disabled) */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            {isUnlockedBySupervisor
              ? "✓ This day report was unlocked by management and is marked as Submitted."
              : '💡 Tip: Click on any Remark cell in the grid to edit notes, then click "Lock Report" to finalize and submit for today.'}
          </span>
        </div>

        {isUnlockedBySupervisor ? (
          <button
            type="button"
            disabled={true}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-slate-200 bg-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed select-none opacity-80"
            title="Report is submitted"
          >
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Submitted</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleToggleLock}
            disabled={isPending("toggleLock")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-amber-600 bg-white text-amber-600 hover:bg-amber-50 shadow-xs text-sm font-medium transition-all cursor-pointer"
          >
            <Lock size={15} className="text-amber-600" />
            <span>Lock Report</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DayReportListing;
