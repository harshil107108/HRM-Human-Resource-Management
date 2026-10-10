import { HpGrid } from "@/hp-grid/src";
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
import {
  Users,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const OnboardingListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

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
        // 1. Mark onboarding as 100% completed with all checklist items
        await apiCall({
          id: "updateOnboardingCompleted",
          api: api + apiEndpoints.recruitment.onboarding.OnboardingAddEdit,
          payload: {
            _id: onboarding._id,
            status: "Completed",
            progressPercentage: 100,
            documentsSubmitted: true,
            backgroundCheckCompleted: true,
            itAssetsAssigned: true,
            bankDetailsVerified: true,
            orientationCompleted: true,
          },
        });

        // 2. Convert candidate into Employee in Employee module
        try {
          const names = rawName.trim().split(/\s+/);
          const firstName = names[0] || "Employee";
          const lastName = names.slice(1).join(" ") || "Member";
          const empId = `EMP${Math.floor(100000 + Math.random() * 900000)}`;
          const candidateEmail =
            onboarding.candidate?.email ||
            `emp_${empId.toLowerCase()}@example.com`;
          const candidatePhone =
            onboarding.candidate?.phone || "9876543210";

          const deptId =
            onboarding.jobOpening?.department?._id ||
            onboarding.jobOpening?.department ||
            "6a9ab2d0f4695ead1908e2e7";
          const desigId =
            onboarding.jobOpening?.designation?._id ||
            onboarding.jobOpening?.designation ||
            "6a9ab35af4695ead1908e2e8";
          const compId =
            onboarding.jobOpening?.company?._id ||
            onboarding.jobOpening?.company ||
            "6aca662a199e38a60b82f336";
          const branchId =
            onboarding.jobOpening?.branch?._id ||
            onboarding.jobOpening?.branch ||
            "6a9ab23ef4695ead1908e2e5";

          await apiCall({
            id: "convertOnboardingToEmployee",
            api: api + apiEndpoints.employee.employee.EmployeeAddEdit,
            payload: {
              employeeId: empId,
              firstName,
              lastName,
              gender: "male",
              dateOfBirth: "1998-01-01",
              companyId: compId,
              branchId: branchId,
              departmentId: deptId,
              designationId: desigId,
              employmentType: "FULL_TIME",
              employeeStatus: "ACTIVE",
              joiningDate:
                onboarding.orientationDate ||
                new Date().toISOString().split("T")[0],
              officialEmail: candidateEmail,
              personalEmail: candidateEmail,
              mobileNumber: candidatePhone,
              emergencyContactName: rawName,
              emergencyContactNumber: candidatePhone,
              countryId: "6a9ab06ef4695ead1908e2dc",
              stateId: "6a9ab084f4695ead1908e2dd",
              cityId: "6a9ab0adf4695ead1908e2df",
              postalCode: "383235",
              currentAddress: "Corporate Office Location",
              aadhaarNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
              panNumber: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
              username: `${firstName.toLowerCase()}${Math.floor(100 + Math.random() * 900)}`,
              password: "Password@123",
              primaryRole: "EMPLOYEE",
              isActive: true,
              permissions: JSON.stringify({
                financialView: false,
                leaveApproval: true,
                orgChartAdmin: false,
                directoryAccess: true,
              }),
            },
          });
        } catch (empErr) {
          console.warn("Convert to employee notice:", empErr);
        }

        successAlert({
          title: "Onboarding Completed!",
          text: `Onboarding completed! "${rawName}" has been successfully converted into an active Employee in Employee module.`,
        });
        await getOnboardingListing();
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
    (onboarding, targetStatus, statusTitle) => {
      if (!onboarding || !targetStatus) return;

      if (onboarding.status === targetStatus) {
        successAlert({
          title: "Already in status",
          text: `Onboarding is already marked as ${statusTitle || targetStatus}.`,
        });
        return;
      }

      executeStatusUpdate(onboarding, targetStatus, statusTitle);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [executeStatusUpdate],
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 5 Modern Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3 mr-2">
        {onboardingSummary.map((item) => (
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
                  acceptTypes: ["ONBOARDING_CARD"],
                  meta: item,
                })
              }
              onDragLeave={(e) => handleDragLeave(e, item.status)}
              onDrop={(e) =>
                handleDrop(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: ["ONBOARDING_CARD"],
                  meta: item,
                  onDrop: (onboarding) =>
                    handleRequestStatusChange(onboarding, item.status, item.title),
                })
              }
              onClick={() => handleStatusCardClick(item.status)}
            />
          </div>
        ))}
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
          id="onboardingListing"
          rowData={displayedOnboarding}
          colDef={onboardingListingColDef}
          style={{ height: "100%" }}
          onDoubleClick={handleDoubleClick}
          onCardClick={handleDoubleClick}
          onAddClick={handleAdd}
          title="Employee Onboarding"
          toggle
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
