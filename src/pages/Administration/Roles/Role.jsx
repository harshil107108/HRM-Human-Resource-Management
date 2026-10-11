import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HpHeader from "@/hooks/HpHeader";
import HpFooter from "@/hooks/HpFooter";
import { HpGrid } from "@/hp-grid/src";
import HpCheckbox from "@/components/common/HpCheckbox";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { api, apiEndpoints } from "@/api/api";
import { formMethod, FormRenderer } from "@/form-engine";
import { useRoleConfig } from "./useRoleConfig";
import {
  Shield,
  KeyRound,
  CheckSquare,
  Square,
  RotateCcw,
  Lock,
  Layers,
  Sparkles,
  Eye,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const ACTIONS = ["view", "add", "edit", "delete"];

const parseIncomingPermissions = (raw) => {
  if (!raw) return {};
  const result = {};
  if (raw instanceof Map) {
    raw.forEach((actions, code) => {
      if (Array.isArray(actions) && actions.length) result[code] = [...actions];
    });
    return result;
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    Object.entries(raw).forEach(([code, actions]) => {
      if (Array.isArray(actions) && actions.length) result[code] = [...actions];
    });
    return result;
  }
  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      if (typeof item === "string" && item.includes(":")) {
        const [mod, act] = item.split(":");
        const code = mod.toUpperCase();
        if (!result[code]) result[code] = [];
        if (!result[code].includes(act)) result[code].push(act);
      }
    });
    return result;
  }
  return {};
};

