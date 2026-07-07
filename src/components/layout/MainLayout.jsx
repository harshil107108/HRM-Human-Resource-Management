import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-700 antialiased">
      {/* Sidebar Component */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Panel Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header Component */}
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-3 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
