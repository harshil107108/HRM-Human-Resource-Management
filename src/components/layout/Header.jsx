import React from "react";
import { Search, Plus, Bell, Mail, Globe } from "lucide-react";

export const Header = ({ searchQuery, setSearchQuery, onQuickAdd }) => {
  return (
    <header className="h-14 sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex justify-between items-center px-4 md:px-6">
      {/* Search Input Box */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            className="w-full bg-slate-50 border border-slate-200/80 rounded-md pl-8 pr-3 py-1.5 text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Search dashboard..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
