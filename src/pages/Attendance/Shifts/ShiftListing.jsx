import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import useShiftConfig from "./useShiftConfig";
import useModal from "@/hooks/useModal";
import ShiftModal from "./ShiftModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const formatTimeForDisplay = (value) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || "");
  if (!match) return value || "";

  const hour24 = Number(match[1]);
  return `${hour24 % 12 || 12}:${match[2]} ${hour24 < 12 ? "AM" : "PM"}`;
};

const ShiftListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Shift?",
      text: "Are you sure you want to delete this shift? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteShift",
          api: api + apiEndpoints.attendance.shift.ShiftDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Shift Deleted",
            text: "Shift policy deleted successfully.",
          });
          getShiftListing();
        }
      },
    });
  };

  const { shiftListingColDef } = useShiftConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [shiftData, setShiftData] = useState([]);

  const getShiftListing = async () => {
    const res = await apiCall({
      id: "getShiftListing",
      api: api + apiEndpoints.attendance.shift.ShiftGetData,
      payload: {},
    });

    if (res?.success) {
      const raw = res.data?.data ?? res.data;
      const data = Array.isArray(raw) ? raw : [];
      const formatted = data.map((item) => ({
        ...item,
        startTime: formatTimeForDisplay(item.startTime),
        endTime: formatTimeForDisplay(item.endTime),
        isNightShiftText: item.isNightShift ? "Yes" : "No",
      }));
      setShiftData(formatted);
    }
  };

  useEffect(() => {
    getShiftListing();
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

  useDocumentTitle("orvexa | Shifts");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
  });

  return (
    <>
      {isModalOpen && (
        <ShiftModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getShiftListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="shiftListing"
        rowData={shiftData}
        colDef={shiftListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Work Shifts"
        columnFilterable={true}
        panding={isPending("deleteShift") || isPending("getShiftListing")}
      />
    </>
  );
};

export default ShiftListing;
