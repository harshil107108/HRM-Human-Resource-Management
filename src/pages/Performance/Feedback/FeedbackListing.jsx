import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import useFeedbackConfig from "./useFeedbackConfig";
import useModal from "@/hooks/useModal";
import FeedbackModal from "./FeedbackModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const FeedbackListing = () => {
    const { apiCall, isPending } = useApiCall();
    const { deleteAlert, successAlert } = useAlert();

    const handleDelete = (id) => {
        deleteAlert({
            title: "Delete Feedback?",
            text: "Are you sure you want to delete this feedback record? This action cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            onClick: async () => {
                const res = await apiCall({
                    id: "deleteFeedback",
                    api: api + apiEndpoints.performance.feedback.FeedbackDeleteByID,
                    payload: { _id: id },
                });

                if (res?.success) {
                    successAlert({
                        title: "Feedback Deleted",
                        text: "Feedback entry deleted successfully.",
                    });
                    getFeedbackListing();
                }
            },
        });
    };

    const { feedbackListingColDef } = useFeedbackConfig({ handleDelete });
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [feedbackData, setFeedbackData] = useState([]);

    const getFeedbackListing = async () => {
        const res = await apiCall({
            id: "getFeedbackListing",
            api: api + apiEndpoints.performance.feedback.FeedbackGetData,
            payload: {},
        });

        if (res?.success) {
            const raw = res.data?.data ?? res.data;
            const data = Array.isArray(raw) ? raw : [];
            const formatted = data.map((item) => ({
                ...item,
                toEmployeeName: item.givenTo
                    ? typeof item.givenTo === "object"
                        ? `${item.givenTo.firstName || ""} ${item.givenTo.lastName || ""} (${item.givenTo.employeeId || "EMP"})`
                        : item.givenTo
                    : item.toEmployeeId
                        ? typeof item.toEmployeeId === "object"
                            ? `${item.toEmployeeId.firstName || ""} ${item.toEmployeeId.lastName || ""}`
                            : item.toEmployeeId
                        : "N/A",
                fromEmployeeName: item.givenBy
                    ? typeof item.givenBy === "object"
                        ? `${item.givenBy.firstName || ""} ${item.givenBy.lastName || ""}`
                        : item.givenBy
                    : item.fromEmployeeId
                        ? typeof item.fromEmployeeId === "object"
                            ? `${item.fromEmployeeId.firstName || ""} ${item.fromEmployeeId.lastName || ""}`
                            : item.fromEmployeeId
                        : "N/A",
            }));
            setFeedbackData(formatted);
        }
    };

    useEffect(() => {
        getFeedbackListing();
    }, []);

    const handleAdd = () => {
        onModalOpen({ mode: "add" });
    };

    const handleDoubleClick = (data) => {
        const id = data?.data?._id || data?._id;
        if (id) {
            onModalOpen({ mode: "edit", id });
        }
    };

    useDocumentTitle("orvexa | Continuous Feedback");

    // Right-click menu: Edit and Delete.
    const contextData = createRowContextMenu({
      onEdit: (row) => handleDoubleClick({ data: row }),
      onDelete: (row) => handleDelete(row._id),
    });

    return (
        <>
            {isModalOpen && (
                <FeedbackModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    onSaved={getFeedbackListing}
                    extraParams={extraParams}
                />
            )}
            <HpGrid
                contextData={contextData}
                id="feedbackListing"
                rowData={feedbackData}
                colDef={feedbackListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Continuous 360 Feedback & Recognition"
                columnFilterable={true}
                panding={isPending("deleteFeedback") || isPending("getFeedbackListing")}
            />
        </>
    );
};

export default FeedbackListing;

