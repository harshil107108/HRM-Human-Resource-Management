import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import useGoalConfig from "./useGoalConfig";
import useModal from "@/hooks/useModal";
import GoalModal from "./GoalModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDate } from "@/utils/dateUtils";

const GoalListing = () => {
    const { apiCall, isPending } = useApiCall();
    const { deleteAlert, successAlert } = useAlert();

    const handleDelete = (id) => {
        deleteAlert({
            title: "Delete Goal?",
            text: "Are you sure you want to delete this goal? This action cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            onClick: async () => {
                const res = await apiCall({
                    id: "deleteGoal",
                    api: api + apiEndpoints.performance.goal.GoalDeleteByID,
                    payload: { _id: id },
                });

                if (res?.success) {
                    successAlert({
                        title: "Goal Deleted",
                        text: "Performance goal deleted successfully.",
                    });
                    getGoalListing();
                }
            },
        });
    };

    const { goalListingColDef } = useGoalConfig({ handleDelete });
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [goalData, setGoalData] = useState([]);

    const getGoalListing = async () => {
        const res = await apiCall({
            id: "getGoalListing",
            api: api + apiEndpoints.performance.goal.GoalGetData,
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
                targetDate: formatDate(item.targetDate || item.dueDate),
                progressPercentage: Number(item.progressPercentage ?? item.currentValue ?? 0),
                weightagePercentage: Number(item.weightagePercentage ?? 25),
            }));
            setGoalData(formatted);
        }
    };

    useEffect(() => {
        getGoalListing();
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

    useDocumentTitle("orvexa | Performance Goals");

    return (
        <>
            {isModalOpen && (
                <GoalModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    onSaved={getGoalListing}
                    extraParams={extraParams}
                />
            )}
            <HpGrid
                id="goalListing"
                rowData={goalData}
                colDef={goalListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Performance Goals & Objectives (OKRs)"
                columnFilterable={true}
                panding={isPending("deleteGoal") || isPending("getGoalListing")}
            />
        </>
    );
};

export default GoalListing;

