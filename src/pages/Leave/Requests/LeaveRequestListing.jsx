import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import useLeaveRequestConfig from "./useLeaveRequestConfig";
import useModal from "@/hooks/useModal";
import LeaveRequestModal from "./LeaveRequestModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";

const LeaveRequestListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Leave Request?",
      text: "Are you sure you want to delete this leave request? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteLeaveRequest",
          api: api + apiEndpoints.leave.request.RequestDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Request Deleted",
            text: "Leave application deleted successfully.",
          });
          getLeaveRequestListing();
        }
      },
    });
  };

  const { leaveRequestListingColDef } = useLeaveRequestConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [requestData, setRequestData] = useState([]);

  const getLeaveRequestListing = async () => {
    const res = await apiCall({
      id: "getLeaveRequestListing",
      api: api + apiEndpoints.leave.request.RequestGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        employeeName: item.employeeId
          ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || ""})`
          : "N/A",
        leaveTypeName: item.leaveType?.typeName || item.leaveTypeId?.typeName || item.leaveType?.typeCode || "N/A",
        startDate: formatDateForInput(item.startDate),
        endDate: formatDateForInput(item.endDate),
        days: item.totalDays ?? item.days ?? 0,
      }));
      setRequestData(formatted);
    }
  };

  useEffect(() => {
    getLeaveRequestListing();
  }, []);

  const handleAdd = () => {
    onModalOpen({ mode: "add" });
  };

  const handleDoubleClick = (data) => {
    const row = data?.data;
    const id = row?._id;
    if (id && row.status === "Pending") {
      onModalOpen({ mode: "edit", id });
    }
  };

  useDocumentTitle("orvexa | Leave Requests");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
    canEdit: (row) => row.status === "Pending",
    canDelete: (row) => row.status === "Pending",
  });

  return (
    <>
      {isModalOpen && (
        <LeaveRequestModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getLeaveRequestListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="leaveRequestListing"
        rowData={requestData}
        colDef={leaveRequestListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Leave Applications & Requests"
        columnFilterable={true}
        panding={isPending("deleteLeaveRequest") || isPending("getLeaveRequestListing")}
      />
    </>
  );
};

export default LeaveRequestListing;
