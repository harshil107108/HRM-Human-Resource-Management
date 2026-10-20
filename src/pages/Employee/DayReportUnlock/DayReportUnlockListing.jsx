import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HpGrid } from "@/hp-grid/src";
import DateField from "@/form-engine/components/fields/DateField";
import { Calendar, Lock, Unlock, RefreshCw, ShieldAlert, Users, X } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { HpImagePreview } from "@/components/feedback";
import useDayReportUnlockConfig from "./useDayReportUnlockConfig";
import DayReportDetailModal from "./DayReportDetailModal";
import RemarksPreviewModal from "./RemarksPreviewModal";

const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

const DayReportUnlockListing = () => {
  const { confirmAlert, successAlert, errorAlert } = useAlert();
  const { apiCall, isPending } = useApiCall();

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [statusFilter, setStatusFilter] = useState("All");
  const [reportsData, setReportsData] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [remarksPreviewReport, setRemarksPreviewReport] = useState(null);

  // Fetch all employee day reports for date
  const fetchDayReports = useCallback(
    async (dateToFetch = selectedDate, currentStatus = statusFilter) => {
      try {
        const res = await apiCall({
          id: "getAllDayReports",
          api: `${api}${apiEndpoints.employee.dayReport.getAllDayReports}`,
          payload: {
            date: dateToFetch,
            status: currentStatus === "All" ? undefined : currentStatus,
          },
        });

        if (res?.success) {
          setReportsData(res.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch employee day reports:", err);
      }
    },
    [apiCall, selectedDate, statusFilter]
  );

  useEffect(() => {
    fetchDayReports(selectedDate, statusFilter);
  }, [selectedDate, statusFilter, fetchDayReports]);

  // Listen for external updates (e.g. employee locked report)
  useEffect(() => {
    const handleUpdate = () => fetchDayReports(selectedDate, statusFilter);
    window.addEventListener("dayReportUpdated", handleUpdate);
    window.addEventListener("dayReportLockChanged", handleUpdate);
    return () => {
      window.removeEventListener("dayReportUpdated", handleUpdate);
      window.removeEventListener("dayReportLockChanged", handleUpdate);
    };
  }, [selectedDate, statusFilter, fetchDayReports]);

  // Handle Unlock action
  const handleUnlockClick = useCallback(
    (report) => {
      confirmAlert({
        title: "Unlock Day Report?",
        text: `Are you sure you want to unlock the day report for ${report.employeeName} on ${report.date}? This will allow the employee to log activities and edit remarks.`,
        confirmButtonText: "Unlock Report",
        cancelButtonText: "Cancel",
        onClick: async () => {
          try {
            const res = await apiCall({
              id: "unlockDayReport",
              api: `${api}${apiEndpoints.employee.dayReport.unlockDayReport}`,
              payload: {
                dayReportId: report.dayReportId,
                employeeId: report.employeeId,
                date: report.date,
              },
            });

            if (res?.success) {
              successAlert({
                title: "Report Unlocked",
                text: `Day report for ${report.employeeName} has been unlocked successfully.`,
              });

              // Dispatch global event
              window.dispatchEvent(
                new CustomEvent("dayReportLockChanged", {
                  detail: { date: report.date, isLocked: false },
                })
              );
              window.dispatchEvent(
                new CustomEvent("dayReportUpdated", {
                  detail: { date: report.date },
                })
              );

              // Close modal if open with this report
              setIsDetailModalOpen(false);
              fetchDayReports(selectedDate, statusFilter);
            }
          } catch (err) {
            errorAlert({
              title: "Unlock Failed",
              text: err?.response?.data?.message || "Failed to unlock day report.",
            });
          }
        },
      });
    },
    [apiCall, confirmAlert, successAlert, errorAlert, fetchDayReports, selectedDate, statusFilter]
  );

  // Handle View details click
  const handleViewClick = useCallback((report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  }, []);

  // Handle Profile Image circular preview click (identical to Employee Directory)
  const handleImageClick = useCallback((imageInfo) => {
    if (imageInfo?.profileImage) {
      setPreviewImage(imageInfo.profileImage);
    } else if (imageInfo?.initials) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2563eb" />
            <stop offset="50%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="#7c3aed" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="180" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${imageInfo.initials}</text>
      </svg>`;
      setPreviewImage(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
    }
  }, []);

  // Handle Remarks double click to preview
  const handleRemarksDoubleClick = useCallback((report) => {
    setRemarksPreviewReport(report);
  }, []);

  const { dayReportUnlockColDef } = useDayReportUnlockConfig({
    onUnlockClick: handleUnlockClick,
    onViewClick: handleViewClick,
    onImageClick: handleImageClick,
    onRemarksDoubleClick: handleRemarksDoubleClick,
  });

  const handleToday = () => {
    setSelectedDate(getTodayDateString());
  };

  useDocumentTitle("orvexa | Day Report Unlock");

  // Summary counts
  const stats = useMemo(() => {
    const total = reportsData.length;
    const locked = reportsData.filter(
      (r) => r.status === "Locked" || r.status === "Submitted"
    ).length;
    const unlocked = total - locked;
    return { total, locked, unlocked };
  }, [reportsData]);

  // Toolbar right controls: Date picker, Today button, Status pills, Refresh
  const toolbarControls = (
    <div className="flex items-center flex-wrap gap-2.5">
      {/* Status Filters */}
      <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
        {["All", "Locked", "Draft"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
              statusFilter === st
                ? "bg-white text-slate-800 shadow-2xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {st === "Draft" ? "Unlocked" : st}
            {st === "Locked" && stats.locked > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {stats.locked}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Date Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedDate("All")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition cursor-pointer ${
            selectedDate === "All"
              ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
          title="View all day reports date-wise across all dates"
        >
          All Dates
        </button>

        {/* Date Picker (restricted to today or past dates) */}
        <div className="w-48">
          <DateField
            id="unlockReportDate"
            value={selectedDate === "All" ? "" : selectedDate}
            max={getTodayDateString()}
            showRangeHint={false}
            showHint={false}
            onChange={(iso) => {
              if (iso) {
                const today = getTodayDateString();
                setSelectedDate(iso > today ? today : iso);
              }
            }}
            placeholder="Select Date"
          />
        </div>

        {/* Today Button */}
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

      {/* Refresh Button */}
      <button
        type="button"
        onClick={() => fetchDayReports(selectedDate, statusFilter)}
        disabled={isPending("getAllDayReports")}
        className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        title="Refresh Listing"
      >
        <RefreshCw
          size={14}
          className={isPending("getAllDayReports") ? "animate-spin text-blue-600" : ""}
        />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-white relative overflow-hidden">
      {/* Grid Canvas with increased row height (58px) to prevent image overlap */}
      <div className="flex-1 min-h-0">
        <HpGrid
          id="dayReportUnlockListing"
          title={
            selectedDate === "All"
              ? "Employee Day Reports (All Dates • Date-wise)"
              : `Employee Day Reports (${selectedDate})`
          }
          icon={<Users size={16} />}
          rowData={reportsData}
          colDef={dayReportUnlockColDef}
          rowHeight={58}
          style={{ height: "100%" }}
          toolbarRight={toolbarControls}
          searchable={true}
          toggle={false}
          defaultView="list"
          columnFilterable={true}
          panding={isPending("getAllDayReports") || isPending("unlockDayReport")}
        />
      </div>

      {/* Footer Info Strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">
            Total Employees: {stats.total}
          </span>
          <span>•</span>
          <span className="text-amber-700 font-medium flex items-center gap-1">
            <Lock size={12} className="text-amber-600" />
            Locked Reports: {stats.locked}
          </span>
          <span>•</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <Unlock size={12} className="text-emerald-600" />
            Unlocked / Draft: {stats.unlocked}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Supervisors (Admin, HR, TL, Manager) can review remarks and unlock employee reports.
        </div>
      </div>

      {/* Activity Details & Remarks Modal */}
      <DayReportDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        report={selectedReport}
        onUnlock={handleUnlockClick}
        isUnlocking={isPending("unlockDayReport")}
      />

      {/* Standard Full-Screen Circular Image Preview (Same as Employee Directory) */}
      {previewImage && (
        <HpImagePreview
          open={Boolean(previewImage)}
          src={previewImage}
          alt="Employee Profile"
          shape="circle"
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* Whole-Screen Blurred Remarks Preview Modal */}
      <RemarksPreviewModal
        isOpen={Boolean(remarksPreviewReport)}
        onClose={() => setRemarksPreviewReport(null)}
        report={remarksPreviewReport}
      />
    </div>
  );
};

export default DayReportUnlockListing;
