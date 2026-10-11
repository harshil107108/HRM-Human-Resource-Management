import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import { HpPageLoader } from "@/components/feedback";
import NoPermission from "@/components/common/NoPermission";
import { useAuth } from "@/context/AuthContext";
import RouteAccessContext, { findRouteMenu } from "@/context/RouteAccessContext";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const location = useLocation();
  const matches = useMatches();
  const mainRef = useRef(null);

  // Rights for the page in view, from the menu matching the URL.
  const { routes, can } = useAuth();
  const [intent, setIntent] = useState(null);
  const [intentPath, setIntentPath] = useState(location.pathname);
  // A new page starts without a remembered add/edit intent... except the
  // add/edit page a listing just opened, which keeps it.
  if (intentPath !== location.pathname) {
    setIntentPath(location.pathname);
    if (!location.pathname.startsWith(intentPath)) setIntent(null);
  }
  const routeMenu = findRouteMenu(routes, location.pathname);
  const access = useMemo(() => {
    // Pages that aren't menu items (e.g. profile pages) only need sign-in.
    if (!routeMenu) {
      return { menuCode: null, canView: true, canAdd: true, canEdit: true, canDelete: true, intent, setIntent };
    }
    const code = routeMenu.menuCode;
    return {
      menuCode: code,
      canView: can(code, "view"),
      canAdd: can(code, "add"),
      canEdit: can(code, "edit"),
      canDelete: can(code, "delete"),
      intent,
      setIntent,
    };
  }, [routeMenu, can, intent]);

  // Routes flagged with `handle: { pageLoader: true }` (add/edit forms) stay
  // covered by a branded loader until their data has loaded and painted.
  const usesPageLoader = matches.some((match) => match.handle?.pageLoader);
  const [readyKey, setReadyKey] = useState(null);
  const pageLoading = usesPageLoader && readyKey !== location.key;

  // The content area is the scroll container, so a new page would otherwise
  // open at the previous page's scroll position.
  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  return (
    <div
      className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-700 antialiased"
      style={{ "--sidebar-width": isCollapsed ? "3.5rem" : "14rem" }}
    >
      {/* Sidebar Component */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Panel Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header Component */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />

        {/* Content Canvas */}
        <main
          ref={mainRef}
          className={`min-w-0 flex-1 ml-1 overflow-x-hidden bg-slate-50/50 ${pageLoading ? "overflow-y-hidden" : "overflow-y-auto"}`}
        >
          <div
            key={location.pathname}
            className="hp-route-view"
            inert={pageLoading || undefined}
            aria-busy={pageLoading || undefined}
          >
            <RouteAccessContext.Provider value={access}>
              {access.canView ? <Outlet /> : <NoPermission />}
            </RouteAccessContext.Provider>
          </div>
        </main>

        {usesPageLoader && access.canView && (
          <HpPageLoader
            key={location.key}
            containerRef={mainRef}
            onReady={() => setReadyKey(location.key)}
          />
        )}
      </div>
    </div>
  );
};

export default MainLayout;
