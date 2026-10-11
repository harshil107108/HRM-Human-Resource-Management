import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import useAppraisalConfig from "./useAppraisalConfig";
import useModal from "@/hooks/useModal";
import AppraisalModal from "./AppraisalModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDate } from "@/utils/dateUtils";

const AppraisalListing = () => {
    const { apiCall, isPending } = useApiCall();
    const { deleteAlert, successAlert } = useAlert();

    const handleDelete = (id) => {
        deleteAlert({
            title: "Delete Appraisal?",
            text: "Are you sure you want to delete this appraisal record? This action cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            onClick: async () => {
                const res = await apiCall({
                    id: "deleteAppraisal",
                    api: api + apiEndpoints.performance.appraisal.AppraisalDeleteByID,
                    payload: { _id: id },
                });

                if (res?.success) {
                    successAlert({
                        title: "Appraisal Deleted",
                        text: "Appraisal record deleted successfully.",
                    });
                    getAppraisalListing();
                }
            },
        });
    };

    const { appraisalListingColDef } = useAppraisalConfig({ handleDelete });
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [appraisalData, setAppraisalData] = useState([]);

    const getAppraisalListing = async () => {
        const res = await apiCall({
            id: "getAppraisalListing",
            api: api + apiEndpoints.performance.appraisal.AppraisalGetData,
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
                reviewCycle: item.reviewCycle || item.cycle || "FY 2025-2026",
                effectiveDate: formatDate(item.effectiveDate),
                currentSalary: Number(item.currentSalary ?? item.previousSalary ?? 0),
                recommendedIncrementPercentage: Number(item.recommendedIncrementPercentage ?? item.incrementPercentage ?? 0),
                revisedSalary: Number(item.revisedSalary ?? item.newSalary ?? 0),
            }));
            setAppraisalData(formatted);
        }
    };

    useEffect(() => {
        getAppraisalListing();
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

    useDocumentTitle("orvexa | Performance Appraisals");

    // Right-click menu: Edit and Delete.
    const contextData = createRowContextMenu({
      onEdit: (row) => handleDoubleClick({ data: row }),
      onDelete: (row) => handleDelete(row._id),
    });

    return (
        <>
            {isModalOpen && (
                <AppraisalModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    onSaved={getAppraisalListing}
                    extraParams={extraParams}
                />
            )}
            <HpGrid
                contextData={contextData}
                id="appraisalListing"
                rowData={appraisalData}
                colDef={appraisalListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Performance Appraisals & Salary Revisions"
                columnFilterable={true}
                panding={isPending("deleteAppraisal") || isPending("getAppraisalListing")}
            />
        </>
    );
};

export default AppraisalListing;

