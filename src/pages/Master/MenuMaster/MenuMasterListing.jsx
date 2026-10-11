import { HpGrid } from "@/hp-grid/src";
import { useCallback, useEffect, useState } from "react";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import useMenuMasterConfig from "./useMenuMasterConfig";
import useModal from "@/hooks/useModal";
import MenuMasterModal from "./MenuMasterModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const MenuMasterListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [rows, setRows] = useState([]);

  const getMenuListing = useCallback(async () => {
    const res = await apiCall({
      id: "getMenuListing",
      api: api + apiEndpoints.menu.MenuGetData,
      payload: {},
    });
    if (res?.success) {
      const list = (res.data?.data || []).map((m) => ({
        ...m,
        displayName: m.menuName,
      }));
      setRows(list);
    }
  }, [apiCall]);

  useEffect(() => {
    getMenuListing();
  }, [getMenuListing]);

  const handleDelete = (row) => {
    deleteAlert({
      title: "Delete Menu?",
      text: `"${row.menuName}" will be removed from the sidebar and from every role's permissions. This action cannot be undone.`,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteMenu",
          api: api + apiEndpoints.menu.MenuDeleteByID,
          payload: { _id: row._id },
        });
        if (res?.success) {
          successAlert({ title: "Menu Deleted", text: "Menu deleted successfully." });
          getMenuListing();
        }
        return res?.success;
      },
    });
  };

  const { menuListingColDef } = useMenuMasterConfig({ handleDelete });

  const handleAdd = () => onModalOpen({ mode: "add" });

  const handleDoubleClick = (data) => {
    const id = data?.data?._id;
    if (id) onModalOpen({ mode: "edit", id });
  };

  useDocumentTitle("orvexa | Route Master");

  // Right-click menu: Edit and Delete.
  const contextData = createRowContextMenu({
    onEdit: (row) => handleDoubleClick({ data: row }),
    onDelete: (row) => handleDelete(row),
  });

  return (
    <>
      {isModalOpen && (
        <MenuMasterModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getMenuListing}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        id="menuMasterListing"
        contextData={contextData}
        rowData={rows}
        colDef={menuListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Route Master"
        searchable={true}
        searchPlaceholder="Search routes and modules..."
        columnFilterable={true}
        expand={true}
        defaultExpanded={false}
        treeField="displayName"
        parentIdField="parentMenu"
        panding={isPending("getMenuListing") || isPending("deleteMenu")}
      />
    </>
  );
};

export default MenuMasterListing;
