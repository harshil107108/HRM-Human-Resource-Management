import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import useReviewConfig from "./useReviewConfig";
import useModal from "@/hooks/useModal";
import ReviewModal from "./ReviewModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDate } from "@/utils/dateUtils";

const ReviewListing = () => {
    const { apiCall, isPending } = useApiCall();
    const { deleteAlert, successAlert } = useAlert();

    const handleDelete = (id) => {
        deleteAlert({
            title: "Delete Review?",
            text: "Are you sure you want to delete this performance review? This action cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            onClick: async () => {
                const res = await apiCall({
                    id: "deleteReview",
                    api: api + apiEndpoints.performance.review.ReviewDeleteByID,
                    payload: { _id: id },
                });

                if (res?.success) {
                    successAlert({
                        title: "Review Deleted",
                        text: "Performance review deleted successfully.",
                    });
                    getReviewListing();
                }
            },
        });
    };

    const { reviewListingColDef } = useReviewConfig({ handleDelete });
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [reviewData, setReviewData] = useState([]);

    const getReviewListing = async () => {
        const res = await apiCall({
            id: "getReviewListing",
            api: api + apiEndpoints.performance.review.ReviewGetData,
            payload: {},
        });

        if (res?.success) {
            const raw = res.data?.data ?? res.data;
            const data = Array.isArray(raw) ? raw : [];
            const formatted = data.map((item) => ({
                ...item,
                employeeName: item.employeeId
                    ? typeof item.employeeId === "object"
                        ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || "EMP"})`
                        : item.employeeId
                    : "N/A",
                reviewerName: item.reviewerId
                    ? typeof item.reviewerId === "object"
                        ? `${item.reviewerId.firstName || ""} ${item.reviewerId.lastName || ""}`
                        : item.reviewerId
                    : "N/A",
                reviewDate: formatDate(item.reviewDate),
                finalRating: item.finalRating ?? item.managerRating ?? item.rating ?? 4,
            }));
            setReviewData(formatted);
        }
    };

    useEffect(() => {
        getReviewListing();
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

    useDocumentTitle("orvexa | Performance Reviews");

    return (
        <>
            {isModalOpen && (
                <ReviewModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    onSaved={getReviewListing}
                    extraParams={extraParams}
                />
            )}
            <HpGrid
                id="reviewListing"
                rowData={reviewData}
                colDef={reviewListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Performance Reviews"
                columnFilterable={true}
                panding={isPending("deleteReview") || isPending("getReviewListing")}
            />
        </>
    );
};

export default ReviewListing;

