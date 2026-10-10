import { HpGrid } from "@/hp-grid/src";
import { useLocation, useNavigate } from "react-router-dom";
import useAssetConfig from "./useAssetConfig";
import useAlert from "@/hooks/useAlert";
import { useState, useEffect, useMemo, useCallback } from "react";
import { api, apiEndpoints } from "@/api/api";
import useApiCall from "@/hooks/useApiCall";
import { formatDateForInput } from "@/utils/dateUtils";
import AssetCard from "./AssetCard";
import AssetAssignModal from "./AssetAssignModal";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import {
  Layers,
  CheckCircle2,
  UserCheck,
  Wrench,
  AlertTriangle,
  Trash2,
} from "lucide-react";

const AssetListing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { deleteAlert, successAlert } = useAlert();
  const { apiCall, isPending } = useApiCall();

  const [AssetListingData, setAssetListingData] = useState([]);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState("");

  // Assign Modal state
  const [assignModalState, setAssignModalState] = useState({
    open: false,
    asset: null,
  });

  const handleDelete = async (id) => {
    deleteAlert({
      title: "Delete Asset?",
      text: "Are you sure you want to delete this Asset? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",

      onClick: async () => {
        const res = await apiCall({
          id: "deleteAsset",
          api: api + apiEndpoints.employee,
          payload: {
            _id: id,
          },
        });

        if (res?.success) {
          successAlert({
            title: "Asset deleted",
            text: "Asset has been deleted successfully.",
          });

          getAssetListing(selectedFilterStatus);
        }
      },
    });
  };

  const { assetListingColDef } = useAssetConfig({
    handleDelete,
  });

  const handleAdd = () => {
    navigate(`${location.pathname}/addedit`, {
      state: {
        assetid: null,
      },
    });
  };

  const handleDoubleClick = (params) => {
    const { data } = params;

    navigate(`${location.pathname}/addedit`, {
      state: {
        assetid: data?._id,
      },
    });
  };

  const getAssetListing = useCallback(
    async (assetStatus = "") => {
      const res = await apiCall({
        id: "getAssetListing",
        api: api + apiEndpoints.employee.asset.AssetGetData,
        payload: assetStatus
          ? {
              assetStatus,
            }
          : {},
      });

      if (res?.success) {
        const data = res?.data?.data || [];

        const formattedData = data.map((item) => ({
          ...item,
          _raw: item, // preserve original populated document for status updates
          assetName: item?.assetName || "",
          assetCode: item?.assetCode || "",
          categoryName: item?.assetCategory?.categoryName || "",
          assetTag: item?.assetTag || "",
          serialNumber: item?.serialNumber || "",
          brand: item?.brand || "",
          model: item?.model || "",
          assignedEmployee: [
            item?.assignedEmployee?.firstName,
            item?.assignedEmployee?.lastName,
          ]
            .filter(Boolean)
            .join(" "),
          companyName: item?.company?.companyName || "",
          branchname: item?.branch?.branchname || "",
          purchaseDate: formatDateForInput(item?.purchaseDate) || "",
          warrantyEndDate: formatDateForInput(item?.warrantyEndDate) || "",
          assetStatus: item?.assetStatus || "",
        }));

        setAssetListingData(formattedData);
      }
    },
    [apiCall],
  );

  useEffect(() => {
    getAssetListing();
  }, [getAssetListing]);

  // Executes status update request to backend with complete payload validation
  const executeStatusUpdate = async (
    asset,
    targetStatus,
    assignmentData = null,
    statusTitle = "",
  ) => {
    try {
      let fullData = asset._raw;
      if (!fullData?.company || !fullData?.assetCategory) {
        const resById = await apiCall({
          id: "getAssetByIdForStatus",
          api: api + apiEndpoints.employee.asset.AssetGetByID,
          payload: { _id: asset._id },
        });
        if (resById?.success && resById.data?.data) {
          fullData = resById.data.data;
        }
      }

      const formData = new FormData();
      formData.append("_id", asset._id);
      formData.append(
        "assetName",
        asset.assetName || fullData?.assetName || "",
      );
      formData.append(
        "assetCode",
        asset.assetCode || fullData?.assetCode || "",
      );

      const categoryId =
        fullData?.assetCategory?._id ||
        fullData?.assetCategory ||
        asset.assetCategory ||
        "";
      formData.append("assetCategory", categoryId);

      formData.append("assetTag", asset.assetTag || fullData?.assetTag || "");
      formData.append(
        "condition",
        fullData?.condition || asset.condition || "GOOD",
      );

      const companyId =
        fullData?.company?._id || fullData?.company || asset.company || "";
      formData.append("company", companyId);

      if (fullData?.brand || asset.brand) {
        formData.append("brand", fullData?.brand || asset.brand || "");
      }
      if (fullData?.model || asset.model) {
        formData.append("model", fullData?.model || asset.model || "");
      }
      if (fullData?.serialNumber || asset.serialNumber) {
        formData.append(
          "serialNumber",
          fullData?.serialNumber || asset.serialNumber || "",
        );
      }
      if (fullData?.purchaseDate) {
        formData.append("purchaseDate", fullData.purchaseDate);
      }
      if (
        fullData?.purchaseCost !== undefined &&
        fullData?.purchaseCost !== null &&
        fullData?.purchaseCost !== ""
      ) {
        formData.append("purchaseCost", String(fullData.purchaseCost));
      }
      if (fullData?.vendor) {
        formData.append("vendor", fullData.vendor);
      }
      if (fullData?.invoiceNumber) {
        formData.append("invoiceNumber", fullData.invoiceNumber);
      }
      if (fullData?.warrantyStartDate) {
        formData.append("warrantyStartDate", fullData.warrantyStartDate);
      }
      if (fullData?.warrantyEndDate) {
        formData.append("warrantyEndDate", fullData.warrantyEndDate);
      }

      const branchId = fullData?.branch?._id || fullData?.branch || "";
      if (branchId) formData.append("branch", branchId);

      const deptId = fullData?.department?._id || fullData?.department || "";
      if (deptId) formData.append("department", deptId);

      formData.append("assetStatus", targetStatus);

      if (targetStatus === "ASSIGNED" && assignmentData) {
        formData.append(
          "assignedEmployee",
          assignmentData.assignedEmployee || "",
        );
        formData.append(
          "assignedDate",
          assignmentData.assignedDate ||
            new Date().toISOString().split("T")[0],
        );
        if (assignmentData.expectedReturnDate) {
          formData.append(
            "expectedReturnDate",
            assignmentData.expectedReturnDate,
          );
        }
        if (assignmentData.description) {
          formData.append("description", assignmentData.description);
        } else if (fullData?.description) {
          formData.append("description", fullData.description);
        }
      } else {
        // Unassigning employee
        formData.append("assignedEmployee", "");
        formData.append("assignedDate", "");
        formData.append("expectedReturnDate", "");
        if (fullData?.description) {
          formData.append("description", fullData.description);
        }
      }

      const res = await apiCall({
        id: "updateAssetStatus",
        api: api + apiEndpoints.employee.asset.AssetAddEdit,
        payload: formData,
      });

      if (res?.success) {
        successAlert({
          title: "Status Updated",
          text: `Asset "${asset.assetName}" status changed to ${statusTitle || targetStatus}.`,
        });

        await getAssetListing(selectedFilterStatus);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Handles requested status change from drag-and-drop with all edge cases
  const handleRequestStatusChange = useCallback(
    (asset, targetStatus, statusTitle) => {
      if (!asset || !targetStatus) return;

      // Edge Case 1: Same status drop -> do not trigger network request
      if (asset.assetStatus === targetStatus) {
        successAlert({
          title: "Already in status",
          text: `Asset "${asset.assetName}" is already marked as ${statusTitle || targetStatus}.`,
        });
        return;
      }

      // Edge Case 2: Changing status to ASSIGNED -> popup employee selection modal
      if (targetStatus === "ASSIGNED") {
        setAssignModalState({
          open: true,
          asset,
        });
        return;
      }

      // Edge Case 3: Asset currently ASSIGNED and moving to another status -> prompt confirmation
      if (asset.assetStatus === "ASSIGNED" && asset.assignedEmployee) {
        deleteAlert({
          title: "Unassign Asset?",
          text: `Asset "${asset.assetName}" is currently assigned to ${asset.assignedEmployee}. Changing status to "${statusTitle || targetStatus}" will unassign it. Do you want to proceed?`,
          confirmButtonText: "Yes, Change Status",
          cancelButtonText: "Cancel",
          onClick: async () => {
            await executeStatusUpdate(asset, targetStatus, null, statusTitle);
          },
        });
        return;
      }

      // Edge Case 4: Standard transition
      executeStatusUpdate(asset, targetStatus, null, statusTitle);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [executeStatusUpdate],
  );

  // Professional Drag and Drop Hook
  // Dragging only works from Asset Card/Row -> Status Card
  const {
    draggedItem: draggingAsset,
    isDragging,
    isDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop({
    defaultType: "ASSET_CARD",
    onDrop: (asset, targetStatus, meta) => {
      handleRequestStatusChange(asset, targetStatus, meta?.title);
    },
  });

  const assetSummary = useMemo(() => {
    const getStatusCount = (status) => {
      return AssetListingData.filter(
        (item) => item?.assetStatus?.toLowerCase() === status.toLowerCase(),
      ).length;
    };

    return [
      {
        id: "totalAssets",
        title: "Total Assets",
        value: AssetListingData.length.toLocaleString(),
        icon: <Layers size={19} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true, // Overview counter: not a drop target
      },
      {
        id: "available",
        title: "Available",
        value: getStatusCount("AVAILABLE").toLocaleString(),
        icon: <CheckCircle2 size={19} className="stroke-[2.2]" />,
        type: "green",
        status: "AVAILABLE",
        isDisabled: false, // Drop target
      },
      {
        id: "assigned",
        title: "Assigned",
        value: getStatusCount("ASSIGNED").toLocaleString(),
        icon: <UserCheck size={19} className="stroke-[2.2]" />,
        type: "purple",
        status: "ASSIGNED",
        isDisabled: false, // Drop target
      },
      {
        id: "underRepair",
        title: "Under Repair",
        value: getStatusCount("UNDER_REPAIR").toLocaleString(),
        icon: <Wrench size={19} className="stroke-[2.2]" />,
        type: "orange",
        status: "UNDER_REPAIR",
        isDisabled: false, // Drop target
      },
      {
        id: "lost",
        title: "Lost",
        value: getStatusCount("LOST").toLocaleString(),
        icon: <AlertTriangle size={19} className="stroke-[2.2]" />,
        type: "red",
        status: "LOST",
        isDisabled: false, // Drop target
      },
      {
        id: "disposed",
        title: "Disposed",
        value: getStatusCount("DISPOSED").toLocaleString(),
        icon: <Trash2 size={19} className="stroke-[2.2]" />,
        type: "cyan",
        status: "DISPOSED",
        isDisabled: false, // Drop target
      },
    ];
  }, [AssetListingData]);

  const handleStatusCardClick = (status) => {
    if (!status) {
      // Clicked Total Assets -> clear filter to show all
      setSelectedFilterStatus("");
      getAssetListing("");
      return;
    }
    const nextFilter = selectedFilterStatus === status ? "" : status;
    setSelectedFilterStatus(nextFilter);
    getAssetListing(nextFilter);
  };

  // HpGrid drag handlers for draggable asset cards / rows
  const handleGridCardDragStart = ({ event, row }) => {
    handleDragStart(event, row, { type: "ASSET_CARD" });
  };

  const handleGridCardDragEnd = () => {
    handleDragEnd();
  };

  const getCardClassName = ({ row }) => {
    if (draggingAsset?._id === row._id) {
      return "hp-grid-card--dragging";
    }
    return "";
  };

  const getRowClassName = (row) => {
    if (draggingAsset?._id === row._id) {
      return "hp-grid-row--dragging";
    }
    return "";
  };

  const handleAssignConfirm = async (assignmentData) => {
    if (!assignModalState.asset) return;
    await executeStatusUpdate(
      assignModalState.asset,
      "ASSIGNED",
      assignmentData,
      "Assigned",
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 6 Modern Status Cards */}
      <div className="grid grid-cols-6 gap-2.5 mt-3 mr-2">
        {assetSummary.map((item) => (
          <div key={item.id}>
            <AssetCard
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
                  acceptTypes: ["ASSET_CARD"],
                  meta: item,
                })
              }
              onDragLeave={(e) => handleDragLeave(e, item.status)}
              onDrop={(e) =>
                handleDrop(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: ["ASSET_CARD"],
                  meta: item,
                  onDrop: (asset) =>
                    handleRequestStatusChange(asset, item.status, item.title),
                })
              }
              onClick={() => handleStatusCardClick(item.status)}
            />
          </div>
        ))}
      </div>


      {/* Grid listing */}
      <div className="min-h-0 flex-1">
        <HpGrid
          id="assetListing"
          title="Asset"
          rowData={AssetListingData}
          colDef={assetListingColDef}
          style={{ height: "100%" }}
          onAddClick={handleAdd}
          onDoubleClick={handleDoubleClick}
          onCardClick={handleDoubleClick}
          toggle
          cardTitleField="assetName"
          cardSubtitleField="assetCode"
          cardStatusField="assetStatus"
          cardFields={[
            { field: "categoryName", label: "Category" },
            "assetTag",
            "serialNumber",
            "brand",
            "model",
            "assignedEmployee",
            "companyName",
            "warrantyEndDate",
          ]}
          // Draggable Asset Cards (One-way: Asset Card -> Status Card)
          cardDraggable
          onCardDragStart={handleGridCardDragStart}
          onCardDragEnd={handleGridCardDragEnd}
          getCardClassName={getCardClassName}
          // Draggable Asset Rows
          rowDraggable
          onRowDragStart={handleGridCardDragStart}
          onRowDragEnd={handleGridCardDragEnd}
          rowClassName={getRowClassName}
          panding={
            isPending("deleteAsset") ||
            isPending("getAssetListing") ||
            isPending("updateAssetStatus")
          }
        />
      </div>

      {/* Employee assignment modal for ASSIGNED status */}
      <AssetAssignModal
        open={assignModalState.open}
        asset={assignModalState.asset}
        onClose={() => setAssignModalState({ open: false, asset: null })}
        onAssign={handleAssignConfirm}
        loading={isPending("updateAssetStatus")}
      />
    </div>
  );
};

export default AssetListing;
