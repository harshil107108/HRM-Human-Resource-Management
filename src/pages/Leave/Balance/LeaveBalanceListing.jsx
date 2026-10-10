import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import useLeaveBalanceConfig from "./useLeaveBalanceConfig";
import useModal from "@/hooks/useModal";
import LeaveBalanceModal from "./LeaveBalanceModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const LeaveBalanceListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Leave Balance?",
      text: "Are you sure you want to delete this leave balance record? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteLeaveBalance",
          api: api + apiEndpoints.leave.balance.BalanceDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Balance Deleted",
            text: "Leave balance record deleted successfully.",
          });
          getLeaveBalanceListing();
        }
      },
    });
  };

  const { leaveBalanceListingColDef } = useLeaveBalanceConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [balanceData, setBalanceData] = useState([]);

  const getLeaveBalanceListing = async () => {
    const res = await apiCall({
      id: "getLeaveBalanceListing",
      api: api + apiEndpoints.leave.balance.BalanceGetData,
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
      }));
      setBalanceData(formatted);
    }
  };

  useEffect(() => {
    getLeaveBalanceListing();
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

  useDocumentTitle("orvexa | Leave Balances");

  return (
    <>
      {isModalOpen && (
        <LeaveBalanceModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getLeaveBalanceListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        id="leaveBalanceListing"
        rowData={balanceData}
        colDef={leaveBalanceListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Employee Leave Balances"
        columnFilterable={true}
        panding={isPending("deleteLeaveBalance") || isPending("getLeaveBalanceListing")}
      />
    </>
  );
};

export default LeaveBalanceListing;
