import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import useLeavePolicyConfig from "./useLeavePolicyConfig";
import useModal from "@/hooks/useModal";
import LeavePolicyModal from "./LeavePolicyModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";

const LeavePolicyListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Leave Policy?",
      text: "Are you sure you want to delete this leave policy? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteLeavePolicy",
          api: api + apiEndpoints.leave.policy.PolicyDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Policy Deleted",
            text: "Leave policy deleted successfully.",
          });
          getLeavePolicyListing();
        }
      },
    });
  };

  const { leavePolicyListingColDef } = useLeavePolicyConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [policyData, setPolicyData] = useState([]);

  const getLeavePolicyListing = async () => {
    const res = await apiCall({
      id: "getLeavePolicyListing",
      api: api + apiEndpoints.leave.policy.PolicyGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        effectiveFrom: formatDateForInput(item.effectiveFrom),
        probationText: item.probationApplicable ? "Allowed" : "Not Allowed",
      }));
      setPolicyData(formatted);
    }
  };

  useEffect(() => {
    getLeavePolicyListing();
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

  useDocumentTitle("orvexa | Leave Policies");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
  });

  return (
    <>
      {isModalOpen && (
        <LeavePolicyModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getLeavePolicyListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="leavePolicyListing"
        rowData={policyData}
        colDef={leavePolicyListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Leave Policies"
        columnFilterable={true}
        panding={isPending("deleteLeavePolicy") || isPending("getLeavePolicyListing")}
      />
    </>
  );
};

export default LeavePolicyListing;
