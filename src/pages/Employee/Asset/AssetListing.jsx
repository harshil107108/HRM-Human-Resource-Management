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

const AssetListing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { deleteAlert, successAlert } = useAlert();
  const { apiCall, isPending } = useApiCall();

  const [AssetListingData, setAssetListingData] = useState([]);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState("");

  // Drag and drop states
  const [draggingStatus, setDraggingStatus] = useState(null); // { status, title }
  const [draggingAsset, setDraggingAsset] = useState(null); // asset object
  const [activeDropTargetAssetId, setActiveDropTargetAssetId] = useState(null);
  const [activeDropTargetStatus, setActiveDropTargetStatus] = useState(null);

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
          api: api + apiEndpoints.employee.asset.AssetDeleteByID,
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDraggingStatus(null);
        setDraggingAsset(null);
        setActiveDropTargetAssetId(null);
        setActiveDropTargetStatus(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        icon: "▣",
        type: "blue",
        status: "",
        isDraggable: false,
        isDisabled: true, // disabled per user requirement: cannot be dragged or dropped on
      },
      {
        id: "available",
        title: "Available",
        value: getStatusCount("AVAILABLE").toLocaleString(),
        icon: "✓",
        type: "green",
        status: "AVAILABLE",
        isDraggable: true,
        isDisabled: false,
      },
      {
        id: "assigned",
        title: "Assigned",
        value: getStatusCount("ASSIGNED").toLocaleString(),
        icon: "♙",
        type: "purple",
        status: "ASSIGNED",
        isDraggable: true,
        isDisabled: false,
      },
      {
        id: "underRepair",
        title: "Under Repair",
        value: getStatusCount("UNDER_REPAIR").toLocaleString(),
        icon: "🔧",
        type: "orange",
        status: "UNDER_REPAIR",
        isDraggable: true,
        isDisabled: false,
      },
      {
        id: "lost",
        title: "Lost",
        value: getStatusCount("LOST").toLocaleString(),
        icon: "!",
        type: "red",
        status: "LOST",
        isDraggable: true,
        isDisabled: false,
      },
      {
        id: "disposed",
        title: "Disposed",
        value: getStatusCount("DISPOSED").toLocaleString(),
        icon: "✓",
        type: "cyan",
        status: "DISPOSED",
        isDraggable: true,
        isDisabled: false,
      },
    ];
  }, [AssetListingData]);

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

  const handleRequestStatusChange = (asset, targetStatus, statusTitle) => {
    if (!asset || !targetStatus) return;

    if (asset.assetStatus === targetStatus) {
      successAlert({
        title: "Already in status",
        text: `Asset "${asset.assetName}" is already marked as ${statusTitle || targetStatus}.`,
      });
      return;
    }

    if (targetStatus === "ASSIGNED") {
      setAssignModalState({
        open: true,
        asset,
      });
      return;
    }

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

    executeStatusUpdate(asset, targetStatus, null, statusTitle);
  };

  const handleStatusCardClick = (status) => {
    const nextFilter = selectedFilterStatus === status ? "" : status;
    setSelectedFilterStatus(nextFilter);
    getAssetListing(nextFilter);
  };

  // Status Cards Drag Handlers
  const handleStatusDragStart = (e, item) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "STATUS_CARD",
        status: item.status,
        title: item.title,
      }),
    );
    setDraggingStatus(item);
  };

  const handleStatusDragEnd = () => {
    setDraggingStatus(null);
    setActiveDropTargetAssetId(null);
  };

  const handleStatusDragOver = (e, item) => {
    if (item.isDisabled) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    if (draggingAsset) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setActiveDropTargetStatus(item.status);
    }
  };

  const handleStatusDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setActiveDropTargetStatus(null);
    }
  };

  const handleStatusDrop = (e, item) => {
    if (item.isDisabled) return;
    e.preventDefault();
    setActiveDropTargetStatus(null);

    let droppedAsset = draggingAsset;
    if (!droppedAsset) {
      try {
        const raw = e.dataTransfer.getData("application/json");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.type === "ASSET_CARD") droppedAsset = parsed.asset;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (droppedAsset) {
      handleRequestStatusChange(droppedAsset, item.status, item.title);
    }
  };

  const handleGridCardDragStart = ({ event, row }) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "ASSET_CARD",
        asset: row,
      }),
    );
    setDraggingAsset(row);
  };

  const handleGridCardDragEnd = () => {
    setDraggingAsset(null);
    setActiveDropTargetStatus(null);
  };

  const handleGridCardDragOver = ({ event, row }) => {
    if (draggingStatus) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (activeDropTargetAssetId !== row._id) {
        setActiveDropTargetAssetId(row._id);
      }
    }
  };

  const handleGridCardDragLeave = ({ row }) => {
    if (activeDropTargetAssetId === row._id) {
      setActiveDropTargetAssetId(null);
    }
  };

  const handleGridCardDrop = ({ event, row }) => {
    event.preventDefault();
    setActiveDropTargetAssetId(null);

    let statusInfo = draggingStatus;
    if (!statusInfo) {
      try {
        const raw = event.dataTransfer.getData("application/json");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.type === "STATUS_CARD") statusInfo = parsed;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (statusInfo) {
      handleRequestStatusChange(row, statusInfo.status, statusInfo.title);
    }
  };

  const getCardClassName = ({ row }) => {
    if (activeDropTargetAssetId === row._id) {
      return "hp-grid-card--drop-target";
    }
    if (draggingAsset?._id === row._id) {
      return "hp-grid-card--dragging";
    }
    return "";
  };

  const getRowClassName = (row) => {
    if (activeDropTargetAssetId === row._id) {
      return "hp-grid-row--drop-target";
    }
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
      {/* 6 Status Cards */}
      <div className="grid grid-cols-6 gap-2.5 mt-3 mr-2">
        {assetSummary.map((item) => (
          <div key={item.id}>
            <AssetCard
              {...item}
              isSelectedFilter={selectedFilterStatus === item.status}
              isDragging={draggingStatus?.status === item.status}
              isDropTarget={activeDropTargetStatus === item.status}
              onDragStart={(e) => handleStatusDragStart(e, item)}
              onDragEnd={handleStatusDragEnd}
              onDragOver={(e) => handleStatusDragOver(e, item)}
              onDragLeave={handleStatusDragLeave}
              onDrop={(e) => handleStatusDrop(e, item)}
              onClick={() => handleStatusCardClick(item.status)}
            />
          </div>
        ))}
      </div>

      {/* Visual drag hints */}
      {draggingStatus && (
        <div className="mr-2 flex items-center justify-between rounded-md border border-blue-200 bg-blue-50/90 px-3 py-1.5 text-xs text-blue-800 shadow-2xs">
          <span className="font-semibold">
            🎯 Dragging "{draggingStatus.title}": Drop onto any asset card or
            table row below to update its status.
          </span>
          <span className="text-[11px] font-medium text-blue-600">
            Press ESC to cancel
          </span>
        </div>
      )}

      {draggingAsset && (
        <div className="mr-2 flex items-center justify-between rounded-md border border-purple-200 bg-purple-50/90 px-3 py-1.5 text-xs text-purple-800 shadow-2xs">
          <span className="font-semibold">
            🎯 Dragging "{draggingAsset.assetName}": Drop onto any of the 5
            status cards above to update its status.
          </span>
          <span className="text-[11px] font-medium text-purple-600">
            Press ESC to cancel
          </span>
        </div>
      )}

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
          cardDraggable
          onCardDragStart={handleGridCardDragStart}
          onCardDragEnd={handleGridCardDragEnd}
          onCardDragOver={handleGridCardDragOver}
          onCardDragLeave={handleGridCardDragLeave}
          onCardDrop={handleGridCardDrop}
          getCardClassName={getCardClassName}
          rowDraggable
          onRowDragStart={handleGridCardDragStart}
          onRowDragEnd={handleGridCardDragEnd}
          onRowDragOver={handleGridCardDragOver}
          onRowDragLeave={handleGridCardDragLeave}
          onRowDrop={handleGridCardDrop}
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
