import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import useSalaryStructureConfig from "./useSalaryStructureConfig";
import useModal from "@/hooks/useModal";
import SalaryStructureModal from "./SalaryStructureModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const SalaryStructureListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Salary Structure?",
      text: "Are you sure you want to delete this salary structure? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteSalaryStructure",
          api: api + apiEndpoints.payroll.salaryStructure.StructureDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Structure Deleted",
            text: "Salary structure deleted successfully.",
          });
          getSalaryStructureListing();
        }
      },
    });
  };

  const { salaryStructureListingColDef } = useSalaryStructureConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [salaryStructureData, setSalaryStructureData] = useState([]);

  const getSalaryStructureListing = async () => {
    const res = await apiCall({
      id: "getSalaryStructureListing",
      api: api + apiEndpoints.payroll.salaryStructure.StructureGetData,
      payload: {},
    });

    if (res?.success) {
      setSalaryStructureData(res.data?.data || []);
    }
  };

  useEffect(() => {
    getSalaryStructureListing();
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

  useDocumentTitle("orvexa | Salary Structures");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
  });

  return (
    <>
      {isModalOpen && (
        <SalaryStructureModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getSalaryStructureListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="salaryStructureListing"
        rowData={salaryStructureData}
        colDef={salaryStructureListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Salary Structures"
        columnFilterable={true}
        panding={isPending("deleteSalaryStructure") || isPending("getSalaryStructureListing")}
      />
    </>
  );
};

export default SalaryStructureListing;
