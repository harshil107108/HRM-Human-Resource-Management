import React, { useLayoutEffect, useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import { HpPageLoader, toast } from "@/components/feedback";
import NoPermission from "@/components/common/NoPermission";
import { useAuth } from "@/context/AuthContext";
import RouteAccessContext, { findRouteMenu } from "@/context/RouteAccessContext";
import FloatingTaskMenu from "@/components/FloatingTaskMenu";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import DayReportLockedOverlay from "@/pages/Employee/DayReport/DayReportLockedOverlay";
import ChatWidget from "@/components/chat/ChatWidget";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const location = useLocation();
  const matches = useMatches();
  const mainRef = useRef(null);
  const { apiCall } = useApiCall();

  // Rights for the page in view, from the menu matching the URL.
  const { routes, can, user, isSuperAdmin } = useAuth();
  const isSupervisor =
    isSuperAdmin ||
    ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER", "TEAM_LEADER", "TL", "LEAD"].includes(
      String(user?.roleCode || user?.role || "").toUpperCase()
    );
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

  // Routes flagged with `handle: { pageLoader: true }` or containing `/addedit` stay
  // covered by a branded loader until their data has loaded and painted.
  const usesPageLoader =
    matches.some((match) => match.handle?.pageLoader) ||
    location.pathname.includes("/addedit");
  const [readyKey, setReadyKey] = useState(null);
  const pageLoading = usesPageLoader && readyKey !== location.key;

  // The content area is the scroll container, so a new page would otherwise
  // open at the previous page's scroll position.
  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  // Track if today's Day Report is locked across the HRM application
  const [isTodayReportLocked, setIsTodayReportLocked] = useState(() => {
    try {
      return sessionStorage.getItem("hrm.todayReportLocked") === "true";
    } catch {
      return false;
    }
  });

  const checkLockStatus = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await apiCall({
        id: "checkDayReportLock",
        api: `${api}${apiEndpoints.employee.dayReport.getDayReport}`,
        payload: { date: today },
        silent: true,
      });
      if (res?.success) {
        const report = res.data?.data;
        const locked =
          !report?.unlockedBySupervisor && report?.status === "Locked";
        setIsTodayReportLocked(locked);
        try {
          if (locked) {
            sessionStorage.setItem("hrm.todayReportLocked", "true");
          } else {
            sessionStorage.removeItem("hrm.todayReportLocked");
          }
        } catch (e) {}
      }
    } catch (err) {
      // silent check
    }
  }, [apiCall]);

  // Re-verify lock status whenever the user navigates or manually types a route
  useEffect(() => {
    checkLockStatus();
  }, [location.pathname, checkLockStatus]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const handleLockEvent = (e) => {
      const eventDate = e?.detail?.date;
      if (!eventDate || eventDate === today) {
        const locked = !!e?.detail?.isLocked;
        setIsTodayReportLocked(locked);
        try {
          if (locked) {
            sessionStorage.setItem("hrm.todayReportLocked", "true");
          } else {
            sessionStorage.removeItem("hrm.todayReportLocked");
          }
        } catch (err) {}
      }
    };
    window.addEventListener("dayReportLockChanged", handleLockEvent);
    window.addEventListener("dayReportUpdated", checkLockStatus);

    return () => {
      window.removeEventListener("dayReportLockChanged", handleLockEvent);
      window.removeEventListener("dayReportUpdated", checkLockStatus);
    };
  }, [checkLockStatus]);

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

      {/* AssistiveTouch Floating Task Shortcut Launcher */}
      <FloatingTaskMenu
        isLocked={isTodayReportLocked}
        onTaskSelect={async (task) => {
          toast.info({
            title: task.label,
            message: `Timer active for ${task.label}`,
          });

          // Sync break/task status to backend so other users see it in Employee Directory
          try {
            await apiCall({
              id: "updateMyActivityStatus",
              api: `${api}${apiEndpoints.dashboard.updateActivityStatus}`,
              payload: {
                employeeId:
                  user?.employee?._id ||
                  user?.employeeRef ||
                  user?._id ||
                  user?.id,
                email: user?.email,
                employeeCode: user?.employeeCode,
                status: task?.label || "Active",
              },
              silent: true,
            });
          } catch (e) {
            console.error("Failed to sync activity status to server:", e);
          }
        }}
        onTaskStop={async (session) => {
          const elapsedMinutes = Math.max(
            1,
            Math.round((session.elapsedSeconds || 0) / 60)
          );
          const formatTimeStr = (d) => {
            const dt = d ? new Date(d) : new Date();
            return dt.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          };

          const taskCategory = session.task?.category || "Break";
          let activityType = "Break";
          if (taskCategory === "Meeting" || taskCategory === "Collab") {
            activityType = "Meeting";
          } else if (taskCategory === "Focus" || taskCategory === "Work") {
            activityType = "Task";
          }

          // Reset status on server back to Active
          try {
            await apiCall({
              id: "resetMyActivityStatus",
              api: `${api}${apiEndpoints.dashboard.updateActivityStatus}`,
              payload: {
                employeeId:
                  user?.employee?._id ||
                  user?.employeeRef ||
                  user?._id ||
                  user?.id,
                email: user?.email,
                employeeCode: user?.employeeCode,
                status: "Active",
              },
              silent: true,
            });
          } catch (e) {
            console.error("Failed to reset activity status:", e);
          }

          try {
            await apiCall({
              id: "addDayReportActivity",
              api: `${api}${apiEndpoints.employee.dayReport.addActivity}`,
              payload: {
                date: (session.startTime || new Date())
                  .toISOString()
                  .split("T")[0],
                type: activityType,
                title: session.task?.label || "Activity",
                category: taskCategory,
                startTime: formatTimeStr(session.startTime),
                endTime: formatTimeStr(session.endTime),
                durationMinutes: elapsedMinutes,
                remarks: session.note || "",
                status: "Completed",
              },
              silent: true,
            });

            window.dispatchEvent(
              new CustomEvent("dayReportUpdated", {
                detail: {
                  date: (session.startTime || new Date())
                    .toISOString()
                    .split("T")[0],
                },
              })
            );

            toast.success({
              title: `${session.task?.label || "Activity"} Logged`,
              message: `${session.formattedTime} logged to today's Day Report!`,
            });
          } catch (err) {
            console.error("Failed to auto-log activity to Day Report:", err);
            toast.success({
              title: `${session.task?.label || "Task"} Finished`,
              message: `Duration: ${session.formattedTime}`,
            });
          }
        }}
      />

      {/* Global Centered Blurred Lock Screen: shown across the app for regular employees when today's Day Report is locked */}
      {!isSupervisor &&
        isTodayReportLocked &&
        !location.pathname.includes("/day-report") && (
          <DayReportLockedOverlay
            isLocked={true}
            date={new Date().toISOString().split("T")[0]}
            canUnlock={false}
            onRefresh={checkLockStatus}
          />
        )}

      {/* Internal Chat Widget (Bottom Right) */}
      <ChatWidget />
    </div>
  );
};

export default MainLayout;
