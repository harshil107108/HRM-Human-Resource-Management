import { Search, Bell, Mail, Globe, Menu, X, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NAVIGATION_SCHEMA } from "@utils/Routes.js";

const SEARCH_ITEMS = NAVIGATION_SCHEMA.flatMap((item) =>
  item.children?.length
    ? item.children.map((child) => ({
      label: child.label,
      category: item.label,
      path: child.path,
    }))
    : [{ label: item.label, category: "", path: item.path }],
);

export const Header = ({
  searchQuery,
  setSearchQuery,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  const navigate = useNavigate();
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const suggestions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];

    return SEARCH_ITEMS.filter((item) =>
      `${item.label} ${item.category}`.toLowerCase().includes(term),
    ).slice(0, 6);
  }, [searchQuery]);

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

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-[12px] font-semibold text-slate-900 leading-none">
              Harshil S.
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">
              Administrator
            </p>
          </div>
          <img
            className="w-7 h-7 rounded-full object-cover border border-slate-200"
            alt="Profile picture"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
