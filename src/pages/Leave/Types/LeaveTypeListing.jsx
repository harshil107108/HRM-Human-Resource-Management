import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import useLeaveTypeConfig from "./useLeaveTypeConfig";
import useModal from "@/hooks/useModal";
import LeaveTypeModal from "./LeaveTypeModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const LeaveTypeListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Leave Type?",
      text: "Are you sure you want to delete this leave type? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteLeaveType",
          api: api + apiEndpoints.leave.type.TypeDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Leave Type Deleted",
            text: "Leave type deleted successfully.",
          });
          getLeaveTypeListing();
        }
      },
    });
  };

  const { leaveTypeListingColDef } = useLeaveTypeConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [leaveTypeData, setLeaveTypeData] = useState([]);

  const getLeaveTypeListing = async () => {
    const res = await apiCall({
      id: "getLeaveTypeListing",
      api: api + apiEndpoints.leave.type.TypeGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        isPaidText: item.isPaid ? "Yes" : "No",
        isCarryForwardText: item.isCarryForward
          ? `Yes (Max ${item.maxCarryForwardDays || 0}d)`
          : "No",
      }));
      setLeaveTypeData(formatted);
    }
  };

  useEffect(() => {
    getLeaveTypeListing();
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

  useDocumentTitle("orvexa | Leave Types");

  return (
    <>
      {isModalOpen && (
        <LeaveTypeModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getLeaveTypeListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        id="leaveTypeListing"
        rowData={leaveTypeData}
        colDef={leaveTypeListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Leave Types"
        columnFilterable={true}
        panding={isPending("deleteLeaveType") || isPending("getLeaveTypeListing")}
      />
    </>
  );
};

export default LeaveTypeListing;
