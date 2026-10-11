import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState, useMemo, useCallback } from "react";
import useOnboardingConfig from "./useOnboardingConfig";
import useModal from "@/hooks/useModal";
import OnboardingModal from "./OnboardingModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";
import StatusCard from "@/components/common/StatusCard";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import { confirmStatusChange } from "@/utils/confirmStatusChange";
import {
  Users,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const OnboardingListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert, warningAlert } = useAlert();

  const [onboardingListingData, setOnboardingListingData] = useState([]);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState("");

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Onboarding?",
      text: "Are you sure you want to delete this onboarding record? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteOnboarding",
          api: api + apiEndpoints.recruitment.onboarding.OnboardingDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Record Deleted",
            text: "Onboarding record has been deleted successfully.",
          });
          getOnboardingListing();
        }
      },
    });
  };

  const { onboardingListingColDef } = useOnboardingConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

  const getOnboardingListing = useCallback(async () => {
    const res = await apiCall({
      id: "getOnboardingListing",
      api: api + apiEndpoints.recruitment.onboarding.OnboardingGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        candidateName: item.candidate?.candidateName || "N/A",
        jobTitle: item.jobOpening?.jobTitle || "N/A",
        buddyName: item.buddyEmployee
          ? `${item.buddyEmployee.firstName || ""} ${item.buddyEmployee.lastName || ""}`
          : "Not Assigned",
        orientationDate: formatDateForInput(item.orientationDate),
      }));
      setOnboardingListingData(formatted);
    }
  }, [apiCall]);

  useEffect(() => {
    getOnboardingListing();
  }, [getOnboardingListing]);

  // Execute status update with automatic conversion to Employee when Completed
  const executeStatusUpdate = async (onboarding, targetStatus, statusTitle) => {
    try {
      const rawName =
        onboarding.candidate?.candidateName ||
        onboarding.candidateName ||
        "New Employee";

      if (targetStatus === "Completed") {
        if ((onboarding.progressPercentage || 0) < 100) {
          warningAlert({
            title: "100% Progress Required",
            text: `"${rawName}" has only reached ${onboarding.progressPercentage || 0}% progress. All onboarding data and checklist verifications must reach 100% before dropping to Complete.`,
          });
          return;
        }

        const res = await apiCall({
          id: "completeOnboarding",
          api: api + apiEndpoints.recruitment.onboarding.OnboardingAddEdit,
          payload: {
            _id: onboarding._id,
            status: "Completed",
          },
        });

        if (res?.success) {
          successAlert({
            title: "Onboarding Completed!",
            text: `"${rawName}" has been successfully converted into an active Employee in the Employee Directory, and candidate records have been removed from all recruitment modules.`,
          });
          await getOnboardingListing();
        }
        return;
      }

      const res = await apiCall({
        id: "updateOnboardingStatus",
        api: api + apiEndpoints.recruitment.onboarding.OnboardingAddEdit,
        payload: {
          _id: onboarding._id,
          status: targetStatus,
        },
      });

      if (res?.success) {
        successAlert({
          title: "Status Updated",
          text: `Onboarding for "${rawName}" changed to ${statusTitle || targetStatus}.`,
        });
        await getOnboardingListing();
      }
    } catch (err) {
      console.error("Failed to update onboarding status:", err);
    }
  };

  const handleRequestStatusChange = useCallback(
    async (onboarding, targetStatus, statusTitle) => {
      if (!onboarding || !targetStatus) return;

      const rawName =
        onboarding.candidate?.candidateName ||
        onboarding.candidateName ||
        "New Employee";

      if (onboarding.status === targetStatus) {
        successAlert({
          title: "Already in status",
          text: `Onboarding is already marked as ${statusTitle || targetStatus}.`,
        });
        return;
      }

      // Requirement: Onboarding must reach 100% progress before dropping or setting to Completed
      if (targetStatus === "Completed" && (onboarding.progressPercentage || 0) < 100) {
        warningAlert({
          title: "100% Progress Required",
          text: `"${rawName}" is currently at ${onboarding.progressPercentage || 0}% progress. Please fill all required data and complete all verification checklists (100%) before marking as Completed.`,
        });
        return;
      }

      const confirmed = await confirmStatusChange({
        fieldName: "Onboarding Status",
        currentValue: onboarding.status,
        nextValue: targetStatus,
        currentLabel: onboarding.status,
        nextLabel: statusTitle || targetStatus,
      });
      if (!confirmed) return;

      executeStatusUpdate(onboarding, targetStatus, statusTitle);
    },
    [executeStatusUpdate, successAlert, warningAlert],
  );

  // Drag and Drop Hook
  const {
    draggedItem: draggingOnboarding,
    isDragging,
    isDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop({
    defaultType: "ONBOARDING_CARD",
    onDrop: (onboarding, targetStatus, meta) => {
      handleRequestStatusChange(onboarding, targetStatus, meta?.title);
    },
  });

  // Summary Metrics
  const onboardingSummary = useMemo(() => {
    const getStatusCount = (status) => {
      return onboardingListingData.filter(
        (item) => item?.status?.toLowerCase() === status.toLowerCase(),
      ).length;
    };

    return [
      {
        id: "totalOnboarding",
        title: "Total Records",
        value: onboardingListingData.length.toLocaleString(),
        icon: <Users size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true,
      },
      {
        id: "pending",
        title: "Pending",
        value: getStatusCount("Pending").toLocaleString(),
        icon: <Clock size={18} className="stroke-[2.2]" />,
        type: "orange",
        status: "Pending",
        isDisabled: false,
      },
      {
        id: "inProgress",
        title: "In Progress",
        value: getStatusCount("In Progress").toLocaleString(),
        icon: <RefreshCw size={18} className="stroke-[2.2]" />,
        type: "purple",
        status: "In Progress",
        isDisabled: false,
      },
      {
        id: "completed",
        title: "Completed",
        value: getStatusCount("Completed").toLocaleString(),
        icon: <CheckCircle2 size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "Completed",
        isDisabled: false,
      },
      {
        id: "cancelled",
        title: "Cancelled",
        value: getStatusCount("Cancelled").toLocaleString(),
        icon: <XCircle size={18} className="stroke-[2.2]" />,
        type: "red",
        status: "Cancelled",
        isDisabled: false,
      },
    ];
  }, [onboardingListingData]);

  const handleStatusCardClick = (status) => {
    if (!status) {
      setSelectedFilterStatus("");
      return;
    }
    setSelectedFilterStatus((prev) => (prev === status ? "" : status));
  };

  const displayedOnboarding = useMemo(() => {
    if (!selectedFilterStatus) return onboardingListingData;
    return onboardingListingData.filter(
      (item) => item.status?.toLowerCase() === selectedFilterStatus.toLowerCase(),
    );
  }, [onboardingListingData, selectedFilterStatus]);

  // Grid Drag Handlers
  const handleGridCardDragStart = ({ event, row }) => {
    handleDragStart(event, row, { type: "ONBOARDING_CARD" });
  };

  const handleGridCardDragEnd = () => {
    handleDragEnd();
  };

  const getCardClassName = ({ row }) => {
    if (draggingOnboarding?._id === row._id) {
      return "hp-grid-card--dragging";
    }
    return "";
  };

  const getRowClassName = (row) => {
    if (draggingOnboarding?._id === row._id) {
      return "hp-grid-row--dragging";
    }
    return "";
  };

  const handleAdd = () => {
    onModalOpen({ mode: "add" });
  };

  const handleDoubleClick = (data) => {
    const id = data?.data?._id;
    if (id) {
      onModalOpen({ mode: "edit", id });
    }
  };

  useDocumentTitle("orvexa | Employee Onboarding");

  // Right-click menu: Edit, status changes and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
    statusCards: onboardingSummary,
    statusField: "status",
    onStatusChange: handleRequestStatusChange,
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 5 Modern Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3 mr-2">
        {onboardingSummary.map((item) => {
          const isDropDisabled =
            item.isDisabled ||
            (isDragging &&
              item.status === "Completed" &&
              (draggingOnboarding?.progressPercentage || 0) < 100);

          return (
            <div key={item.id}>
              <StatusCard
                {...item}
                isSelectedFilter={
                  item.status
                    ? selectedFilterStatus === item.status
                    : selectedFilterStatus === ""
                }
                isDraggingAny={isDragging}
                isDropTarget={!isDropDisabled && isDropTarget(item.status)}
                onDragOver={(e) =>
                  handleDragOver(e, item.status, {
                    disabled: isDropDisabled,
                    acceptTypes: ["ONBOARDING_CARD"],
                    meta: item,
                  })
                }
                onDragLeave={(e) => handleDragLeave(e, item.status)}
                onDrop={(e) =>
                  handleDrop(e, item.status, {
                    disabled: isDropDisabled,
                    acceptTypes: ["ONBOARDING_CARD"],
                    meta: item,
                    onDrop: (onboarding) =>
                      handleRequestStatusChange(onboarding, item.status, item.title),
                  })
                }
                onClick={() => handleStatusCardClick(item.status)}
              />
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <OnboardingModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getOnboardingListing}
          extraParams={extraParams}
        />
      )}

      {/* Grid listing with both List and Cards view */}
      <div className="min-h-0 flex-1">
        <HpGrid
          contextData={contextData}
          id="onboardingListing"
          rowData={displayedOnboarding}
          colDef={onboardingListingColDef}
          style={{ height: "100%" }}
          onDoubleClick={handleDoubleClick}
          onCardClick={handleDoubleClick}
          onAddClick={handleAdd}
          title="Employee Onboarding"
          toggle
          defaultView="card"
          cardTitleField="candidateName"
          cardSubtitleField="jobTitle"
          cardStatusField="status"
          cardFields={["orientationDate", "progressPercentage", "buddyName"]}
          cardDraggable
          onCardDragStart={handleGridCardDragStart}
          onCardDragEnd={handleGridCardDragEnd}
          getCardClassName={getCardClassName}
          rowDraggable
          onRowDragStart={handleGridCardDragStart}
          onRowDragEnd={handleGridCardDragEnd}
          rowClassName={getRowClassName}
          columnFilterable={true}
          panding={
            isPending("deleteOnboarding") ||
            isPending("getOnboardingListing") ||
            isPending("updateOnboardingStatus")
          }
        />
      </div>
    </div>
  );
};

export default OnboardingListing;
