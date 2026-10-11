import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useCallback, useEffect, useMemo, useState } from "react";
import useExitManagementConfig from "./useExitManagementConfig";
import useModal from "@/hooks/useModal";
import ExitManagementModal from "./ExitManagementModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";
import StatusCard from "@/components/common/StatusCard";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import {
  Users,
  FileText,
  ClipboardList,
  BadgeCheck,
  UserX,
  XCircle,
} from "lucide-react";

const DRAG_TYPE = "EXIT_CARD";

// Name for a listing row. After an exit is Completed the employee record is
// deleted (populate returns null), so fall back to the saved snapshot.
const getEmployeeLabel = (item) => {
  const emp = item.employeeId;
  if (emp && typeof emp === "object") {
    return `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeId || ""})`.trim();
  }
  if (item.employeeName) {
    return item.employeeCode
      ? `${item.employeeName} (${item.employeeCode})`
      : item.employeeName;
  }
  return "N/A";
};

const ExitManagementListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert, warningAlert } = useAlert();

  const [exitListingData, setExitListingData] = useState([]);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState("");

  const getExitListing = useCallback(async () => {
    const res = await apiCall({
      id: "getExitListing",
      api: api + apiEndpoints.employee.exit.ExitGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        employeeName: getEmployeeLabel(item),
        resignationDate: formatDateForInput(item.resignationDate),
        lastWorkingDate: formatDateForInput(item.lastWorkingDate),
      }));
      setExitListingData(formatted);
    }
  }, [apiCall]);

  useEffect(() => {
    getExitListing();
  }, [getExitListing]);

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

  // ---------------------------------------------------------------------
  // Status change (drag a row/card onto a status card)
  // ---------------------------------------------------------------------
  const executeStatusUpdate = async (exitRecord, targetStatus, statusTitle) => {
    const res = await apiCall({
      id: "updateExitStatus",
      api: api + apiEndpoints.employee.exit.ExitAddEdit,
      payload: { _id: exitRecord._id, overallStatus: targetStatus },
    });

    // Failures (e.g. assets still assigned) are shown by useApiCall.
    if (res?.success) {
      successAlert({
        title: "Status Updated",
        text:
          res.data?.message ||
          `Exit of ${exitRecord.employeeName} moved to ${statusTitle || targetStatus}.`,
      });
    }
    await getExitListing();
  };

  const handleRequestStatusChange = async (exitRecord, targetStatus, statusTitle) => {
    if (!exitRecord || !targetStatus) return;

    if (exitRecord.overallStatus === targetStatus) {
      successAlert({
        title: "Already in status",
        text: `Exit of ${exitRecord.employeeName} is already ${statusTitle || targetStatus}.`,
      });
      return;
    }

    if (exitRecord.overallStatus === "Completed") {
      warningAlert({
        title: "Exit already completed",
        text: "This employee has been removed, so a completed exit can't be moved to another status.",
      });
      return;
    }

    if (targetStatus === "Completed") {
      // Block completion until every device is returned. The server
      // enforces this too; checking here avoids a pointless confirm.
      const employeeId = exitRecord.employeeId?._id || exitRecord.employeeId;
      const assetsRes = await apiCall({
        id: "checkExitAssets",
        api: api + apiEndpoints.employee.asset.AssetsByEmployee,
        payload: { employeeId },
      });
      if (!assetsRes?.success) return;

      const pendingAssets = assetsRes.data?.data || [];
      if (pendingAssets.length > 0) {
        const names = pendingAssets
          .map((a) => a.assetName || a.assetCode || "Asset")
          .join(", ");
        warningAlert({
          title: "Devices not returned",
          text: `${exitRecord.employeeName} still has ${pendingAssets.length} assigned device${pendingAssets.length > 1 ? "s" : ""} (${names}). Open the exit record and mark all devices as returned before completing the exit.`,
        });
        return;
      }

      const confirmed = await deleteAlert({
        title: "Complete exit and remove employee?",
        text: `${exitRecord.employeeName} will be permanently deleted from the Employee module. All assigned assets must already be returned. This can't be undone.`,
        confirmButtonText: "Complete & Remove",
        cancelButtonText: "Cancel",
      });
      if (!confirmed) return;
    }

    await executeStatusUpdate(exitRecord, targetStatus, statusTitle);
  };

  const {
    draggedItem: draggingExit,
    isDragging,
    isDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop({ defaultType: DRAG_TYPE });

  // ---------------------------------------------------------------------
  // Status cards
  // ---------------------------------------------------------------------
  const exitSummary = useMemo(() => {
    const countOf = (status) =>
      exitListingData.filter((item) => item.overallStatus === status).length;

    return [
      {
        id: "total",
        title: "Total Exits",
        value: exitListingData.length.toLocaleString(),
        icon: <Users size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true,
      },
      {
        id: "submitted",
        title: "Submitted",
        value: countOf("Submitted").toLocaleString(),
        icon: <FileText size={18} className="stroke-[2.2]" />,
        type: "cyan",
        status: "Submitted",
        isDisabled: false,
      },
      {
        id: "inClearance",
        title: "In Clearance",
        value: countOf("In Clearance").toLocaleString(),
        icon: <ClipboardList size={18} className="stroke-[2.2]" />,
        type: "orange",
        status: "In Clearance",
        isDisabled: false,
      },
      {
        id: "approved",
        title: "Approved",
        value: countOf("Approved").toLocaleString(),
        icon: <BadgeCheck size={18} className="stroke-[2.2]" />,
        type: "purple",
        status: "Approved",
        isDisabled: false,
      },
      {
        id: "completed",
        title: "Completed",
        value: countOf("Completed").toLocaleString(),
        icon: <UserX size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "Completed",
        isDisabled: false,
      },
      {
        id: "rejected",
        title: "Rejected",
        value: countOf("Rejected").toLocaleString(),
        icon: <XCircle size={18} className="stroke-[2.2]" />,
        type: "red",
        status: "Rejected",
        isDisabled: false,
      },
    ];
  }, [exitListingData]);

  const handleStatusCardClick = (status) => {
    if (!status) {
      setSelectedFilterStatus("");
      return;
    }
    setSelectedFilterStatus((prev) => (prev === status ? "" : status));
  };

  const displayedExits = useMemo(() => {
    if (!selectedFilterStatus) return exitListingData;
    return exitListingData.filter((item) => item.overallStatus === selectedFilterStatus);
  }, [exitListingData, selectedFilterStatus]);

  // Grid drag handlers (rows in list view, cards in card view)
  const handleGridDragStart = ({ event, row }) => {
    handleDragStart(event, row, { type: DRAG_TYPE });
  };

  const getCardClassName = ({ row }) =>
    draggingExit?._id === row._id ? "hp-grid-card--dragging" : "";

  const getRowClassName = (row) =>
    draggingExit?._id === row._id ? "hp-grid-row--dragging" : "";

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

  // Right-click menu: Edit, status changes and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
    statusCards: exitSummary,
    statusField: "overallStatus",
    onStatusChange: handleRequestStatusChange,
    // A completed exit has removed the employee: view only, no status moves.
    isReadOnly: (row) => row.overallStatus === "Completed",
    isStatusLocked: (row) => row.overallStatus === "Completed",
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3 mr-2">
        {exitSummary.map((item) => (
          <div key={item.id}>
            <StatusCard
              {...item}
              isSelectedFilter={
                item.status
                  ? selectedFilterStatus === item.status
                  : selectedFilterStatus === ""
              }
              isDraggingAny={isDragging}
              isDropTarget={isDropTarget(item.status)}
              onDragOver={(e) =>
                handleDragOver(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: [DRAG_TYPE],
                  meta: item,
                })
              }
              onDragLeave={(e) => handleDragLeave(e, item.status)}
              onDrop={(e) =>
                handleDrop(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: [DRAG_TYPE],
                  meta: item,
                  onDrop: (exitRecord) =>
                    handleRequestStatusChange(exitRecord, item.status, item.title),
                })
              }
              onClick={() => handleStatusCardClick(item.status)}
            />
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ExitManagementModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getExitListing}
          extraParams={extraParams}
        />
      )}

      <div className="min-h-0 flex-1">
        <HpGrid
          contextData={contextData}
          id="exitManagementListing"
          rowData={displayedExits}
          colDef={exitListingColDef}
          style={{ height: "100%" }}
          onDoubleClick={handleDoubleClick}
          onCardClick={handleDoubleClick}
          onAddClick={handleAdd}
          title="Exit Management"
          toggle
          cardTitleField="employeeName"
          cardSubtitleField="exitType"
          cardStatusField="overallStatus"
          cardFields={["resignationDate", "lastWorkingDate", "fnfStatus"]}
          cardDraggable
          onCardDragStart={handleGridDragStart}
          onCardDragEnd={handleDragEnd}
          getCardClassName={getCardClassName}
          rowDraggable
          onRowDragStart={handleGridDragStart}
          onRowDragEnd={handleDragEnd}
          rowClassName={getRowClassName}
          columnFilterable={true}
          panding={
            isPending("deleteExit") ||
            isPending("getExitListing") ||
            isPending("updateExitStatus") ||
            isPending("checkExitAssets")
          }
        />
      </div>
    </div>
  );
};

export default ExitManagementListing;
