import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { useRoleConfig } from "./useRoleConfig";
import {
  Shield,
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import { getMenuIcon } from "@/utils/menuIcons";

const ACTIONS = [
  { key: "view", label: "View (Read)", icon: Eye, color: "text-blue-600", activeBg: "bg-blue-50 border-blue-300 text-blue-700" },
  { key: "add", label: "Add (Create)", icon: Plus, color: "text-emerald-600", activeBg: "bg-emerald-50 border-emerald-300 text-emerald-700" },
  { key: "edit", label: "Edit (Update)", icon: Pencil, color: "text-amber-600", activeBg: "bg-amber-50 border-amber-300 text-amber-700" },
  { key: "delete", label: "Delete", icon: Trash2, color: "text-rose-600", activeBg: "bg-rose-50 border-rose-300 text-rose-700" },
];

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

const RoleModal = ({
  open,
  onClose,
  onModalClose,
  onSaved,
  onSave,
  data,
  extraParams,
  loading,
}) => {
  const { initialValue, schema } = useRoleConfig();
  const [editData, setEditData] = useState(null);
  const [menuTree, setMenuTree] = useState([]);
  const [permissionsMap, setPermissionsMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});

  const { apiCall, isPending } = useApiCall();
  const { successAlert, errorAlert } = useAlert();

  const closeModal = onClose || onModalClose;
  const roleId = extraParams?.id || data?._id;

  // Load Menu Tree for Permissions Matrix
  const fetchMenuTree = useCallback(async () => {
    try {
      const res = await apiCall({
        id: "getMenuTree",
        api: api + apiEndpoints.menu.MenuTree,
        payload: {},
      });
      if (res?.success && Array.isArray(res.data?.data)) {
        setMenuTree(res.data.data);
        // Default expand all top-level groups
        const initialExpanded = {};
        res.data.data.forEach((group) => {
          initialExpanded[group._id] = true;
        });
        setExpandedGroups(initialExpanded);
      }
    } catch (err) {
      console.error("Failed to fetch menu tree:", err);
    }
  }, [apiCall]);

  // Load Role Data
  useEffect(() => {
    if (!open) return;
    fetchMenuTree();

    const fetchRoleById = async () => {
      if (!roleId) {
        setEditData(null);
        setPermissionsMap({});
        return;
      }
      if (data && data._id === roleId) {
        setEditData(data);
        setPermissionsMap(parseIncomingPermissions(data.permissions));
        return;
      }
      try {
        const res = await apiCall({
          id: "getRoleById",
          api: api + apiEndpoints.administration.role.RoleGetByID,
          payload: { _id: roleId },
        });
        if (res?.success && res.data?.data) {
          const role = res.data.data;
          setEditData(role);
          setPermissionsMap(parseIncomingPermissions(role.permissions));
        }
      } catch (err) {
        console.error("Failed to fetch role", err);
      }
    };

    fetchRoleById();
  }, [open, roleId, data, fetchMenuTree, apiCall]);

  const formattedData = useMemo(() => {
    const source = editData || data;
    if (!source) return initialValue;
    return {
      ...source,
      roleName: source.roleName || "",
      roleCode: source.roleCode || "",
      description: source.description || "",
      isSystemDefault: !!source.isSystemDefault,
    };
  }, [editData, data, initialValue]);

  const schemaArray = useMemo(() => {
    return Array.isArray(schema)
      ? schema
      : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
  }, [schema]);

  const formInstance = useMemo(() => {
    return formMethod.createForm({
      schema: schemaArray,
      initialValue: formattedData,
    });
  }, [schemaArray, formattedData]);

  useEffect(() => {
    if (open) {
      formInstance.methods.setValues(formattedData);
    }
  }, [open, formattedData, formInstance]);

  const isSuperAdminRole = formattedData.roleCode === "SUPER_ADMIN";

  // Permission Matrix Helpers
  const isActionChecked = (menuCode, action) => {
    if (isSuperAdminRole) return true;
    return Boolean(permissionsMap[menuCode]?.includes(action));
  };

  const toggleAction = (menuCode, action) => {
    if (isSuperAdminRole) return;
    setPermissionsMap((prev) => {
      const current = prev[menuCode] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];

      const next = { ...prev };
      if (updated.length) {
        next[menuCode] = updated;
      } else {
        delete next[menuCode];
      }
      return next;
    });
  };

  const toggleGroupView = (group) => {
    if (isSuperAdminRole) return;
    const isCurrentlyView = isActionChecked(group.menuCode, "view");
    setPermissionsMap((prev) => {
      const next = { ...prev };
      if (isCurrentlyView) {
        // Disabling group view removes view on group and removes all actions on children
        delete next[group.menuCode];
        (group.children || []).forEach((c) => {
          delete next[c.menuCode];
        });
      } else {
        // Enabling group view
        next[group.menuCode] = ["view"];
        (group.children || []).forEach((c) => {
          if (!next[c.menuCode] || !next[c.menuCode].length) {
            next[c.menuCode] = ["view"];
          }
        });
      }
      return next;
    });
  };

  const grantAllForGroup = (group) => {
    if (isSuperAdminRole) return;
    setPermissionsMap((prev) => {
      const next = { ...prev };
      next[group.menuCode] = ["view", "add", "edit", "delete"];
      (group.children || []).forEach((c) => {
        next[c.menuCode] = ["view", "add", "edit", "delete"];
      });
      return next;
    });
  };

  const clearGroup = (group) => {
    if (isSuperAdminRole) return;
    setPermissionsMap((prev) => {
      const next = { ...prev };
      delete next[group.menuCode];
      (group.children || []).forEach((c) => {
        delete next[c.menuCode];
      });
      return next;
    });
  };

  const grantAllGlobal = () => {
    if (isSuperAdminRole) return;
    const next = {};
    menuTree.forEach((group) => {
      next[group.menuCode] = ["view", "add", "edit", "delete"];
      (group.children || []).forEach((c) => {
        next[c.menuCode] = ["view", "add", "edit", "delete"];
      });
    });
    setPermissionsMap(next);
  };

  const grantReadOnlyGlobal = () => {
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

  const clearAllGlobal = () => {
    if (isSuperAdminRole) return;
    setPermissionsMap({});
  };

  const toggleGroupExpand = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Filtered tree
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return menuTree;
    const query = searchQuery.toLowerCase();
    return menuTree
      .map((group) => {
        const groupMatches = group.menuName.toLowerCase().includes(query) || group.menuCode.toLowerCase().includes(query);
        const matchingChildren = (group.children || []).filter(
          (c) => c.menuName.toLowerCase().includes(query) || c.menuCode.toLowerCase().includes(query)
        );
        if (groupMatches || matchingChildren.length) {
          return {
            ...group,
            children: groupMatches ? group.children : matchingChildren,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [menuTree, searchQuery]);

  const handleSave = async () => {
    const isValid = formInstance.methods.validate();
    if (!isValid) return;
    const formData = formInstance.methods.getValues();

    const payload = {
      ...formData,
      permissions: permissionsMap,
      ...(roleId ? { _id: roleId } : {}),
    };

    if (onSave) {
      onSave(payload);
      return;
    }

    const res = await apiCall({
      id: "saveRole",
      api: api + apiEndpoints.administration.role.RoleAddEdit,
      payload,
    });

    if (res?.success) {
      successAlert({
        title: "Success",
        text: res.message || "Role and permissions saved successfully",
      });
      onSaved?.();
      closeModal?.();
    } else if (!res?.error) {
      errorAlert({
        title: "Error",
        text: res?.message || "Failed to save role",
      });
    }
  };

  const handleClear = () => {
    formInstance.methods.setValues(initialValue);
    setPermissionsMap({});
  };

  return (
    <HpCommonModal
      open={open}
      title={roleId ? `Edit Role: ${formattedData.roleName || "Role"}` : "Create New Role"}
      subTitle="Configure role credentials and fine-grained module access rights"
      size="xl"
      icon={<Shield size={20} />}
      onSave={handleSave}
      onClose={closeModal}
      onClear={handleClear}
      loading={loading || isPending("saveRole") || isPending("getRoleById") || isPending("getMenuTree")}
      showClearButton={!roleId}
      confirmBeforeClose
    >
      <FormRenderer formMethod={formInstance} formSchema={schemaArray} />

      <div className="mt-5 border-t border-slate-200/80 pt-4">
        {/* Header & Global Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              Module Permissions Matrix
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Control what this role can see in the sidebar and perform (Read, Add, Edit, Delete).
            </p>
          </div>

          {!isSuperAdminRole && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={grantAllGlobal}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
              >
                <CheckSquare size={13} /> Grant All
              </button>
              <button
                type="button"
                onClick={grantReadOnlyGlobal}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
              >
                <Eye size={13} /> Read Only All
              </button>
              <button
                type="button"
                onClick={clearAllGlobal}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
              >
                <Square size={13} /> Clear All
              </button>
            </div>
          )}
        </div>

        {isSuperAdminRole && (
          <div className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center gap-2.5 text-xs font-medium">
            <Sparkles size={18} className="text-indigo-600 shrink-0" />
            <span>
              <strong>Super Administrator (SUPER_ADMIN):</strong> This role is permanent and possesses universal, unrestricted access to all modules, APIs, and administrative controls.
            </span>
          </div>
        )}

        {/* Filter Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules or routes (e.g. Master, Candidates, Payroll)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Hierarchical Module Groups */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredTree.map((group) => {
            const GroupIcon = getMenuIcon(group.icon);
            const isGroupVisible = isActionChecked(group.menuCode, "view");
            const isExpanded = !!expandedGroups[group._id];
            const children = group.children || [];

            // Calculate active count
            let activeActionsCount = isGroupVisible ? 1 : 0;
            children.forEach((c) => {
              activeActionsCount += (permissionsMap[c.menuCode] || []).length;
            });
            const totalActions = 1 + children.length * 4;

            return (
              <div
                key={group._id}
                className={`rounded-lg border transition-all ${
                  isGroupVisible
                    ? "bg-white border-slate-200/90 shadow-2xs"
                    : "bg-slate-50/80 border-slate-200 opacity-75"
                }`}
              >
                {/* Group Header */}
                <div className="flex items-center justify-between p-2.5 gap-2 bg-slate-50/50 rounded-t-lg border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleGroupExpand(group._id)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                        <GroupIcon size={14} />
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 tracking-tight block">
                          {group.menuName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {group.menuCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {isSuperAdminRole ? "Full Access" : `${activeActionsCount} active`}
                    </span>

                    {!isSuperAdminRole && (
                      <div className="flex items-center gap-1.5">
                        {/* Parent View Checkbox */}
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 select-none">
                          <input
                            type="checkbox"
                            checked={isGroupVisible}
                            onChange={() => toggleGroupView(group)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={isGroupVisible ? "text-blue-700" : "text-slate-500"}>
                            Show Module
                          </span>
                        </label>

                        {isGroupVisible && (
                          <>
                            <button
                              type="button"
                              onClick={() => grantAllForGroup(group)}
                              className="text-[11px] px-1.5 py-0.5 rounded text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-medium"
                              title="Enable all actions for this module"
                            >
                              All
                            </button>
                            <button
                              type="button"
                              onClick={() => clearGroup(group)}
                              className="text-[11px] px-1.5 py-0.5 rounded text-slate-600 hover:bg-slate-100 border border-slate-200 font-medium"
                              title="Clear all actions for this module"
                            >
                              None
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submodules List */}
                {isExpanded && (
                  <div className="p-2.5">
                    {!isGroupVisible ? (
                      <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-md border border-dashed border-slate-200 flex items-center justify-center gap-1.5">
                        <Lock size={13} />
                        Entire module is disabled. Check <strong>"Show Module"</strong> above to grant access to sub-features.
                      </div>
                    ) : children.length === 0 ? (
                      <div className="text-xs text-slate-400 italic p-2 text-center">
                        Top-level stand-alone module (No submodules).
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {children.map((child) => {
                          return (
                            <div
                              key={child._id}
                              className="py-2 px-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-slate-50/70 rounded transition-colors"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="text-xs font-semibold text-slate-700 block truncate">
                                  {child.menuName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {child.path || child.menuCode}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                {ACTIONS.map((action) => {
                                  const checked = isActionChecked(child.menuCode, action.key);
                                  const IconComponent = action.icon;
                                  return (
                                    <button
                                      key={action.key}
                                      type="button"
                                      disabled={isSuperAdminRole}
                                      onClick={() => toggleAction(child.menuCode, action.key)}
                                      className={`text-[11px] px-2 py-0.5 rounded border font-medium inline-flex items-center gap-1 transition-all select-none ${
                                        checked
                                          ? action.activeBg + " shadow-2xs"
                                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                      } ${isSuperAdminRole ? "cursor-default opacity-80" : "cursor-pointer"}`}
                                      title={`${action.label} on ${child.menuName}`}
                                    >
                                      <IconComponent size={12} className={checked ? "stroke-[2.5]" : "stroke-[1.8]"} />
                                      <span>{action.key.toUpperCase()}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </HpCommonModal>
  );
};

RoleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onModalClose: PropTypes.func,
  onSaved: PropTypes.func,
  onSave: PropTypes.func,
  data: PropTypes.object,
  extraParams: PropTypes.object,
  loading: PropTypes.bool,
};

export default RoleModal;
