import { createContext, useContext } from "react";

/**
 * RouteAccessContext
 * ---------------------------------------------------------------------------
 * Rights for the page being shown, provided by MainLayout from the menu that
 * matches the URL. HpGrid, HpCommonModal and HpFooter read it to hide/disable
 * Add, Save, Edit and Delete.
 *
 * `intent` remembers whether the user opened a form to add or to edit, so
 * a form can tell which right applies ("add" needs Add, "edit" needs Edit).
 *
 * The default grants everything, so the shared components behave as before
 * anywhere outside a permission-checked page.
 * ---------------------------------------------------------------------------
 */

export const FULL_ACCESS = {
  menuCode: null,
  canView: true,
  canAdd: true,
  canEdit: true,
  canDelete: true,
  intent: null,
  setIntent: () => {},
};

const RouteAccessContext = createContext(FULL_ACCESS);

export const useRouteAccess = () => useContext(RouteAccessContext);

// Can the user save the form that's open? Unknown intent: either right.
export const canSaveForm = (access, intent = access.intent) => {
  if (intent === "add") return access.canAdd;
  if (intent === "edit") return access.canEdit;
  return access.canAdd || access.canEdit;
};

// Longest active menu path that the URL starts with.
export const findRouteMenu = (routes = [], pathname = "") => {
  const path = pathname.replace(/\/+$/, "") || "/";
  let best = null;
  routes.forEach((route) => {
    const base = String(route.path || "").replace(/\/+$/, "");
    if (!base) return;
    if (path === base || path.startsWith(`${base}/`)) {
      if (!best || base.length > best.path.length) best = { ...route, path: base };
    }
  });
  return best;
};

export default RouteAccessContext;
