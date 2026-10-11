import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState, useMemo, useCallback } from "react";
import useCandidateConfig from "./useCandidateConfig";
import useModal from "@/hooks/useModal";
import CandidateModal from "./CandidateModal";
import InterviewModal from "../Interviews/InterviewModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import StatusCard from "@/components/common/StatusCard";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import {
  Users,
  UserPlus,
  UserCheck,
  Calendar,
  XCircle,
} from "lucide-react";

const CandidateListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();

  const [candidateListingData, setCandidateListingData] = useState([]);
  const [selectedFilterStage, setSelectedFilterStage] = useState("");

  // Schedule Interview Modal State when moving candidate to "Interview" stage
  const [scheduleModalState, setScheduleModalState] = useState({
    open: false,
    candidate: null,
  });

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Candidate?",
      text: "Are you sure you want to delete this candidate? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteCandidate",
          api: api + apiEndpoints.recruitment.candidate.CandidateDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Candidate Deleted",
            text: "Candidate has been deleted successfully.",
          });
          getCandidateListing();
        }
      },
    });
  };

  const { candidateListingColDef } = useCandidateConfig({ handleDelete });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

  const getCandidateListing = useCallback(async () => {
    const res = await apiCall({
      id: "getCandidateListing",
      api: api + apiEndpoints.recruitment.candidate.CandidateGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => {
        const fullName =
          item.firstName || item.lastName
            ? [item.firstName, item.middleName, item.lastName].filter(Boolean).join(" ")
            : item.candidateName || "Candidate";
        return {
          ...item,
          candidateName: fullName,
          jobTitle: item.jobOpening?.jobTitle || "Unassigned",
        };
      });
      setCandidateListingData(formatted);
    }
  }, [apiCall]);

  useEffect(() => {
    getCandidateListing();
  }, [getCandidateListing]);

  // Execute stage update
  const executeStageUpdate = async (candidate, targetStage, stageTitle) => {
    try {
      const res = await apiCall({
        id: "updateCandidateStage",
        api: api + apiEndpoints.recruitment.candidate.CandidateAddEdit,
        payload: {
          _id: candidate._id,
          stage: targetStage,
        },
      });

      if (res?.success) {
        successAlert({
          title: "Stage Updated",
          text: `Candidate "${candidate.candidateName}" moved to ${stageTitle || targetStage}.`,
        });
        await getCandidateListing();
      }
    } catch (err) {
      console.error("Failed to update candidate stage:", err);
    }
  };

  const handleRequestStageChange = useCallback(
    (candidate, targetStage, stageTitle) => {
      if (!candidate || !targetStage) return;

      if (candidate.stage === targetStage) {
        successAlert({
          title: "Already in stage",
          text: `Candidate "${candidate.candidateName}" is already in ${stageTitle || targetStage}.`,
        });
        return;
      }

      // Linking feature: Moving candidate to "Interview" opens interview scheduling modal
      if (targetStage === "Interview") {
        setScheduleModalState({
          open: true,
          candidate,
        });
        return;
      }

      executeStageUpdate(candidate, targetStage, stageTitle);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [executeStageUpdate],
  );

  // Drag and Drop Hook
  const {
    draggedItem: draggingCandidate,
    isDragging,
    isDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop({
    defaultType: "CANDIDATE_CARD",
    onDrop: (candidate, targetStage, meta) => {
      handleRequestStageChange(candidate, targetStage, meta?.title);
    },
  });

  // Summary Metrics
  const candidateSummary = useMemo(() => {
    const getStageCount = (stage) => {
      return candidateListingData.filter(
        (item) => item?.stage?.toLowerCase() === stage.toLowerCase(),
      ).length;
    };

    return [
      {
        id: "totalCandidates",
        title: "Total Pool",
        value: candidateListingData.length.toLocaleString(),
        icon: <Users size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true,
      },
      {
        id: "applied",
        title: "Applied",
        value: getStageCount("Applied").toLocaleString(),
        icon: <UserPlus size={18} className="stroke-[2.2]" />,
        type: "cyan",
        status: "Applied",
        isDisabled: false,
      },
      {
        id: "screening",
        title: "Screening",
        value: getStageCount("Screening").toLocaleString(),
        icon: <UserCheck size={18} className="stroke-[2.2]" />,
        type: "purple",
        status: "Screening",
        isDisabled: false,
      },
      {
        id: "interview",
        title: "Interview",
        value: getStageCount("Interview").toLocaleString(),
        icon: <Calendar size={18} className="stroke-[2.2]" />,
        type: "orange",
        status: "Interview",
        isDisabled: false,
      },
      {
        id: "rejected",
        title: "Talent Pool",
        value: getStageCount("Rejected").toLocaleString(),
        icon: <XCircle size={18} className="stroke-[2.2]" />,
        type: "red",
        status: "Rejected",
        isDisabled: false,
      },
    ];
  }, [candidateListingData]);

  const handleStatusCardClick = (status) => {
    if (!status) {
      setSelectedFilterStage("");
      return;
    }
    setSelectedFilterStage((prev) => (prev === status ? "" : status));
  };

  const displayedCandidates = useMemo(() => {
    if (!selectedFilterStage) return candidateListingData;
    return candidateListingData.filter(
      (item) => item.stage?.toLowerCase() === selectedFilterStage.toLowerCase(),
    );
  }, [candidateListingData, selectedFilterStage]);

  // Grid Drag Handlers
  const handleGridCardDragStart = ({ event, row }) => {
    handleDragStart(event, row, { type: "CANDIDATE_CARD" });
  };

  const handleGridCardDragEnd = () => {
    handleDragEnd();
  };

  const getCardClassName = ({ row }) => {
    if (draggingCandidate?._id === row._id) {
      return "hp-grid-card--dragging";
    }
    return "";
  };

  const getRowClassName = (row) => {
    if (draggingCandidate?._id === row._id) {
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

  useDocumentTitle("orvexa | Candidates");

  // Right-click menu: Edit, status changes and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row._id),
    statusCards: candidateSummary,
    statusField: "stage",
    onStatusChange: handleRequestStageChange,
    statusLabel: "Move to",
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Modern Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-3 mr-2">
        {candidateSummary.map((item) => (
          <div key={item.id}>
            <StatusCard
              {...item}
              isSelectedFilter={
                item.status
                  ? selectedFilterStage === item.status
                  : selectedFilterStage === ""
              }
              isDraggingAny={isDragging}
              isDropTarget={isDropTarget(item.status)}
              onDragOver={(e) =>
                handleDragOver(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: ["CANDIDATE_CARD"],
                  meta: item,
                })
              }
              onDragLeave={(e) => handleDragLeave(e, item.status)}
              onDrop={(e) =>
                handleDrop(e, item.status, {
                  disabled: item.isDisabled,
                  acceptTypes: ["CANDIDATE_CARD"],
                  meta: item,
                  onDrop: (candidate) =>
                    handleRequestStageChange(candidate, item.status, item.title),
                })
              }
              onClick={() => handleStatusCardClick(item.status)}
            />
          </div>
        ))}
      </div>

      {/* Candidate Add/Edit Modal */}
      {isModalOpen && (
        <CandidateModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getCandidateListing}
          extraParams={extraParams}
        />
      )}

      {/* Schedule Interview Modal when dragged to "Interview" */}
      {scheduleModalState.open && (
        <InterviewModal
          open={scheduleModalState.open}
          onModalClose={() =>
            setScheduleModalState({ open: false, candidate: null })
          }
          onSaved={async () => {
            setScheduleModalState({ open: false, candidate: null });
            await getCandidateListing();
          }}
          extraParams={{
            mode: "add",
            defaultValues: {
              candidate: scheduleModalState.candidate?._id,
              jobOpening:
                scheduleModalState.candidate?.jobOpening?._id ||
                scheduleModalState.candidate?.jobOpening ||
                "",
              roundName: "Technical Round 1",
              scheduledDate: new Date().toISOString().split("T")[0],
            },
          }}
        />
      )}

      {/* Grid listing with both List and Cards view */}
      <div className="min-h-0 flex-1">
        <HpGrid
          contextData={contextData}
          id="candidateListing"
          rowData={displayedCandidates}
          colDef={candidateListingColDef}
          style={{ height: "100%" }}
          onDoubleClick={handleDoubleClick}
          onCardClick={handleDoubleClick}
          onAddClick={handleAdd}
          title="Candidate Pool"
          toggle
          defaultView="card"
          cardTitleField="candidateName"
          cardSubtitleField="jobTitle"
          cardStatusField="stage"
          cardFields={[
            "email",
            "phone",
            "totalExperienceYears",
            "currentCompany",
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
            isPending("deleteCandidate") ||
            isPending("getCandidateListing") ||
            isPending("updateCandidateStage")
          }
        />
      </div>
    </div>
  );
};

export default CandidateListing;
