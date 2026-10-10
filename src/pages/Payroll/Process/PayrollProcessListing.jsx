import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import usePayrollProcessConfig from "./usePayrollProcessConfig";
import useModal from "@/hooks/useModal";
import PayrollProcessModal from "./PayrollProcessModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const PayrollProcessListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Payroll Batch?",
      text: "Are you sure you want to delete this payroll process batch? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deletePayrollProcess",
          api: api + apiEndpoints.payroll.process.ProcessDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Batch Deleted",
            text: "Payroll process batch deleted successfully.",
          });
          getPayrollProcessListing();
        }
      },
    });
  };

  const { payrollProcessListingColDef } = usePayrollProcessConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [processData, setProcessData] = useState([]);

  const getPayrollProcessListing = async () => {
    const res = await apiCall({
      id: "getPayrollProcessListing",
      api: api + apiEndpoints.payroll.process.ProcessGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        period: `${item.month || "-"}/${item.year || "-"}`,
      }));
      setProcessData(formatted);
    }
  };

  useEffect(() => {
    getPayrollProcessListing();
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

  useDocumentTitle("orvexa | Payroll Processing");

  return (
    <>
      {isModalOpen && (
        <PayrollProcessModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getPayrollProcessListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        id="payrollProcessListing"
        rowData={processData}
        colDef={payrollProcessListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Payroll Processing Runs"
        columnFilterable={true}
        panding={isPending("deletePayrollProcess") || isPending("getPayrollProcessListing")}
      />
    </>
  );
};

export default PayrollProcessListing;
