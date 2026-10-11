import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState, useMemo, useCallback } from "react";
import useInterviewConfig from "./useInterviewConfig";
import useModal from "@/hooks/useModal";
import InterviewModal from "./InterviewModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";
import StatusCard from "@/components/common/StatusCard";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import { confirmStatusChange } from "@/utils/confirmStatusChange";
import {
  Calendar,
  Code,
  Terminal,
  Briefcase,
  Award,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const InterviewListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const [interviewListingData, setInterviewListingData] = useState([]);
  const [selectedFilterRound, setSelectedFilterRound] = useState("");

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Interview?",
      text: "Are you sure you want to delete this interview schedule? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteInterview",
          api: api + apiEndpoints.recruitment.interview.InterviewDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Interview Deleted",
            text: "Interview has been deleted successfully.",
          });
          getInterviewListing();
        }
      },
    });
  };

  const { interviewListingColDef } = useInterviewConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

  const getInterviewListing = useCallback(async () => {
    const res = await apiCall({
      id: "getInterviewListing",
      api: api + apiEndpoints.recruitment.interview.InterviewGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        candidateName: item.candidate?.candidateName || "N/A",
        candidateEmail: item.candidate?.email || "",
        candidatePhone: item.candidate?.phone || "",
        jobTitle: item.jobOpening?.jobTitle || "N/A",
        cardStatus:
          item.recommendation === "Hire" ||
          item.recommendation === "Strong Hire" ||
          item.candidate?.stage === "Offered" ||
          item.candidate?.stage === "Hired"
            ? "Hired"
            : item.recommendation === "Reject" ||
                item.candidate?.stage === "Rejected"
              ? "Rejected"
              : item.roundName,
        interviewerName: item.interviewer
          ? `${item.interviewer.firstName || ""} ${item.interviewer.lastName || ""}`
          : "N/A",
        scheduledDate: formatDateForInput(item.scheduledDate),
      }));
      setInterviewListingData(formatted);
    }
  }, [apiCall]);

  useEffect(() => {
    getInterviewListing();
  }, [getInterviewListing]);

  // Helper checkers for interview decisions
  const isInterviewHired = useCallback((item) => {
    return (
      item?.recommendation === "Hire" ||
      item?.recommendation === "Strong Hire" ||
      item?.candidate?.stage === "Offered" ||
      item?.candidate?.stage === "Hired"
    );
  }, []);

  const isInterviewRejected = useCallback((item) => {
    return (
      item?.recommendation === "Reject" ||
      item?.candidate?.stage === "Rejected"
    );
  }, []);

  // Execute round or hire/reject update when dragging and dropping interview
  const executeRoundUpdate = async (interview, targetRound, roundTitle) => {
    try {
      if (targetRound === "Hired") {
        // Mark interview as completed and recommended for Hire (backend automatically updates candidate stage and creates offer letter)
        const res = await apiCall({
          id: "updateInterviewHired",
          api: api + apiEndpoints.recruitment.interview.InterviewAddEdit,
          payload: {
            _id: interview._id,
            status: "Completed",
            recommendation: "Hire",
          },
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to mark candidate as hired");
        }

        successAlert({
          title: "Candidate Hired!",
          text: `Candidate "${interview.candidateName}" has been hired. Profile moved to Offer Letter module.`,
        });
        await getInterviewListing();
        return;
      }

      if (targetRound === "Rejected") {
        // Mark interview as completed with Reject (backend automatically updates candidate stage)
        const res = await apiCall({
          id: "updateInterviewRejected",
          api: api + apiEndpoints.recruitment.interview.InterviewAddEdit,
          payload: {
            _id: interview._id,
            status: "Completed",
            recommendation: "Reject",
          },
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to reject candidate");
        }

        successAlert({
          title: "Candidate Rejected",
          text: `Candidate "${interview.candidateName}" marked as Rejected.`,
        });
        await getInterviewListing();
        return;
      }

      // Standard round transition
      const res = await apiCall({
        id: "updateInterviewRound",
        api: api + apiEndpoints.recruitment.interview.InterviewAddEdit,
        payload: {
          _id: interview._id,
          roundName: targetRound,
        },
      });

      if (res?.success) {
        successAlert({
          title: "Round Updated",
          text: `Interview for "${interview.candidateName}" moved to ${roundTitle || targetRound}.`,
        });
        await getInterviewListing();
      }
    } catch (err) {
      console.error("Failed to update interview round:", err);
    }
  };

  const handleRequestRoundChange = useCallback(
    async (interview, targetRound, roundTitle) => {
      if (!interview || !targetRound) return;

      if (targetRound === "Hired" && isInterviewHired(interview)) {
        successAlert({
          title: "Already Hired",
          text: `Candidate "${interview.candidateName}" is already marked as Hired.`,
        });
        return;
      }

      if (targetRound === "Rejected" && isInterviewRejected(interview)) {
        successAlert({
          title: "Already Rejected",
          text: `Candidate "${interview.candidateName}" is already marked as Rejected.`,
        });
        return;
      }

      if (
        interview.roundName === targetRound &&
        targetRound !== "Hired" &&
        targetRound !== "Rejected"
      ) {
        successAlert({
          title: "Already in round",
          text: `Interview is already in ${roundTitle || targetRound}.`,
        });
        return;
      }

      const currentRound = isInterviewHired(interview)
        ? "Hired"
        : isInterviewRejected(interview)
          ? "Rejected"
          : interview.roundName;
      const confirmed = await confirmStatusChange({
        fieldName: "Interview Stage",
        currentValue: currentRound,
        nextValue: targetRound,
        currentLabel: currentRound,
        nextLabel: roundTitle || targetRound,
      });
      if (!confirmed) return;

      executeRoundUpdate(interview, targetRound, roundTitle);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [executeRoundUpdate, isInterviewHired, isInterviewRejected],
  );

  // Drag and Drop Hook
  const {
    draggedItem: draggingInterview,
    isDragging,
    isDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop({
    defaultType: "INTERVIEW_CARD",
    onDrop: (interview, targetRound, meta) => {
      handleRequestRoundChange(interview, targetRound, meta?.title);
    },
  });

  // Summary Metrics based on Interview Rounds (Screening removed, Hired & Rejected added at the end)
  const interviewSummary = useMemo(() => {
    const getRoundCount = (round) => {
      return interviewListingData.filter(
        (item) =>
          item?.roundName?.toLowerCase() === round.toLowerCase() &&
          !isInterviewHired(item) &&
          !isInterviewRejected(item),
      ).length;
    };

    return [
      {
        id: "totalInterviews",
        title: "Total Interviews",
        value: interviewListingData.length.toLocaleString(),
        icon: <Calendar size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true,
      },
      {
        id: "techRound1",
        title: "Technical Round 1",
        value: getRoundCount("Technical Round 1").toLocaleString(),
        icon: <Code size={18} className="stroke-[2.2]" />,
        type: "purple",
        status: "Technical Round 1",
        isDisabled: false,
      },
      {
        id: "techRound2",
        title: "Technical Round 2",
        value: getRoundCount("Technical Round 2").toLocaleString(),
        icon: <Terminal size={18} className="stroke-[2.2]" />,
        type: "orange",
        status: "Technical Round 2",
        isDisabled: false,
      },
      {
        id: "managerialRound",
        title: "Managerial Round",
        value: getRoundCount("Managerial Round").toLocaleString(),
        icon: <Briefcase size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "Managerial Round",
        isDisabled: false,
      },
      {
        id: "hrRound",
        title: "HR Round",
        value: getRoundCount("HR Round").toLocaleString(),
        icon: <Award size={18} className="stroke-[2.2]" />,
        type: "cyan",
        status: "HR Round",
        isDisabled: false,
      },
      {
        id: "finalDiscussion",
        title: "Final Round",
        value: getRoundCount("Final Discussion").toLocaleString(),
        icon: <CheckCircle2 size={18} className="stroke-[2.2]" />,
        type: "purple",
        status: "Final Discussion",
        isDisabled: false,
      },
      {
        id: "hired",
        title: "Hired",
        value: interviewListingData.filter(isInterviewHired).length.toLocaleString(),
        icon: <CheckCircle2 size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "Hired",
        isDisabled: false,
      },
      {
        id: "rejected",
        title: "Rejected",
        value: interviewListingData.filter(isInterviewRejected).length.toLocaleString(),
        icon: <XCircle size={18} className="stroke-[2.2]" />,
        type: "red",
        status: "Rejected",
        isDisabled: false,
      },
    ];
  }, [interviewListingData, isInterviewHired, isInterviewRejected]);

  const handleStatusCardClick = (status) => {
    if (!status) {
      setSelectedFilterRound("");
      return;
    }
    setSelectedFilterRound((prev) => (prev === status ? "" : status));
  };

  const displayedInterviews = useMemo(() => {
    if (!selectedFilterRound) return interviewListingData;
    if (selectedFilterRound === "Hired") {
      return interviewListingData.filter(isInterviewHired);
    }
    if (selectedFilterRound === "Rejected") {
      return interviewListingData.filter(isInterviewRejected);
    }
    return interviewListingData.filter(
      (item) => item.roundName?.toLowerCase() === selectedFilterRound.toLowerCase(),
    );
  }, [interviewListingData, selectedFilterRound, isInterviewHired, isInterviewRejected]);

  // Grid Drag Handlers
  const handleGridCardDragStart = ({ event, row }) => {
    handleDragStart(event, row, { type: "INTERVIEW_CARD" });
  };

  const handleGridCardDragEnd = () => {
    handleDragEnd();
  };

  const getCardClassName = ({ row }) => {
    if (draggingInterview?._id === row._id) {
      return "hp-grid-card--dragging";
    }
    return "";
  };

  const getRowClassName = (row) => {
    if (draggingInterview?._id === row._id) {
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

  useDocumentTitle("orvexa | Interview Scheduler");

  // Right-click menu: Edit, status changes and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
    statusCards: interviewSummary,
    statusField: "roundName",
    onStatusChange: handleRequestRoundChange,
    statusLabel: "Move to",
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 8 Round Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-3 mr-2">
        {interviewSummary.map((item) => (
          <div key={item.id}>
            <StatusCard
              {...item}
              isSelectedFilter={
                item.status
                  ? selectedFilterRound === item.status
                  : selectedFilterRound === ""
              }
              isDraggingAny={isDragging}
              isDropTarget={isDropTarget(item.status)}
              onDragOver={(e) =>
                handleDragOver(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: ["INTERVIEW_CARD"],
                  meta: item,
                })
              }
              onDragLeave={(e) => handleDragLeave(e, item.status)}
              onDrop={(e) =>
                handleDrop(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: ["INTERVIEW_CARD"],
                  meta: item,
                  onDrop: (interview) =>
                    handleRequestRoundChange(interview, item.status, item.title),
                })
              }
              onClick={() => handleStatusCardClick(item.status)}
            />
          </div>
        ))}
      </div>

      {isModalOpen && (
        <InterviewModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getInterviewListing}
          extraParams={extraParams}
        />
      )}

      {/* Grid listing with both List and Cards view */}
      <div className="min-h-0 flex-1">
        <HpGrid
          contextData={contextData}
          id="interviewListing"
          rowData={displayedInterviews}
          colDef={interviewListingColDef}
          style={{ height: "100%" }}
          onDoubleClick={handleDoubleClick}
          onCardClick={handleDoubleClick}
          onAddClick={handleAdd}
          title="Interviews"
          toggle
          defaultView="card"
          cardTitleField="candidateName"
          cardSubtitleField="jobTitle"
          cardStatusField="cardStatus"
          cardFields={[
            "interviewerName",
            "scheduledDate",
            "status",
            "recommendation",
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
            isPending("deleteInterview") ||
            isPending("getInterviewListing") ||
            isPending("updateInterviewRound")
          }
        />
      </div>
    </div>
  );
};

export default InterviewListing;
