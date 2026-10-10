import { HpGrid } from "@/hp-grid/src";
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
        leaveTypeName: item.leaveTypeId?.typeName || item.leaveTypeId?.typeCode || "N/A",
        startDate: formatDateForInput(item.startDate),
        endDate: formatDateForInput(item.endDate),
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
    const id = data?.data?._id;
    if (id) {
      onModalOpen({ mode: "edit", id });
    }
  };

  useDocumentTitle("orvexa | Leave Requests");

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
