import { HpCommonModal } from "@/hp-common-modal";
import { ListTree } from "lucide-react";
import { useEffect, useMemo } from "react";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useMenuMasterConfig from "./useMenuMasterConfig";

const MenuMasterModal = ({ open, onModalClose, onSaved, extraParams }) => {
  const { menuSchema, initialValue } = useMenuMasterConfig();
  const { apiCall } = useApiCall();

  const menuId = extraParams?.id;

  const formmethod = useMemo(
    () => formMethod.createForm({ schema: menuSchema, initialValue }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!open || !menuId) return;
    const load = async () => {
      const res = await apiCall({
        id: "getMenuById",
        api: api + apiEndpoints.menu.MenuGetByID,
        payload: { _id: menuId },
      });
      const d = res?.data?.data;
      if (res?.success && d) {
        formmethod.methods.setValues({
          ...d,
          parentMenu: d.parentMenu?._id || d.parentMenu || "",
        });
      }
    };
    load();
  }, [open, menuId, apiCall, formmethod]);

  const handleSave = async () =>
    formmethod.methods.handleFormSave(
      async (data) => {
        const payload = {
          menuName: data.menuName,
          menuCode: String(data.menuCode || "").toUpperCase(),
          parentMenu: data.parentMenu || null,
          path: data.path,
          icon: data.icon || "",
          sortOrder: data.sortOrder === "" || data.sortOrder == null ? 0 : Number(data.sortOrder),
          isActive: Boolean(data.isActive),
          description: data.description || "",
          ...(menuId ? { _id: menuId } : {}),
        };

        const res = await apiCall({
          id: "addEditMenu",
          api: api + apiEndpoints.menu.MenuAddEdit,
          payload,
          showSuccessAlert: true,
        });
        if (!res?.success) throw new Error(res?.message || "Failed to save menu");
        return res;
      },
      {
        successMessage: "Menu saved successfully",
        onSuccess: async () => {
          onModalClose();
          await onSaved?.();
        },
      },
    );

  return (
    <HpCommonModal
      open={open}
      title={menuId ? "Edit Route / Module" : "Add Route / Module"}
      subTitle="Configure sidebar module hierarchy, path, code, and icon"
      size="lg"
      icon={<ListTree size={20} />}
      onSave={handleSave}
      onClose={onModalClose}
      onClear={() => formmethod.methods.reset()}
      loading={formmethod.methods.isSubmitting()}
      showClearButton={!menuId}
      confirmBeforeClose
    >
      <FormRenderer formMethod={formmethod} formSchema={menuSchema} />
      <p className="mt-4 text-[11px] text-slate-500">
        Permissions are stored against the <span className="font-semibold">Menu Code</span>, so keep it
        stable. New menus are hidden from every role until granted on the Permissions page (Super Admin
        always sees them). A menu must also exist as a page in the app for its route to open.
      </p>
    </HpCommonModal>
  );
};

export default MenuMasterModal;
