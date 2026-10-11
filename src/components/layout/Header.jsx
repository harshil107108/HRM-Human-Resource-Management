import { Search, Bell, Mail, Globe, Menu, X, ArrowRight, LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUploadUrl } from "@/utils/fileUpload";

// Searchable pages = the menus this user can open.
const toSearchItems = (menus = []) =>
  menus.flatMap((group) =>
    group.children?.length
      ? group.children.map((child) => ({
        label: child.menuName,
        category: group.menuName,
        path: child.path,
      }))
      : [{ label: group.menuName, category: "", path: group.path }],
  );

const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";

export const Header = ({
  searchQuery,
  setSearchQuery,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  const navigate = useNavigate();
  const { user, menus, logout } = useAuth();
  const SEARCH_ITEMS = useMemo(() => toSearchItems(menus), [menus]);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close the profile menu on outside click / Escape.
  useEffect(() => {
    if (!profileOpen) return undefined;
    const onPointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    const onKeyDown = (event) => event.key === "Escape" && setProfileOpen(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const suggestions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];

    return SEARCH_ITEMS.filter((item) =>
      `${item.label} ${item.category}`.toLowerCase().includes(term),
    ).slice(0, 6);
  }, [searchQuery, SEARCH_ITEMS]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setActiveSuggestionIndex(0);
  };

  const openSearchResult = (path) => {
    navigate(path);
    setSearchQuery("");
    setActiveSuggestionIndex(0);
  };

  const handleSearchKeyDown = (event) => {
    if (!suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((previous) =>
        previous === suggestions.length - 1 ? 0 : previous + 1,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((previous) =>
        previous === 0 ? suggestions.length - 1 : previous - 1,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      openSearchResult(suggestions[activeSuggestionIndex].path);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSearchQuery("");
      setActiveSuggestionIndex(0);
    }
  };

  return (
    <header className="h-14 sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex justify-between items-center px-4 md:px-6">
      {/* Search Input Box */}
      <div className="flex items-center gap-3 flex-1">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
          aria-label={isMobileSidebarOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMobileSidebarOpen}
        >
          {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            className="w-full bg-slate-50 border border-slate-200/80 rounded-md pl-8 pr-3 py-1.5 text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Search dashboard..."
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Search navigation"
            aria-controls="header-search-suggestions"
            aria-expanded={suggestions.length > 0}
            aria-activedescendant={
              suggestions.length > 0
                ? `header-search-option-${activeSuggestionIndex}`
                : undefined
            }
          />
          {suggestions.length > 0 && (
            <div
              id="header-search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-blue-100 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-md"
            >
              {suggestions.map((item, index) => (
                <button
                  key={item.path}
                  id={`header-search-option-${index}`}
                  type="button"
                  role="option"
                  onClick={() => openSearchResult(item.path)}
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                  aria-selected={activeSuggestionIndex === index}
                  className={`group flex w-full items-center justify-between gap-3 rounded-lg border-l-2 px-3 py-2.5 text-left transition-all ${activeSuggestionIndex === index
                    ? "border-blue-500 bg-linear-to-r from-blue-50 to-cyan-50 text-blue-700 shadow-sm"
                    : "border-transparent text-slate-700 hover:border-blue-200 hover:bg-slate-50"
                    }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[13px] font-medium">
                      {item.label}
                    </span>
                    {item.category && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${activeSuggestionIndex === index
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                        }`}>
                        {item.category}
                      </span>
                    )}
                  </span>
                  <ArrowRight className={`h-3.5 w-3.5 shrink-0 transition-opacity ${activeSuggestionIndex === index
                    ? "opacity-100"
                    : "text-slate-300 opacity-0 group-hover:opacity-100"
                    }`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Navigation controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          <button
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
            aria-label="Messages"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
            aria-label="Languages"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>

        <div ref={profileRef} className="relative pl-3 border-l border-slate-200">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <div className="text-right hidden md:block">
              <p className="text-[12px] font-semibold text-slate-900 leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">
                {user?.roleName || ""}
              </p>
            </div>
            {user?.profileImage ? (
              <img
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                alt=""
                src={getUploadUrl(user.profileImage)}
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[11px] font-bold text-blue-700">
                {initialsOf(user?.name)}
              </span>
            )}
            <ChevronDown className={`hidden md:block h-3.5 w-3.5 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">@{user?.username}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  <ShieldCheck className="h-3 w-3" />
                  {user?.roleName}
                </span>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
