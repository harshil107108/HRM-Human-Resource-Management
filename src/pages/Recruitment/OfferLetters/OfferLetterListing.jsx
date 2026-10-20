import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState, useMemo, useCallback } from "react";
import useOfferLetterConfig from "./useOfferLetterConfig";
import useModal from "@/hooks/useModal";
import OfferLetterModal from "./OfferLetterModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from "@/utils/dateUtils";
import StatusCard from "@/components/common/StatusCard";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import { confirmStatusChange } from "@/utils/confirmStatusChange";
import {
  FileText,
  FileEdit,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
} from "lucide-react";
import MailSendingModal from "./MailSendingModal";

const OfferLetterListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert, warningAlert, confirmAlert } = useAlert();

  const [offerListingData, setOfferListingData] = useState([]);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState("");
  const [mailModal, setMailModal] = useState({
    isOpen: false,
    status: "sending",
    candidateName: "",
    candidateEmail: "",
    message: "",
    error: "",
  });

  const getOfferListing = useCallback(async () => {
    const res = await apiCall({
      id: "getOfferListing",
      api: api + apiEndpoints.recruitment.offer.OfferGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => ({
        ...item,
        candidateName: item.candidate?.candidateName || "N/A",
        jobTitle: item.jobOpening?.jobTitle || "N/A",
        joiningDate: formatDateForInput(item.joiningDate),
        validUntil: formatDateForInput(item.validUntil),
      }));
      setOfferListingData(formatted);
    }
  }, [apiCall]);

  useEffect(() => {
    getOfferListing();
  }, [getOfferListing]);

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Offer Letter?",
      text: "Are you sure you want to delete this offer letter? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteOffer",
          api: api + apiEndpoints.recruitment.offer.OfferDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Offer Deleted",
            text: "Offer letter has been deleted successfully.",
          });
          getOfferListing();
        }
      },
    });
  };

  const handleSendEmail = useCallback(
    (offer) => {
      if (!offer) return;

      const candidateName =
        offer.candidateName || offer.candidate?.candidateName || "Candidate";
      const candidateEmail =
        offer.candidate?.email || offer.emailSentTo || "";

      confirmAlert({
        title: "Send Offer Letter Email?",
        text: candidateEmail
          ? `Send official offer letter email to ${candidateName} (${candidateEmail}) from company mail?`
          : `Send official offer letter email to ${candidateName} from company mail?`,
        confirmButtonText: "Send Email",
        cancelButtonText: "Cancel",
        onClick: async () => {
          setMailModal({
            isOpen: true,
            status: "sending",
            candidateName,
            candidateEmail,
            message: "",
            error: "",
          });

          try {
            const res = await apiCall({
              id: "sendOfferEmail",
              api: api + apiEndpoints.recruitment.offer.SendOfferEmail,
              payload: { _id: offer._id },
            });

            if (res?.success) {
              setMailModal((prev) => ({
                ...prev,
                status: "success",
                message:
                  res.data?.message ||
                  `Offer letter email sent successfully to ${candidateName}.`,
              }));
              await getOfferListing();
            } else {
              setMailModal((prev) => ({
                ...prev,
                status: "error",
                error: res?.message || "Failed to dispatch offer email.",
              }));
            }
          } catch (err) {
            setMailModal((prev) => ({
              ...prev,
              status: "error",
              error: err?.message || "Network error while dispatching offer email.",
            }));
          }
        },
      });
    },
    [apiCall, confirmAlert, getOfferListing],
  );

  const { offerListingColDef } = useOfferLetterConfig({
    handleDelete,
    handleSendEmail,
  });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

  // Execute status update with automatic pipeline move to Onboarding when Accepted
  const executeStatusUpdate = async (offer, targetStatus, statusTitle) => {
    try {
      const candidateName =
        offer.candidateName || offer.candidate?.candidateName || "Candidate";
      const candidateEmail =
        offer.candidate?.email || offer.emailSentTo || "";

      if (targetStatus === "Accepted") {
        // Update offer status to Accepted (backend automatically updates candidate stage to Hired and creates Onboarding record)
        await apiCall({
          id: "updateOfferStatus",
          api: api + apiEndpoints.recruitment.offer.OfferAddEdit,
          payload: {
            _id: offer._id,
            status: "Accepted",
          },
        });

        successAlert({
          title: "Offer Accepted!",
          text: `Offer accepted for "${candidateName}". Candidate profile moved to Onboarding module.`,
        });
        await getOfferListing();
        return;
      }

      // When moving to Sent, display the Lottie Mail Sending Animation overlay
      if (targetStatus === "Sent") {
        setMailModal({
          isOpen: true,
          status: "sending",
          candidateName,
          candidateEmail,
          message: "",
          error: "",
        });

        try {
          const res = await apiCall({
            id: "updateOfferStatus",
            api: api + apiEndpoints.recruitment.offer.OfferAddEdit,
            payload: {
              _id: offer._id,
              status: "Sent",
            },
          });

          if (res?.success) {
            setMailModal((prev) => ({
              ...prev,
              status: "success",
              message:
                res?.data?.message ||
                `Offer letter marked as Sent and delivered to ${candidateName} via email.`,
            }));
            await getOfferListing();
          } else {
            setMailModal((prev) => ({
              ...prev,
              status: "error",
              error: res?.message || "Failed to dispatch offer email.",
            }));
          }
        } catch (err) {
          setMailModal((prev) => ({
            ...prev,
            status: "error",
            error: err?.message || "Error while dispatching offer email.",
          }));
        }
        return;
      }

      const res = await apiCall({
        id: "updateOfferStatus",
        api: api + apiEndpoints.recruitment.offer.OfferAddEdit,
        payload: {
          _id: offer._id,
          status: targetStatus,
        },
      });

      if (res?.success) {
        successAlert({
          title: "Status Updated",
          text:
            res?.data?.message ||
            `Offer letter for "${candidateName}" changed to ${statusTitle || targetStatus}.`,
        });
        await getOfferListing();
      }
    } catch (err) {
      console.error("Failed to update offer status:", err);
    }
  };

  const handleRequestStatusChange = useCallback(
    async (offer, targetStatus, statusTitle) => {
      if (!offer || !targetStatus) return;

      if (offer.status === targetStatus) {
        successAlert({
          title: "Already in status",
          text: `Offer letter is already marked as ${statusTitle || targetStatus}.`,
        });
        return;
      }

      const candidateName =
        offer.candidateName || offer.candidate?.candidateName || "Candidate";
      const isSentPreviously = offer.status === "Sent" || offer.emailSent;

      // Requirement 1: Offer letter must be "Sent" before it can be Accepted or Declined
      if (
        (targetStatus === "Accepted" || targetStatus === "Declined") &&
        !isSentPreviously
      ) {
        warningAlert({
          title: "Offer Must Be Sent First",
          text: `Offer letter for "${candidateName}" is currently in "${offer.status || "Draft"}". You must send the offer letter to the candidate before it can be marked as ${statusTitle || targetStatus}.`,
        });
        return;
      }

      // Requirement 2: When email has been sent, status CANNOT be changed to Draft or Expired.
      // Only Accept or Decline are allowed!
      if (
        isSentPreviously &&
        (targetStatus === "Draft" || targetStatus === "Expired")
      ) {
        warningAlert({
          title: "Status Revert Not Allowed",
          text: `The offer letter email has already been sent to "${candidateName}". Once sent, an offer cannot be reverted to Draft or marked as Expired. You can only mark it as Accepted or Declined.`,
        });
        return;
      }

      // Requirement 3: Once finalized as Accepted or Declined, prevent changing to Draft or Expired
      if (
        (offer.status === "Accepted" || offer.status === "Declined") &&
        (targetStatus === "Draft" || targetStatus === "Expired")
      ) {
        warningAlert({
          title: "Offer Finalized",
          text: `This offer letter is already finalized (${offer.status}). It cannot be changed to ${statusTitle || targetStatus}.`,
        });
        return;
      }

      const confirmed = await confirmStatusChange({
        fieldName: "Offer Status",
        currentValue: offer.status,
        nextValue: targetStatus,
        currentLabel: offer.status,
        nextLabel: statusTitle || targetStatus,
      });
      if (!confirmed) return;

      executeStatusUpdate(offer, targetStatus, statusTitle);
    },
    [executeStatusUpdate, successAlert, warningAlert],
  );

  // Drag and Drop Hook
  const {
    draggedItem: draggingOffer,
    isDragging,
    isDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop({
    defaultType: "OFFER_CARD",
    onDrop: (offer, targetStatus, meta) => {
      handleRequestStatusChange(offer, targetStatus, meta?.title);
    },
  });

  // Summary Metrics
  const offerSummary = useMemo(() => {
    const getStatusCount = (status) => {
      return offerListingData.filter(
        (item) => item?.status?.toLowerCase() === status.toLowerCase(),
      ).length;
    };

    return [
      {
        id: "totalOffers",
        title: "Total Offers",
        value: offerListingData.length.toLocaleString(),
        icon: <FileText size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true,
      },
      {
        id: "draft",
        title: "Draft",
        value: getStatusCount("Draft").toLocaleString(),
        icon: <FileEdit size={18} className="stroke-[2.2]" />,
        type: "cyan",
        status: "Draft",
        isDisabled: false,
      },
      {
        id: "sent",
        title: "Sent",
        value: getStatusCount("Sent").toLocaleString(),
        icon: <Send size={18} className="stroke-[2.2]" />,
        type: "purple",
        status: "Sent",
        isDisabled: false,
      },
      {
        id: "accepted",
        title: "Accepted",
        value: getStatusCount("Accepted").toLocaleString(),
        icon: <CheckCircle2 size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "Accepted",
        isDisabled: false,
      },
      {
        id: "declined",
        title: "Declined",
        value: getStatusCount("Declined").toLocaleString(),
        icon: <XCircle size={18} className="stroke-[2.2]" />,
        type: "red",
        status: "Declined",
        isDisabled: false,
      },
      {
        id: "expired",
        title: "Expired",
        value: getStatusCount("Expired").toLocaleString(),
        icon: <Clock size={18} className="stroke-[2.2]" />,
        type: "orange",
        status: "Expired",
        isDisabled: false,
      },
    ];
  }, [offerListingData]);

  const handleStatusCardClick = (status) => {
    if (!status) {
      setSelectedFilterStatus("");
      return;
    }
    setSelectedFilterStatus((prev) => (prev === status ? "" : status));
  };

  const displayedOffers = useMemo(() => {
    if (!selectedFilterStatus) return offerListingData;
    return offerListingData.filter(
      (item) => item.status?.toLowerCase() === selectedFilterStatus.toLowerCase(),
    );
  }, [offerListingData, selectedFilterStatus]);

  // Grid Drag Handlers
  const handleGridCardDragStart = ({ event, row }) => {
    handleDragStart(event, row, { type: "OFFER_CARD" });
  };

  const handleGridCardDragEnd = () => {
    handleDragEnd();
  };

  const getCardClassName = ({ row }) => {
    if (draggingOffer?._id === row._id) {
      return "hp-grid-card--dragging";
    }
    return "";
  };

  const getRowClassName = (row) => {
    if (draggingOffer?._id === row._id) {
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

  useDocumentTitle("orvexa | Offer Letters");

  // Right-click menu: Edit, Send Email, status changes and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    extraItems: [
      {
        id: "send-email",
        permission: "edit",
        text: "Send / Resend Offer Email",
        icon: <Mail size={14} className="text-blue-600" />,
        onClick: (row) => handleSendEmail(row),
      },
    ],
    onDelete: (row) => handleDelete(row._id),
    statusCards: (row) => {
      const isSent = row.status === "Sent" || row.emailSent;
      if (isSent) {
        // Once an offer letter email has been sent, it cannot be reverted to Draft or Expired.
        // It can only be marked as Accepted or Declined.
        return offerSummary.filter(
          (card) => card.status === "Accepted" || card.status === "Declined",
        );
      }
      return offerSummary;
    },
    statusField: "status",
    onStatusChange: handleRequestStatusChange,
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 6 Modern Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3 mr-2">
        {offerSummary.map((item) => {
          const isSentOfferDragging =
            draggingOffer?.status === "Sent" || draggingOffer?.emailSent;

          const isDropDisabled =
            item.isDisabled ||
            // If dragging a non-Sent offer, cannot drop on Accepted or Declined
            (isDragging &&
              (item.status === "Accepted" || item.status === "Declined") &&
              !isSentOfferDragging) ||
            // If dragging a Sent offer, CANNOT drop on Draft, Expired, or Sent
            (isDragging &&
              isSentOfferDragging &&
              (item.status === "Draft" || item.status === "Expired" || item.status === "Sent"));

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
                    acceptTypes: ["OFFER_CARD"],
                    meta: item,
                  })
                }
                onDragLeave={(e) => handleDragLeave(e, item.status)}
                onDrop={(e) =>
                  handleDrop(e, item.status, {
                    disabled: isDropDisabled,
                    acceptTypes: ["OFFER_CARD"],
                    meta: item,
                    onDrop: (offer) =>
                      handleRequestStatusChange(offer, item.status, item.title),
                  })
                }
                onClick={() => handleStatusCardClick(item.status)}
              />
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <OfferLetterModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getOfferListing}
          extraParams={extraParams}
        />
      )}

      {/* Lottie Mail Sending / Sent Animation Overlay */}
      <MailSendingModal
        {...mailModal}
        onClose={() => setMailModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Grid listing with both List and Cards view */}
      <div className="min-h-0 flex-1">
        <HpGrid
          contextData={contextData}
          id="offerLetterListing"
          rowData={displayedOffers}
          colDef={offerListingColDef}
          style={{ height: "100%" }}
          onDoubleClick={handleDoubleClick}
          onCardClick={handleDoubleClick}
          onAddClick={handleAdd}
          title="Offer Letters"
          toggle
          defaultView="card"
          cardTitleField="candidateName"
          cardSubtitleField="jobTitle"
          cardStatusField="status"
          cardFields={["offeredCtc", "joiningDate", "validUntil"]}
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
            isPending("deleteOffer") ||
            isPending("getOfferListing") ||
            isPending("updateOfferStatus") ||
            isPending("sendOfferEmail")
          }
        />
      </div>
    </div>
  );
};

export default OfferLetterListing;