const Role = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roleId = location.state?.roleid || null;

  const { initialValue, schema } = useRoleConfig();
  const { apiCall, isPending } = useApiCall();
  const { successAlert, errorAlert } = useAlert();

  const [roleData, setRoleData] = useState(null);
  const [menuTree, setMenuTree] = useState([]);
  const [permissionsMap, setPermissionsMap] = useState({});

  useDocumentTitle(roleId ? "orvexa | Edit Role & Permissions" : "orvexa | Create Role & Permissions");

  // Setup form engine instance for role name, code, description
  const schemaArray = useMemo(() => {
    return Array.isArray(schema)
      ? schema
      : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
  }, [schema]);

  const formInstance = useMemo(() => {
    return formMethod.createForm({
      schema: schemaArray,
      initialValue,
    });
  }, [schemaArray, initialValue]);

  // 1. Fetch menu tree for hierarchical module structure
  const fetchMenuTree = useCallback(async () => {
    const res = await apiCall({
      id: "getMenuTree",
      api: api + apiEndpoints.menu.MenuTree,
      payload: {},
    });
    if (res?.success && Array.isArray(res.data?.data)) {
      setMenuTree(res.data.data);
    }
  }, [apiCall]);

  // 2. Fetch role details if in edit mode
  const fetchRoleById = useCallback(async (id) => {
    if (!id) return;
    const res = await apiCall({
      id: "getRoleById",
      api: api + apiEndpoints.administration.role.RoleGetByID,
      payload: { _id: id },
    });
    if (res?.success && res.data?.data) {
      const data = res.data.data;
      setRoleData(data);
      formInstance.methods.setValues({
        roleName: data.roleName || "",
        roleCode: data.roleCode || "",
        description: data.description || "",
        isSystemDefault: Boolean(data.isSystemDefault),
      });
      setPermissionsMap(parseIncomingPermissions(data.permissions));
    }
  }, [apiCall, formInstance]);

  useEffect(() => {
    fetchMenuTree();
    if (roleId) {
      fetchRoleById(roleId);
    } else {
      setRoleData(null);
      formInstance.methods.setValues(initialValue);
      setPermissionsMap({});
    }
  }, [roleId, fetchMenuTree, fetchRoleById, formInstance, initialValue]);

  const isSuperAdminRole = roleData?.roleCode === "SUPER_ADMIN";

  // Check if an action is granted for a specific menu code
  const isActionActive = useCallback(
    (code, action) => {
      if (isSuperAdminRole) return true;
      return Boolean(permissionsMap[code]?.includes(action));
    },
    [isSuperAdminRole, permissionsMap]
  );

  // Toggle single action for a row (and propagate to children if parent row)
  const handleToggleAction = useCallback(
    (row, action) => {
      if (isSuperAdminRole) return;
      const hasKids = Array.isArray(row.children) && row.children.length > 0;

      setPermissionsMap((prev) => {
        const next = { ...prev };

        if (hasKids) {
          // If parent row: check if currently all children have this action
          const allKidsHave = row.children.every((k) =>
            next[k.menuCode]?.includes(action)
          );
          const targetValue = !allKidsHave;

          // Update parent code
          const currentParent = next[row.menuCode] || [];
          if (targetValue) {
            if (!currentParent.includes(action)) {
              next[row.menuCode] = [...currentParent, action];
            }
          } else {
            next[row.menuCode] = currentParent.filter((a) => a !== action);
            if (!next[row.menuCode].length) delete next[row.menuCode];
          }

          // Propagate to all child codes
          row.children.forEach((k) => {
            const currentKid = next[k.menuCode] || [];
            if (targetValue) {
              if (!currentKid.includes(action)) {
                next[k.menuCode] = [...currentKid, action];
              }
            } else {
              next[k.menuCode] = currentKid.filter((a) => a !== action);
              if (!next[k.menuCode].length) delete next[k.menuCode];
            }
          });
        } else {
          // Child row: toggle for this specific menu code
          const current = next[row.menuCode] || [];
          const exists = current.includes(action);
          if (exists) {
            next[row.menuCode] = current.filter((a) => a !== action);
            if (!next[row.menuCode].length) delete next[row.menuCode];
          } else {
            next[row.menuCode] = [...current, action];
            // If action is view or add/edit/delete, ensure parent group also has view so sidebar reveals it
            if (row.parentCode && (!next[row.parentCode] || !next[row.parentCode].includes("view"))) {
              next[row.parentCode] = [...(next[row.parentCode] || []), "view"];
            }
          }
        }

        return next;
      });
    },
    [isSuperAdminRole]
  );

  // Toggle all actions for a row (and propagate to children if parent row)
  const handleToggleRowAll = useCallback(
    (row) => {
      if (isSuperAdminRole) return;
      const hasKids = Array.isArray(row.children) && row.children.length > 0;

      setPermissionsMap((prev) => {
        const next = { ...prev };

        if (hasKids) {
          // Check if parent and all kids already have full access
          const parentFull = ACTIONS.every((a) => prev[row.menuCode]?.includes(a));
          const kidsFull = row.children.every((k) =>
            ACTIONS.every((a) => prev[k.menuCode]?.includes(a))
          );
          const shouldClear = parentFull && kidsFull;

          if (shouldClear) {
            delete next[row.menuCode];
            row.children.forEach((k) => delete next[k.menuCode]);
          } else {
            next[row.menuCode] = [...ACTIONS];
            row.children.forEach((k) => {
              next[k.menuCode] = [...ACTIONS];
            });
          }
        } else {
          const isFull = ACTIONS.every((a) => prev[row.menuCode]?.includes(a));
          if (isFull) {
            delete next[row.menuCode];
          } else {
            next[row.menuCode] = [...ACTIONS];
            if (row.parentCode && (!next[row.parentCode] || !next[row.parentCode].includes("view"))) {
              next[row.parentCode] = [...(next[row.parentCode] || []), "view"];
            }
          }
        }

        return next;
      });
    },
    [isSuperAdminRole]
  );

  // Global presets
  const handleGrantAllGlobal = () => {
    if (isSuperAdminRole) return;
    const next = {};
    menuTree.forEach((group) => {
      next[group.menuCode] = [...ACTIONS];
      (group.children || []).forEach((c) => {
        next[c.menuCode] = [...ACTIONS];
      });
    });
    setPermissionsMap(next);
  };

  const handleGrantReadOnlyGlobal = () => {
    if (isSuperAdminRole) return;
    const next = {};
    menuTree.forEach((group) => {
      next[group.menuCode] = ["view"];
      (group.children || []).forEach((c) => {
        next[c.menuCode] = ["view"];
      });
    });
    setPermissionsMap(next);
  };

  const handleClearAllGlobal = () => {
    if (isSuperAdminRole) return;
    setPermissionsMap({});
  };

  // Prepare tree rows for HpGrid
  const gridRows = useMemo(() => {
    return menuTree.map((group) => {
      const kids = (group.children || []).map((child) => ({
        ...child,
        id: child._id,
        displayName: child.menuName,
        parentMenu: group._id,
        parentCode: group.menuCode,
        parentName: group.menuName,
        isChild: true,
      }));
      return {
        ...group,
        id: group._id,
        displayName: group.menuName,
        isParent: kids.length > 0,
        children: kids,
      };
    });
  }, [menuTree]);

  // Compute status helpers for a row
  const getActionState = useCallback(
    (row, action) => {
      if (isSuperAdminRole) {
        return { checked: true, indeterminate: false };
      }
      const hasKids = Array.isArray(row.children) && row.children.length > 0;

      if (!hasKids) {
        const checked = Boolean(permissionsMap[row.menuCode]?.includes(action));
        return { checked, indeterminate: false };
      }

      // Parent row: check self and children
      const kids = row.children;
      const count = kids.filter((k) => permissionsMap[k.menuCode]?.includes(action)).length;
      const selfChecked = Boolean(permissionsMap[row.menuCode]?.includes(action));

      if (count === kids.length && selfChecked) {
        return { checked: true, indeterminate: false };
      }
      if (count > 0 || selfChecked) {
        return { checked: false, indeterminate: true };
      }
      return { checked: false, indeterminate: false };
    },
    [isSuperAdminRole, permissionsMap]
  );

  const getFullAccessState = useCallback(
    (row) => {
      if (isSuperAdminRole) {
        return { checked: true, indeterminate: false };
      }
      const hasKids = Array.isArray(row.children) && row.children.length > 0;

      if (!hasKids) {
        const acts = permissionsMap[row.menuCode] || [];
        if (acts.length === ACTIONS.length) {
          return { checked: true, indeterminate: false };
        }
        if (acts.length > 0) {
          return { checked: false, indeterminate: true };
        }
        return { checked: false, indeterminate: false };
      }

      let totalPossible = ACTIONS.length + row.children.length * ACTIONS.length;
      let totalGranted = (permissionsMap[row.menuCode] || []).length;
      row.children.forEach((k) => {
        totalGranted += (permissionsMap[k.menuCode] || []).length;
      });

      if (totalGranted === totalPossible) {
        return { checked: true, indeterminate: false };
      }
      if (totalGranted > 0) {
        return { checked: false, indeterminate: true };
      }
      return { checked: false, indeterminate: false };
    },
    [isSuperAdminRole, permissionsMap]
  );

  // Column definitions for HpGrid
  const permissionColDef = useMemo(() => {
    return [
      {
        id: "displayName",
        field: "displayName",
        headerName: "Module / Route Name",
        width: 290,
        render: (val, row) => (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 truncate text-[13px]">
              {row.displayName || row.menuName}
            </span>
            {row.path && (
              <span className="font-mono text-[10.5px] text-slate-400 truncate">
                {row.path}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "menuCode",
        field: "menuCode",
        headerName: "Menu Code",
        width: 170,
        render: (val) => (
          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {val}
          </span>
        ),
      },
      {
        id: "allAccess",
        field: "allAccess",
        headerName: "Full Access",
        width: 105,
        render: (_, row) => {
          const { checked, indeterminate } = getFullAccessState(row);
          return (
            <div className="flex items-center justify-center w-full h-full">
              <HpCheckbox
                size="sm"
                checked={checked}
                indeterminate={indeterminate}
                disabled={isSuperAdminRole}
                onChange={() => handleToggleRowAll(row)}
                title={
                  isSuperAdminRole
                    ? "Super Admin has unrestricted access"
                    : `Toggle all permissions for ${row.displayName}`
                }
              />
            </div>
          );
        },
      },
      {
        id: "view",
        field: "view",
        headerName: "View (Read)",
        width: 110,
        render: (_, row) => {
          const { checked, indeterminate } = getActionState(row, "view");
          return (
            <div className="flex items-center justify-center w-full h-full">
              <HpCheckbox
                size="sm"
                checked={checked}
                indeterminate={indeterminate}
                disabled={isSuperAdminRole}
                onChange={() => handleToggleAction(row, "view")}
                title={
                  isSuperAdminRole
                    ? "Super Admin has unrestricted access"
                    : `Toggle View permission for ${row.displayName}`
                }
              />
            </div>
          );
        },
      },
      {
        id: "add",
        field: "add",
        headerName: "Add (Create)",
        width: 110,
        render: (_, row) => {
          const { checked, indeterminate } = getActionState(row, "add");
          return (
            <div className="flex items-center justify-center w-full h-full">
              <HpCheckbox
                size="sm"
                checked={checked}
                indeterminate={indeterminate}
                disabled={isSuperAdminRole}
                onChange={() => handleToggleAction(row, "add")}
                title={
                  isSuperAdminRole
                    ? "Super Admin has unrestricted access"
                    : `Toggle Add permission for ${row.displayName}`
                }
              />
            </div>
          );
        },
      },
      {
        id: "edit",
        field: "edit",
        headerName: "Edit (Update)",
        width: 110,
        render: (_, row) => {
          const { checked, indeterminate } = getActionState(row, "edit");
          return (
            <div className="flex items-center justify-center w-full h-full">
              <HpCheckbox
                size="sm"
                checked={checked}
                indeterminate={indeterminate}
                disabled={isSuperAdminRole}
                onChange={() => handleToggleAction(row, "edit")}
                title={
                  isSuperAdminRole
                    ? "Super Admin has unrestricted access"
                    : `Toggle Edit permission for ${row.displayName}`
                }
              />
            </div>
          );
        },
      },
      {
        id: "delete",
        field: "delete",
        headerName: "Delete",
        width: 100,
        render: (_, row) => {
          const { checked, indeterminate } = getActionState(row, "delete");
          return (
            <div className="flex items-center justify-center w-full h-full">
              <HpCheckbox
                size="sm"
                checked={checked}
                indeterminate={indeterminate}
                disabled={isSuperAdminRole}
                onChange={() => handleToggleAction(row, "delete")}
                title={
                  isSuperAdminRole
                    ? "Super Admin has unrestricted access"
                    : `Toggle Delete permission for ${row.displayName}`
                }
              />
            </div>
          );
        },
      },
      {
        id: "summary",
        field: "summary",
        headerName: "Access Level",
        width: 130,
        render: (_, row) => {
          if (isSuperAdminRole) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <Lock size={11} /> Unrestricted
              </span>
            );
          }
          const acts = permissionsMap[row.menuCode] || [];
          if (acts.length === 4) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Full Access
              </span>
            );
          }
          if (acts.length === 1 && acts[0] === "view") {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                View Only
              </span>
            );
          }
          if (acts.length > 0) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Custom ({acts.length}/4)
              </span>
            );
          }
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
              No Access
            </span>
          );
        },
      },
    ];
  }, [
    getActionState,
    getFullAccessState,
    handleToggleAction,
    handleToggleRowAll,
    isSuperAdminRole,
    permissionsMap,
  ]);

  // Save handler
  const handleSave = async () => {
    const isValid = formInstance.methods.validate();
    if (!isValid) return;
    const formData = formInstance.methods.getValues();

    const payload = {
      ...formData,
      permissions: permissionsMap,
      ...(roleId ? { _id: roleId } : {}),
    };

    const res = await apiCall({
      id: "saveRole",
      api: api + apiEndpoints.administration.role.RoleAddEdit,
      payload,
    });

    if (res?.success) {
      successAlert({
        title: "Role Saved",
        text: res.message || "Role and permissions saved successfully.",
      });
      navigate("/administration/roles");
    } else if (!res?.error) {
      errorAlert({
        title: "Error",
        text: res?.message || "Failed to save role.",
      });
    }
  };

  const handleClear = () => {
    formInstance.methods.setValues(initialValue);
    setPermissionsMap({});
  };

  const handleBack = () => {
    navigate("/administration/roles");
  };

  const isLoading =
    isPending("getMenuTree") || isPending("getRoleById") || isPending("saveRole");

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <HpHeader
        title={
          roleId
            ? `Edit Role & Permissions: ${formInstance.methods.getValues()?.roleName || "Role"}`
            : "Create Role & Permissions"
        }
      />

      <div className="flex-1 p-4 pb-20 overflow-y-auto max-w-7xl w-full mx-auto space-y-4">
        {/* Banner / Notice for Super Admin */}
        {isSuperAdminRole && (
          <div className="flex items-center gap-3 p-3.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-900 text-xs shadow-xs">
            <Lock size={16} className="text-purple-600 shrink-0" />
            <p>
              <strong className="font-semibold">Super Administrator</strong> has full,
              unrestricted access hardcoded across every module in the application. Permissions
              cannot be revoked for this system role.
            </p>
          </div>
        )}

        {/* 1. Role Basic Information Card */}
        <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.06)]">
          <div className="flex h-10 items-center justify-between border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[#2999a8]" />
              <h2 className="text-[13px] font-bold tracking-wide text-[#334155]">
                Role Information
              </h2>
            </div>
            {roleData?.isSystemDefault && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                System Built-in Role
              </span>
            )}
          </div>

          <div className="p-4">
            <FormRenderer
              formMethod={formInstance}
              formSchema={schemaArray}
            />
          </div>
        </div>

        {/* 2. Permission Matrix Card with HpGrid */}
        <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.06)] flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[#2999a8]" />
              <h2 className="text-[13px] font-bold tracking-wide text-[#334155]">
                Module Permissions Matrix
              </h2>
            </div>

            {/* Quick Presets Action Bar */}
            {!isSuperAdminRole && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleGrantAllGlobal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
                  title="Grant full view, add, edit, and delete across all modules"
                >
                  <CheckSquare size={13} />
                  <span>Grant All Access</span>
                </button>
                <button
                  type="button"
                  onClick={handleGrantReadOnlyGlobal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                  title="Grant read/view access only to all modules"
                >
                  <Eye size={13} />
                  <span>View Only Preset</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllGlobal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
                  title="Revoke all module access"
                >
                  <Square size={13} />
                  <span>Revoke All</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-3 flex-1 min-h-[480px]">
            <HpGrid
              id="rolePermissionsGrid"
              rowData={gridRows}
              colDef={permissionColDef}
              expand={true}
              defaultExpanded={false}
              treeField="displayName"
              childrenField="children"
              parentIdField="parentMenu"
              searchable={true}
              searchPlaceholder="Filter permissions by module name or code..."
              columnFilterable={true}
              style={{ height: "540px", minHeight: "450px" }}
              panding={isLoading}
            />
          </div>
        </div>
      </div>

      <HpFooter
        onBack={handleBack}
        onClear={isSuperAdminRole ? undefined : handleClear}
        onSave={handleSave}
      />
    </div>
  );
};

export default Role;
