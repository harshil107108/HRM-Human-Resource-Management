import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import companyLogo from "@assets/images/companyLogo.png";
import Logo from "@assets/images/Logo.png";
import { NAVIGATION_SCHEMA } from "@utils/Routes.js";

// ==========================================
// SUB-COMPONENTS
// ==========================================

const ParentMenuItem = ({
  icon: Icon,
  label,
  isCollapsed,
  isExpanded,
  hasChildren,
  isActive,
  onClick,
  path,
}) => {
  const content = (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`group w-full flex items-center rounded-md text-[13px] transition-all duration-150 font-medium ${
        isCollapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-1.5"
      } ${
        isActive && !hasChildren
          ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
          : "text-slate-600 hover:bg-blue-50/70 hover:text-blue-700"
      }`}
    >
      <Icon
        className={`w-4 h-4 shrink-0 transition-colors ${
          isActive
            ? "text-blue-600"
            : "text-slate-400 group-hover:text-slate-600"
        }`}
      />

      {!isCollapsed && (
        <span className="flex-1 truncate text-left">{label}</span>
      )}

      {!isCollapsed && hasChildren && (
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isExpanded ? "transform rotate-180" : ""
          }`}
        />
      )}
    </button>
  );

  if (!hasChildren && path) {
    return (
      <NavLink to={path} className="block">
        {() => content}
      </NavLink>
    );
  }

  return content;
};

const NestedSubMenu = ({ children, isCollapsed }) => {
  if (isCollapsed) return null;
  return (
    <ul className="mt-1 pl-4 border-l border-blue-100 ml-4 space-y-1 transition-all duration-200">
      {children.map((sub, index) => (
        <li key={index}>
          <NavLink
            to={sub.path}
            className={({ isActive }) =>
              `block px-3 py-1 text-[12px] font-medium rounded-md transition-all duration-150 ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-500 hover:text-blue-700 hover:bg-blue-50/60"
              }`
            }
          >
            {sub.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

// ==========================================
// MAIN SIDEBAR
// ==========================================

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
}) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({});
  const navigationCollapsed = isCollapsed && !isMobileOpen;

  useEffect(() => {
    const activeGroup = NAVIGATION_SCHEMA.find(
      (item) =>
        item.children &&
        item.children.some((child) => location.pathname.startsWith(child.path)),
    );
    if (activeGroup) {
      setExpandedGroups((prev) => ({
        ...prev,
        [activeGroup.label]: true,
      }));
    }
  }, [location.pathname]);

  const handleGroupToggle = (label) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedGroups({ [label]: true });
      return;
    }

    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleSidebarToggle = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
      return;
    }

    setIsCollapsed((previous) => !previous);
  };

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside
        className={`${isMobileOpen ? "flex" : "hidden"} lg:flex fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-200/80 flex-col pb-4 z-50 shrink-0 transition-all duration-300 ease-in-out`}
        style={{
          width: isMobileOpen
            ? "16rem"
            : navigationCollapsed
              ? "3.5rem"
              : "14rem",
        }}
      >
        {/* Brand Header */}
        <div
          className={`h-14 px-4 flex items-center border-b border-slate-100/80 overflow-hidden ${
            navigationCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center overflow-hidden">
            {navigationCollapsed ? (
              <img
                src={Logo}
                alt="Orvexa"
                className="w-9 h-9 object-contain mx-auto"
              />
            ) : (
              <img
                src={companyLogo}
                alt="Orvexa Enterprise HRM"
                className="h-20 w-auto object-contain"
              />
            )}
          </div>

          {/* Expand/Shrink Toggle Button */}
          <button
            onClick={handleSidebarToggle}
            className="absolute -right-2.75 top-3.5 flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-600 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1 z-50"
            aria-label={
              isMobileOpen || !isCollapsed ? "Close sidebar" : "Expand sidebar"
            }
          >
            {navigationCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Nav Menu */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden pt-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${navigationCollapsed ? "px-1.5" : "px-3"}`}
        >
          <ul className="space-y-0.5">
            {NAVIGATION_SCHEMA.map((item, index) => {
              const hasChildren = !!item.children;
              const isGroupActive = hasChildren
                ? item.children.some((child) =>
                    location.pathname.startsWith(child.path),
                  )
                : location.pathname === item.path;

              const isGroupExpanded = !!expandedGroups[item.label];

              return (
                <li key={index} className="space-y-0.5">
                  <ParentMenuItem
                    icon={item.icon}
                    label={item.label}
                    isCollapsed={navigationCollapsed}
                    isExpanded={isGroupExpanded}
                    hasChildren={hasChildren}
                    isActive={isGroupActive}
                    path={item.path}
                    onClick={() => hasChildren && handleGroupToggle(item.label)}
                  />
                  {hasChildren && isGroupExpanded && (
                    <NestedSubMenu
                      children={item.children}
                      isCollapsed={navigationCollapsed}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
