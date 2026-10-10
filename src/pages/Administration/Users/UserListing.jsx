import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import useUserConfig from "./useUserConfig";
import useModal from "@/hooks/useModal";
import UserModal from "./UserModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDate } from "@/utils/dateUtils";

const UserListing = () => {
    const { apiCall, isPending } = useApiCall();
    const { deleteAlert, successAlert } = useAlert();

    const handleDelete = (id) => {
        deleteAlert({
            title: "Delete User Account?",
            text: "Are you sure you want to delete this user? They will lose access immediately.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            onClick: async () => {
                const res = await apiCall({
                    id: "deleteUser",
                    api: api + apiEndpoints.administration.user.UserDeleteByID,
                    payload: { _id: id },
                });

                if (res?.success) {
                    successAlert({
                        title: "User Deleted",
                        text: "User account deleted successfully.",
                    });
                    getUserListing();
                }
            },
        });
    };

    const { userListingColDef } = useUserConfig({ handleDelete });
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [userData, setUserData] = useState([]);

    const getUserListing = async () => {
        const res = await apiCall({
            id: "getUserListing",
            api: api + apiEndpoints.administration.user.UserGetData,
            payload: {},
        });

        if (res?.success) {
            const raw = res.data?.data ?? res.data;
            const data = Array.isArray(raw) ? raw : [];
            const formatted = data.map((item) => ({
                ...item,
                employeeName: item.employeeRef
                    ? typeof item.employeeRef === "object"
                        ? `${item.employeeRef.firstName || ""} ${item.employeeRef.lastName || ""} (${item.employeeRef.employeeId || "EMP"})`
                        : item.employeeRef
                    : item.employeeId
                        ? typeof item.employeeId === "object"
                            ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""}`
                            : item.employeeId
                        : "Independent Account",
                lastLoginFormatted: item.lastLogin ? formatDate(item.lastLogin) : "Never Logged In",
            }));
            setUserData(formatted);
        }
    };

    useEffect(() => {
        getUserListing();
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

    useDocumentTitle("orvexa | User Accounts");

    return (
        <>
            {isModalOpen && (
                <UserModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    onSaved={getUserListing}
                    extraParams={extraParams}
                />
            )}
            <HpGrid
                id="userListing"
                rowData={userData}
                colDef={userListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="System User Accounts"
                columnFilterable={true}
                panding={isPending("deleteUser") || isPending("getUserListing")}
            />
        </>
    );
};

export default UserListing;

