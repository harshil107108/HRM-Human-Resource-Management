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

  // Records arrive a page at a time (search and filters run on the server),
  // so the list scales to any number of logs.
  const logs = useServerPagedRows({
    api: api + apiEndpoints.attendance.log.LogGetData,
    mapRow: formatLogRow,
  });

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
    onModalOpen({ mode: "add" });
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
