import { HpGrid } from "@/hp-grid/src";
import { useEffect, useState } from "react";
import useRoleConfig from "./useRoleConfig";
import useModal from "@/hooks/useModal";
import RoleModal from "./RoleModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const RoleListing = () => {
    const { apiCall, isPending } = useApiCall();
    const { deleteAlert, successAlert, errorAlert } = useAlert();

    const handleDelete = (id, isSystemDefault) => {
        if (isSystemDefault) {
            errorAlert({
                title: "Action Not Permitted",
                text: "System built-in roles cannot be deleted."
            });
            return;
        }

        deleteAlert({
            title: "Delete Role?",
            text: "Are you sure you want to delete this custom role? This cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            onClick: async () => {
                const res = await apiCall({
                    id: "deleteRole",
                    api: api + apiEndpoints.administration.role.RoleDeleteByID,
                    payload: { _id: id },
                });

                if (res?.success) {
                    successAlert({
                        title: "Role Deleted",
                        text: "Custom role deleted successfully.",
                    });
                    getRoleListing();
                }
            },
        });
    };

    const { roleListingColDef } = useRoleConfig({ handleDelete });
    const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
    const [roleData, setRoleData] = useState([]);

    const getRoleListing = async () => {
        const res = await apiCall({
            id: "getRoleListing",
            api: api + apiEndpoints.administration.role.RoleGetData,
            payload: {},
        });

        if (res?.success) {
            const raw = res.data?.data ?? res.data;
            const data = Array.isArray(raw) ? raw : [];
            setRoleData(data);
        }
    };

    useEffect(() => {
        getRoleListing();
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

    useDocumentTitle("orvexa | Roles & Permissions");

    return (
        <>
            {isModalOpen && (
                <RoleModal
                    open={isModalOpen}
                    onModalClose={onModalClose}
                    onSaved={getRoleListing}
                    extraParams={extraParams}
                />
            )}
            <HpGrid
                id="roleListing"
                rowData={roleData}
                colDef={roleListingColDef}
                style={{ height: "100%" }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Roles & Access Control"
                columnFilterable={true}
                panding={isPending("deleteRole") || isPending("getRoleListing")}
            />
        </>
    );
};

export default RoleListing;

