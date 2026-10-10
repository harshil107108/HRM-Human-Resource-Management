import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import useLoanConfig from "./useLoanConfig";
import useModal from "@/hooks/useModal";
import LoanModal from "./LoanModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const LoanListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Loan Record?",
      text: "Are you sure you want to delete this loan record? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteLoan",
          api: api + apiEndpoints.payroll.loan.LoanDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Loan Record Deleted",
            text: "Loan record has been deleted successfully.",
          });
          getLoanListing();
        }
      },
    });
  };

  const { loanListingColDef } = useLoanConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [loanData, setLoanData] = useState([]);

  const getLoanListing = async () => {
    const res = await apiCall({
      id: "getLoanListing",
      api: api + apiEndpoints.payroll.loan.LoanGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        employeeName: item.employeeId
          ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || ""})`
          : "N/A",
      }));
      setLoanData(formatted);
    }
  };

  useEffect(() => {
    getLoanListing();
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

  useDocumentTitle("orvexa | Employee Loans");

  return (
    <>
      {isModalOpen && (
        <LoanModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getLoanListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        id="loanListing"
        rowData={loanData}
        colDef={loanListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Employee Loans & Advances"
        columnFilterable={true}
        panding={isPending("deleteLoan") || isPending("getLoanListing")}
      />
    </>
  );
};

export default LoanListing;
