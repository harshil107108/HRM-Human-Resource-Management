import { api, apiEndpoints } from "@/api/api";
import { MENU_ICON_OPTIONS } from "@/utils/menuIcons";

export const useMenuMasterConfig = ({ handleDelete } = {}) => {
  const menuListingColDef = [
    {
      id: "displayName",
      field: "displayName",
      headerName: "Menu / Route Name",
      width: 260,
      render: (val, row) => (
        <span className="font-medium text-slate-800">
          {row.displayName || row.menuName || val || "—"}
        </span>
      ),
    },
    {
      id: "menuCode",
      field: "menuCode",
      headerName: "Menu Code",
      width: 190,
      render: (val) => (
        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {val}
        </span>
      ),
    },
    {
      id: "parentName",
      field: "parentName",
      headerName: "Parent Group",
      width: 170,
      render: (val, row) => {
        const groupName =
          row._parentName ||
          (typeof row.parentMenu === "object" ? row.parentMenu?.menuName : null) ||
          val;
        if (groupName) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {groupName}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Top Group
          </span>
        );
      },
    },
    {
      id: "path",
      field: "path",
      headerName: "Route Path",
      width: 220,
      render: (val) => (
        <span className="font-mono text-xs text-slate-600">{val || "—"}</span>
      ),
    },
    {
      id: "icon",
      field: "icon",
      headerName: "Icon",
      width: 120,
      render: (val) => (
        <span className="text-xs text-slate-600">{val || "—"}</span>
      ),
    },
    {
      id: "sortOrder",
      field: "sortOrder",
      headerName: "Order",
      width: 80,
      type: "number",
    },
    {
      type: "status",
      id: "isActive",
      field: "isActive",
      headerName: "Status",
      width: 100,
    },
    {
      id: "action",
      field: "action",
      headerName: "Action",
      width: 80,
      type: "actions",
      onClick: (data) => {
        handleDelete?.(data);
      },
    },
  ];

  const menuSchema = [
    {
      id: "menuName",
      type: "text",
      label: "Menu Name",
      placeHolder: "e.g. Country Master",
      required: true,
      className: "col-span-6",
    },
    {
      id: "menuCode",
      type: "text",
      label: "Menu Code",
      placeHolder: "e.g. MASTER_COUNTRY",
      required: true,
      textTransform: "uppercase",
      maxLength: 40,
      className: "col-span-6",
      validate: (value) =>
        value && !/^[A-Z0-9_]+$/.test(String(value))
          ? "Use letters, numbers and underscores only"
          : undefined,
    },
    {
      id: "parentMenu",
      type: "selectWrapper",
      label: "Parent Group",
      placeHolder: "None — this is a group",
      required: false,
      className: "col-span-6",
      api: api + apiEndpoints.menu.MenuHelp,
      labelKey: "menuName",
      valueKey: "_id",
    },
    {
      id: "path",
      type: "text",
      label: "Route Path",
      placeHolder: "e.g. /master/countries",
      required: true,
      className: "col-span-6",
      validate: (value) =>
        value && !String(value).startsWith("/") ? "Path must start with /" : undefined,
    },
    {
      id: "icon",
      type: "selectWrapper",
      label: "Icon (groups)",
      placeHolder: "Select Icon",
      required: false,
      className: "col-span-4",
      options: MENU_ICON_OPTIONS,
    },
    {
      id: "sortOrder",
      type: "number",
      label: "Display Order",
      placeHolder: "10",
      required: false,
      min: 0,
      className: "col-span-4",
    },
    {
      id: "isActive",
      type: "checkbox",
      label: "Is Active",
      className: "col-span-4",
    },
    {
      id: "description",
      type: "textarea",
      label: "Description",
      placeHolder: "What this menu is for",
      required: false,
      className: "col-span-12",
    },
  ];

  const initialValue = {
    menuName: "",
    menuCode: "",
    parentMenu: "",
    path: "",
    icon: "",
    sortOrder: 0,
    isActive: true,
    description: "",
  };

  return { menuListingColDef, menuSchema, initialValue };
};

export default useMenuMasterConfig;
