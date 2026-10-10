import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import useExitManagementConfig from "./useExitManagementConfig";
import useModal from "@/hooks/useModal";
import ExitManagementModal from "./ExitManagementModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";

const ExitManagementListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Exit Record?",
      text: "Are you sure you want to delete this exit record? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteExit",
          api: api + apiEndpoints.employee.exit.ExitDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Record Deleted",
            text: "Exit record has been deleted successfully.",
          });
          getExitListing();
        }
      },
    });
  };

  const { exitListingColDef } = useExitManagementConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [exitListingData, setExitListingData] = useState([]);

  const getExitListing = async () => {
    const res = await apiCall({
      id: "getExitListing",
      api: api + apiEndpoints.employee.exit.ExitGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        employeeName: item.employeeId
          ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || ""})`
          : "N/A",
        resignationDate: formatDateForInput(item.resignationDate),
        lastWorkingDate: formatDateForInput(item.lastWorkingDate),
      }));
      setExitListingData(formatted);
    }
  };

  useEffect(() => {
    getExitListing();
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

  useDocumentTitle("orvexa | Exit Management");

  return (
    <>
      {isModalOpen && (
        <ExitManagementModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getExitListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        id="exitManagementListing"
        rowData={exitListingData}
        colDef={exitListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Exit Management"
        columnFilterable={true}
        panding={isPending("deleteExit") || isPending("getExitListing")}
      />
    </>
  );
};

export default ExitManagementListing;
