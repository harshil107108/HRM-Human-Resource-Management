import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import useAttendanceRequestConfig from "./useAttendanceRequestConfig";
import useModal from "@/hooks/useModal";
import AttendanceRequestModal from "./AttendanceRequestModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";

const AttendanceRequestListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Attendance Request?",
      text: "Are you sure you want to delete this attendance request? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteAttendanceRequest",
          api: api + apiEndpoints.attendance.request.RequestDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Request Deleted",
            text: "Attendance request deleted successfully.",
          });
          getAttendanceRequestListing();
        }
      },
    });
  };

  const { attendanceRequestListingColDef } = useAttendanceRequestConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [requestData, setRequestData] = useState([]);

  const getAttendanceRequestListing = async () => {
    const res = await apiCall({
      id: "getAttendanceRequestListing",
      api: api + apiEndpoints.attendance.request.RequestGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        employeeName: item.employeeId
          ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || ""})`
          : "N/A",
        date: formatDateForInput(item.date),
      }));
      setRequestData(formatted);
    }
  };

  useEffect(() => {
    getAttendanceRequestListing();
  }, []);

  const handleAdd = () => {
    onModalOpen({ mode: "add" });
  };

  const handleDoubleClick = (data) => {
    const id = data?.data?._id;
    if (id) {
      onModalOpen({ mode: "edit", id });
    }
  };

  useDocumentTitle("orvexa | Attendance Requests");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
  });

  return (
    <>
      {isModalOpen && (
        <AttendanceRequestModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getAttendanceRequestListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="attendanceRequestListing"
        rowData={requestData}
        colDef={attendanceRequestListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Attendance Regularization & Requests"
        columnFilterable={true}
        panding={isPending("deleteAttendanceRequest") || isPending("getAttendanceRequestListing")}
      />
    </>
  );
};

export default AttendanceRequestListing;
