import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import usePayslipConfig from "./usePayslipConfig";
import useModal from "@/hooks/useModal";
import PayslipModal from "./PayslipModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const PayslipListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Payslip?",
      text: "Are you sure you want to delete this payslip record? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deletePayslip",
          api: api + apiEndpoints.payroll.payslip.PayslipDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Payslip Deleted",
            text: "Payslip record has been deleted successfully.",
          });
          getPayslipListing();
        }
      },
    });
  };

  const { payslipListingColDef } = usePayslipConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [payslipData, setPayslipData] = useState([]);

  const getPayslipListing = async () => {
    const res = await apiCall({
      id: "getPayslipListing",
      api: api + apiEndpoints.payroll.payslip.PayslipGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        employeeName: item.employeeId
          ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || ""})`
          : "N/A",
        period: `${item.month || "-"}/${item.year || "-"}`,
      }));
      setPayslipData(formatted);
    }
  };

  useEffect(() => {
    getPayslipListing();
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

  useDocumentTitle("orvexa | Employee Payslips");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
  });

  return (
    <>
      {isModalOpen && (
        <PayslipModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getPayslipListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="payslipListing"
        rowData={payslipData}
        colDef={payslipListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Employee Payslips"
        columnFilterable={true}
        panding={isPending("deletePayslip") || isPending("getPayslipListing")}
      />
    </>
  );
};

export default PayslipListing;
