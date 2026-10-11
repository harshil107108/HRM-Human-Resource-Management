import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useNavigate } from "react-router-dom";
import useJobOpeningConfig from "./useJobOpeningConfig";
import { api, apiEndpoints } from "@/api/api";
import { useState, useEffect, useMemo, useCallback } from "react";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";
import StatusCard from "@/components/common/StatusCard";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import {
  Briefcase,
  CheckCircle2,
  FileEdit,
  Clock,
  Users,
  XCircle,
} from "lucide-react";

const JobOpeningListing = () => {
  const { deleteAlert, successAlert } = useAlert();
  const { apiCall, isPending } = useApiCall();
  const navigate = useNavigate();

  const [jobListingData, setJobListingData] = useState([]);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState("");

  const handleDelete = async (id) => {
    deleteAlert({
      title: "Delete Job Opening?",
      text: "Are you sure you want to delete this job opening? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteJobOpening",
          api: api + apiEndpoints.recruitment.jobOpening.JobOpeningDeleteByID,
          payload: {
            _id: id,
          },
        });

        if (res.success) {
          successAlert({
            title: "Job opening deleted",
            text: "Job opening has been deleted successfully.",
          });

          getJobListing();
        }
      },
    });
  };

  const { jobOpeningListingColDef } = useJobOpeningConfig({
    handleDelete,
  });

  const handleDoubleClick = (params) => {
    const { data } = params;

    navigate(`${location.pathname}/addedit`, {
      state: {
        jobOpeningId: data?._id,
      },
    });
  };

  const handleAdd = () => {
    navigate(`${location.pathname}/addedit`, {
      state: {
        jobOpeningId: null,
      },
    });
  };

  const getJobListing = useCallback(async () => {
    const res = await apiCall({
      id: "getJobListing",
      api: api + apiEndpoints.recruitment.jobOpening.JobOpeningGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res?.data?.data || [];
      const finalData = data.map((item) => ({
        ...item,
        departmentname: item?.department?.departmentname,
        designationname: item?.designation?.designationname,
        companyName: item?.company?.companyName,
        branchname: item?.branch?.branchname,
        publishDate: formatDateForInput(item?.publishDate),
      }));

      setJobListingData(finalData);
    }
  }, [apiCall]);

  useEffect(() => {
    getJobListing();
  }, [getJobListing]);

  // Execute status update (e.g. from drag & drop)
  const executeStatusUpdate = async (job, targetStatus, statusTitle) => {
    try {
      const res = await apiCall({
        id: "updateJobStatus",
        api: api + apiEndpoints.recruitment.jobOpening.JobOpeningAddEdit,
        payload: {
          _id: job._id,
          jobStatus: targetStatus,
        },
      });

      if (res?.success) {
        successAlert({
          title: "Status Updated",
          text: `Job Opening "${job.jobTitle}" moved to ${statusTitle || targetStatus}.`,
        });
        await getJobListing();
      }
    } catch (err) {
      console.error("Failed to update job status:", err);
    }
  };

  const handleRequestStatusChange = useCallback(
    (job, targetStatus, statusTitle) => {
      if (!job || !targetStatus) return;

      if (job.jobStatus?.toUpperCase() === targetStatus.toUpperCase()) {
        successAlert({
          title: "Already in status",
          text: `Job Opening is already marked as ${statusTitle || targetStatus}.`,
        });
        return;
      }

      executeStatusUpdate(job, targetStatus, statusTitle);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [executeStatusUpdate],
  );

  // Drag and Drop Hook
  const {
    draggedItem: draggingJob,
    isDragging,
    isDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop({
    defaultType: "JOB_OPENING_CARD",
    onDrop: (job, targetStatus, meta) => {
      handleRequestStatusChange(job, targetStatus, meta?.title);
    },
  });

  // Summary Metrics based on Job Statuses
  const jobSummary = useMemo(() => {
    const getStatusCount = (status) => {
      return jobListingData.filter(
        (item) => item?.jobStatus?.toUpperCase() === status.toUpperCase(),
      ).length;
    };

    return [
      {
        id: "totalJobs",
        title: "Total Openings",
        value: jobListingData.length.toLocaleString(),
        icon: <Briefcase size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true,
      },
      {
        id: "active",
        title: "Active",
        value: getStatusCount("ACTIVE").toLocaleString(),
        icon: <CheckCircle2 size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "ACTIVE",
        isDisabled: false,
      },
      {
        id: "draft",
        title: "Draft",
        value: getStatusCount("DRAFT").toLocaleString(),
        icon: <FileEdit size={18} className="stroke-[2.2]" />,
        type: "cyan",
        status: "DRAFT",
        isDisabled: false,
      },
      {
        id: "onHold",
        title: "On Hold",
        value: getStatusCount("ON_HOLD").toLocaleString(),
        icon: <Clock size={18} className="stroke-[2.2]" />,
        type: "orange",
        status: "ON_HOLD",
        isDisabled: false,
      },
      {
        id: "filled",
        title: "Filled",
        value: getStatusCount("FILLED").toLocaleString(),
        icon: <Users size={18} className="stroke-[2.2]" />,
        type: "purple",
        status: "FILLED",
        isDisabled: false,
      },
      {
        id: "closed",
        title: "Closed",
        value: getStatusCount("CLOSED").toLocaleString(),
        icon: <XCircle size={18} className="stroke-[2.2]" />,
        type: "red",
        status: "CLOSED",
        isDisabled: false,
      },
    ];
  }, [jobListingData]);

  const handleStatusCardClick = (status) => {
    if (!status) {
      setSelectedFilterStatus("");
      return;
    }
    setSelectedFilterStatus((prev) => (prev === status ? "" : status));
  };

  const displayedJobs = useMemo(() => {
    if (!selectedFilterStatus) return jobListingData;
    return jobListingData.filter(
      (item) => item.jobStatus?.toUpperCase() === selectedFilterStatus.toUpperCase(),
    );
  }, [jobListingData, selectedFilterStatus]);

  // Grid Drag Handlers
  const handleGridCardDragStart = ({ event, row }) => {
    handleDragStart(event, row, { type: "JOB_OPENING_CARD" });
  };

  const handleGridCardDragEnd = () => {
    handleDragEnd();
  };

  const getCardClassName = ({ row }) => {
    if (draggingJob?._id === row._id) {
      return "hp-grid-card--dragging";
    }
    return "";
  };

  const getRowClassName = (row) => {
    if (draggingJob?._id === row._id) {
      return "hp-grid-row--dragging";
    }
    return "";
  };

  useDocumentTitle("orvexa | Job Openings");

  // Right-click menu: Edit, status changes and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
    statusCards: jobSummary,
    statusField: "jobStatus",
    onStatusChange: handleRequestStatusChange,
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 6 Modern Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3 mr-2">
        {jobSummary.map((item) => (
          <div key={item.id}>
            <StatusCard
              {...item}
              isSelectedFilter={
                item.status
                  ? selectedFilterStatus.toUpperCase() === item.status.toUpperCase()
                  : selectedFilterStatus === ""
              }
              isDraggingAny={isDragging}
              isDropTarget={isDropTarget(item.status)}
              onDragOver={(e) =>
                handleDragOver(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: ["JOB_OPENING_CARD"],
                  meta: item,
                })
              }
              onDragLeave={(e) => handleDragLeave(e, item.status)}
              onDrop={(e) =>
                handleDrop(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: ["JOB_OPENING_CARD"],
                  meta: item,
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
          contextData={contextData}
          id="jobListing"
          rowData={displayedJobs}
          colDef={jobOpeningListingColDef}
          style={{ height: "100%" }}
          onDoubleClick={handleDoubleClick}
          onCardClick={handleDoubleClick}
          onAddClick={handleAdd}
          title="Job Openings"
          toggle
          defaultView="card"
          cardTitleField="jobTitle"
          cardSubtitleField="jobOpeningId"
          cardStatusField="jobStatus"
          cardFields={[
            "companyName",
            "departmentname",
            "designationname",
            "numberOfPositions",
            "employmentType",
            "hiringManagerName",
            "publishDate",
          ]}
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
            isPending("deleteJobOpening") ||
            isPending("getJobListing") ||
            isPending("updateJobStatus")
          }
        />
      </div>
    </div>
  );
};

export default JobOpeningListing;
