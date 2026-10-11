import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import useWeekendPolicyConfig from "./useWeekendPolicyConfig";
import useModal from "@/hooks/useModal";
import WeekendPolicyModal from "./WeekendPolicyModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const WeekendPolicyListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Weekend Policy?",
      text: "Are you sure you want to delete this weekend policy? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteWeekendPolicy",
          api: api + apiEndpoints.attendance.weekend.WeekendDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Policy Deleted",
            text: "Weekend policy deleted successfully.",
          });
          getWeekendPolicyListing();
        }
      },
    });
  };

  const { weekendPolicyListingColDef } = useWeekendPolicyConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [policyData, setPolicyData] = useState([]);

  const getWeekendPolicyListing = async () => {
    const res = await apiCall({
      id: "getWeekendPolicyListing",
      api: api + apiEndpoints.attendance.weekend.WeekendGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        daysText: Array.isArray(item.days) ? item.days.join(", ") : item.days || "Sunday",
      }));
      setPolicyData(formatted);
    }
  };

  useEffect(() => {
    getWeekendPolicyListing();
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

  useDocumentTitle("orvexa | Weekend Policies");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
  });

  return (
    <>
      {isModalOpen && (
        <WeekendPolicyModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getWeekendPolicyListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="weekendPolicyListing"
        rowData={policyData}
        colDef={weekendPolicyListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Weekend Policies"
        columnFilterable={true}
        panding={isPending("deleteWeekendPolicy") || isPending("getWeekendPolicyListing")}
      />
    </>
  );
};

export default WeekendPolicyListing;
