import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NoPermission from "@/components/common/NoPermission";

// First page the user may open: Dashboard if allowed, else the first menu.
export const firstAllowedPath = (menus = [], can) => {
  if (can("DASHBOARD", "view")) return "/dashboard";
  for (const group of menus) {
    if (group.children?.length) return group.children[0].path;
    if (group.path) return group.path;
  }
  return null;
};

// Full-screen spinner while a stored session is re-validated.
const SessionLoader = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50" role="status" aria-live="polite">
    <div className="flex flex-col items-center gap-3">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-sky-200 border-t-sky-600" />
      <span className="text-xs font-semibold text-slate-500">Checking your session…</span>
    </div>
  </div>
);

// App pages: signed-in users only (keeps the requested URL for after login).
export function RequireAuth({ children }) {
  const { isAuthenticated, restoring } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (restoring) return <SessionLoader />;
  return children;
}

// Login page: once signed in, go to the page that was asked for (or home).
export function PublicOnly({ children }) {
  const { isAuthenticated, restoring } = useAuth();
  const location = useLocation();
  if (isAuthenticated && !restoring) {
    const from = location.state?.from;
    return <Navigate to={from && from !== "/login" ? from : "/"} replace />;
  }
  return children;
}

// "/" -> the user's first permitted page.
export function HomeRedirect() {
  const { menus, can } = useAuth();
  const target = firstAllowedPath(menus, can);
  if (!target) {
    return (
      <NoPermission
        title="No modules assigned"
        message="Your role doesn't have access to any module yet. Ask your administrator to grant permissions."
        showActions={false}
      />
    );
  }
  return <Navigate to={target} replace />;
}
