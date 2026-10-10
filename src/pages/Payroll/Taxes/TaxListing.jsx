import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import useTaxConfig from "./useTaxConfig";
import useModal from "@/hooks/useModal";
import TaxModal from "./TaxModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const TaxListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Tax Declaration?",
      text: "Are you sure you want to delete this tax declaration? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteTaxDeclaration",
          api: api + apiEndpoints.payroll.tax.TaxDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Declaration Deleted",
            text: "Tax declaration has been deleted successfully.",
          });
          getTaxListing();
        }
      },
    });
  };

  const { taxListingColDef } = useTaxConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [taxData, setTaxData] = useState([]);

  const getTaxListing = async () => {
    const res = await apiCall({
      id: "getTaxListing",
      api: api + apiEndpoints.payroll.tax.TaxGetData,
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
      setTaxData(formatted);
    }
  };

  useEffect(() => {
    getTaxListing();
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

  useDocumentTitle("orvexa | Income Tax Declarations");

  return (
    <>
      {isModalOpen && (
        <TaxModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getTaxListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        id="taxListing"
        rowData={taxData}
        colDef={taxListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Income Tax Declarations"
        columnFilterable={true}
        panding={isPending("deleteTaxDeclaration") || isPending("getTaxListing")}
      />
    </>
  );
};

export default TaxListing;
