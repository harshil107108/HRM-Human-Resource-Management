import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useRoleConfig from "./useRoleConfig";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const RoleListing = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
        navigate(`${location.pathname}/addedit`, {
            state: { roleid: null },
        });
    };

    const handleDoubleClick = (data) => {
        const id = data?.data?._id || data?._id;
        if (id) {
            navigate(`${location.pathname}/addedit`, {
                state: { roleid: id },
            });
        }
    };

    useDocumentTitle("orvexa | Roles & Access Control");

    // Right-click menu: Edit and Delete.
    const contextData = createRowContextMenu({
      onEdit: (row) => handleDoubleClick({ data: row }),
      onDelete: (row) => handleDelete(row._id, row.isSystemDefault),
      // Built-in roles can't be deleted.
      canDelete: (row) => !row.isSystemDefault,
    });

    return (
        <HpGrid
            contextData={contextData}
            id="roleListing"
            rowData={roleData}
            colDef={roleListingColDef}
            style={{ height: "100%" }}
            onDoubleClick={handleDoubleClick}
            onAddClick={handleAdd}
            title="Roles & Access Control"
            searchable={true}
            searchPlaceholder="Search roles..."
            columnFilterable={true}
            panding={isPending("deleteRole") || isPending("getRoleListing")}
        />
    );
};

export default RoleListing;

