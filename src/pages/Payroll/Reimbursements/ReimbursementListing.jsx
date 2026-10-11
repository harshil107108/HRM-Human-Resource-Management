import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import useReimbursementConfig from "./useReimbursementConfig";
import useModal from "@/hooks/useModal";
import ReimbursementModal from "./ReimbursementModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";

const ReimbursementListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Expense Claim?",
      text: "Are you sure you want to delete this reimbursement claim? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteReimbursement",
          api: api + apiEndpoints.payroll.reimbursement.ReimbursementDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Claim Deleted",
            text: "Reimbursement claim deleted successfully.",
          });
          getReimbursementListing();
        }
      },
    });
  };

  const { reimbursementListingColDef } = useReimbursementConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [reimbursementData, setReimbursementData] = useState([]);

  const getReimbursementListing = async () => {
    const res = await apiCall({
      id: "getReimbursementListing",
      api: api + apiEndpoints.payroll.reimbursement.ReimbursementGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        employeeName: item.employeeId
          ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || ""})`
          : "N/A",
        claimDate: formatDateForInput(item.claimDate),
      }));
      setReimbursementData(formatted);
    }
  };

  useEffect(() => {
    getReimbursementListing();
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

  useDocumentTitle("orvexa | Employee Reimbursements");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
  });

  return (
    <>
      {isModalOpen && (
        <ReimbursementModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getReimbursementListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="reimbursementListing"
        rowData={reimbursementData}
        colDef={reimbursementListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Employee Expense Reimbursements"
        columnFilterable={true}
        panding={isPending("deleteReimbursement") || isPending("getReimbursementListing")}
      />
    </>
  );
};

export default ReimbursementListing;
