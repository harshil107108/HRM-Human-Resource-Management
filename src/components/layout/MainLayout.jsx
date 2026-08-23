import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState("Dashboard");

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
        <main className="min-w-0 flex-1 ml-1 overflow-x-hidden overflow-y-auto bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
