import { useMemo, useCallback } from "react";
import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import useAttendanceLogConfig from "./useAttendanceLogConfig";
import useModal from "@/hooks/useModal";
import AttendanceLogModal from "./AttendanceLogModal";
import useApiCall from "@/hooks/useApiCall";
import useServerPagedRows from "@/hooks/useServerPagedRows";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";
import { formMethod, useWatch, DateField } from "@/form-engine";
import { Calendar } from "lucide-react";

const formatLogRow = (item) => ({
  ...item,
  employeeName: item.employeeId
    ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || ""})`
    : "N/A",
  date: formatDateForInput(item.date),
});

const AttendanceLogListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  // Date filter form initialized with formMethod
  const dateFilterForm = useMemo(() => {
    return formMethod.createForm({
      schema: [
        {
          id: "date",
          type: "date",
          label: "",
          showHint: false,
          showRangeHint: false,
        },
      ],
      initialValue: {
        date: formatDateForInput(new Date()),
      },
    });
  }, []);

  const selectedDate = useWatch(dateFilterForm, "date");

  const filterParams = useMemo(() => {
    return selectedDate ? { date: selectedDate } : {};
  }, [selectedDate]);

  // Records arrive a page at a time (search and filters run on the server),
  // so the list scales to any number of logs.
  const logs = useServerPagedRows({
    api: api + apiEndpoints.attendance.log.LogGetData,
    params: filterParams,
    mapRow: formatLogRow,
  });

  const handleSetToday = useCallback(() => {
    dateFilterForm.methods.setValue("date", formatDateForInput(new Date()));
  }, [dateFilterForm]);

  const handleClearDate = useCallback(() => {
    dateFilterForm.methods.setValue("date", "");
  }, [dateFilterForm]);

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Attendance Log?",
      text: "Are you sure you want to delete this attendance log? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteAttendanceLog",
          api: api + apiEndpoints.attendance.log.LogDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Log Deleted",
            text: "Attendance log deleted successfully.",
          });
          logs.reload();
        }
      },
    });
  };

  const { attendanceLogListingColDef } = useAttendanceLogConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

  const handleAdd = () => {
    onModalOpen({ mode: "add", defaultDate: selectedDate });
  };

  const handleDoubleClick = (data) => {
    const id = data?.data?._id;
    if (id) {
      onModalOpen({ mode: "edit", id });
    }
  };

  useDocumentTitle("orvexa | Attendance Logs");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
  });

  const toolbarDateFilter = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 select-none">
          <Calendar size={15} className="text-slate-500" />
          <span>Date:</span>
        </div>
        <div className="w-48">
          <DateField
            form={dateFilterForm}
            field={{
              id: "date",
              showHint: false,
              showRangeHint: false,
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleSetToday}
          className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-semibold rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
          title="Jump to Today"
        >
          Today
        </button>
        {selectedDate && (
          <button
            type="button"
            onClick={handleClearDate}
            className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-semibold rounded border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-sm cursor-pointer"
            title="Clear date filter to view all logs"
          >
            All
          </button>
        )}
      </div>
    );
  }, [dateFilterForm, handleClearDate, handleSetToday, selectedDate]);

  return (
    <>
      {isModalOpen && (
        <AttendanceLogModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={logs.reload}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="attendanceLogListing"
        rowData={logs.rows}
        colDef={attendanceLogListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Attendance Logs"
        toolbarRight={toolbarDateFilter}
        columnFilterable={true}
        serverSide
        onColumnFiltersChange={logs.setFilters}
        onLoadMore={logs.loadMore}
        hasMore={logs.hasMore}
        loadingMore={logs.loadingMore}
        loadMoreError={logs.loadMoreError}
        onRetryLoadMore={logs.retryLoadMore}
        totalCount={logs.total}
        panding={isPending("deleteAttendanceLog") || logs.loading}
      />
    </>
  );
};

export default AttendanceLogListing;
