import {
  Search,
  Bell,
  Mail,
  Globe,
  MessageSquare,
  Menu,
  X,
  ArrowRight,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCheck,
  CheckSquare,
  Clock,
  Trash2,
  Calendar,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { getUploadUrl } from "@/utils/fileUpload";
import { HpImagePreview } from "@/components/feedback";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const formatTimeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffSec = Math.floor((now - past) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getPriorityMeta = (priority = "Medium") => {
  const p = String(priority).toLowerCase();
  if (p === "urgent" || p === "high") {
    return {
      bg: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20",
      dot: "bg-rose-500",
    };
  }
  if (p === "low") {
    return {
      bg: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
      dot: "bg-emerald-500",
    };
  }
  return {
    bg: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    dot: "bg-amber-500",
  };
};

const getSenderDisplayName = (sender) => {
  if (!sender) return "Admin / HR";
  if (typeof sender === "string") return sender;
  const fullName = [sender.firstName, sender.middleName, sender.lastName].filter(Boolean).join(" ");
  return fullName || "Manager";
};

/**
 * Loud, crisp, and attractive crystal chime sound synthesized with Web Audio API.
 * Uses a resonant 3-note ascending chord (G5 -> C6 -> E6), tuned harmonic overtones,
 * and a 4.5kHz low-pass filter with punchy envelope for high audibility across speakers.
 */
const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Crisp low-pass filter with mild resonance to preserve bright acoustic sheen
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = "lowpass";
    masterFilter.frequency.setValueAtTime(4500, now);
    masterFilter.Q.setValueAtTime(0.7, now);

    // Master volume: louder and punchy so it is easily heard across rooms and laptop speakers
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.42, now);

    masterFilter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // 3-note ascending crystal chime: G5 (784Hz) -> C6 (1046.5Hz) -> E6 (1318.5Hz)
    const notes = [
      { freq: 783.99, delay: 0.0, duration: 0.38, weight: 0.75 },
      { freq: 1046.50, delay: 0.075, duration: 0.45, weight: 0.88 },
      { freq: 1318.51, delay: 0.15, duration: 0.70, weight: 1.0 },
    ];

    notes.forEach(({ freq, delay, duration, weight }) => {
      const startTime = now + delay;
      const stopTime = startTime + duration;

      // Primary tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      // Second harmonic overtone for brilliant acoustic shimmer
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = "sine";
      overtone.frequency.setValueAtTime(freq * 2, startTime);

      // Snappy attack and natural exponential decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.55 * weight, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      overtoneGain.gain.setValueAtTime(0.0001, startTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.12 * weight, startTime + 0.01);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.45);

      osc.connect(gain);
      overtone.connect(overtoneGain);

      gain.connect(masterFilter);
      overtoneGain.connect(masterFilter);

      osc.start(startTime);
      overtone.start(startTime);

      osc.stop(stopTime);
      overtone.stop(stopTime);
    });
  } catch (err) {
    console.warn("[Sound] Notification sound playback skipped:", err);
  }
};

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
  const { isChatOpen, openChat, closeChat, isMinimized, totalUnread } = useChat();
  const SEARCH_ITEMS = useMemo(() => toSearchItems(menus), [menus]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const profileRef = useRef(null);

  const { apiCall } = useApiCall();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef(null);
  const lastUnreadCountRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const filteredNotifications = useMemo(() => {
    if (notifTab === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, notifTab]);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setLoadingNotifs(true);
    try {
      const res = await apiCall({
        id: "getNotifications",
        api: api + apiEndpoints.notification.getNotifications,
        payload: {},
        showErrorAlert: false,
      });

      if (res?.success && res?.data) {
        const payload = res.data?.data || res.data || {};
        const rawList = payload.notifications || res.data?.notifications || (Array.isArray(payload) ? payload : []);
        const count = payload.unreadCount ?? res.data?.unreadCount ?? rawList.filter((n) => !n.isRead).length;

        setNotifications(rawList);
        setUnreadCount(count);

        // Play chime sound when new unread notifications arrive
        if (
          !isInitialLoadRef.current &&
          count > 0 &&
          lastUnreadCountRef.current !== null &&
          count > lastUnreadCountRef.current
        ) {
          playNotificationSound();
        }
        lastUnreadCountRef.current = count;
        isInitialLoadRef.current = false;
      }
    } catch (_) {
      // ignore transient poll error
    } finally {
      if (!isSilent) setLoadingNotifs(false);
    }
  }, [apiCall, user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000); // Check every 10s for real-time task notifications

    const handleFocus = () => fetchNotifications(true);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchNotifications]);

  // Close the notification menu on outside click / Escape.
  useEffect(() => {
    if (!notifOpen) return undefined;
    const onPointerDown = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
    };
    const onKeyDown = (event) => event.key === "Escape" && setNotifOpen(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [notifOpen]);

  const handleMarkAllAsRead = async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await apiCall({
      id: "markAsRead",
      api: api + apiEndpoints.notification.markAsRead,
      payload: { all: true },
      showErrorAlert: false,
    });
  };

  const handleClearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    await apiCall({
      id: "clearNotifications",
      api: api + apiEndpoints.notification.clear,
      payload: {},
      showErrorAlert: false,
    });
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      apiCall({
        id: "markAsRead",
        api: api + apiEndpoints.notification.markAsRead,
        payload: { id: notif._id },
        showErrorAlert: false,
      });
    }
    setNotifOpen(false);
    navigate("/employees/task-management");
  };

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
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex items-center gap-1.5">
          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                if (!notifOpen) fetchNotifications();
              }}
              className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 outline-none focus:outline-none focus-visible:outline-none select-none ${
                notifOpen
                  ? "bg-slate-100 text-blue-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 active:bg-slate-200/60"
              }`}
              title="Notifications"
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <Bell className="w-4 h-4 stroke-[1.8]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white shadow-xs pointer-events-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                role="region"
                aria-label="Notifications panel"
                className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 top-full mt-2 w-[350px] sm:w-[410px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/98 shadow-2xl shadow-slate-900/12 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Header */}
                <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 bg-white">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-slate-900 tracking-tight">Notifications</span>
                      {unreadCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                          {unreadCount} new
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Caught up
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 transition-colors"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Clear all notifications"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Segmented Filter Tabs & Auto-delete info */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="inline-flex items-center bg-slate-100/80 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
                      <button
                        type="button"
                        onClick={() => setNotifTab("all")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          notifTab === "all"
                            ? "bg-white text-slate-900 font-semibold shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        All ({notifications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifTab("unread")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          notifTab === "unread"
                            ? "bg-white text-blue-600 font-semibold shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Unread ({unreadCount})
                      </button>
                    </div>

                    <span
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium"
                      title="Notifications automatically delete after 24 hours"
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      Auto-clears in 24h
                    </span>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80 [scrollbar-width:thin]">
                  {loadingNotifs && notifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Loading notifications...
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50/80 text-blue-600 mb-3 border border-blue-100/60 shadow-2xs">
                        <Inbox className="h-6 w-6 stroke-[1.8]" />
                      </div>
                      <p className="text-[13px] font-semibold text-slate-800">
                        {notifTab === "unread" ? "No unread notifications" : "All caught up"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                        {notifTab === "unread"
                          ? "You have reviewed all current task updates."
                          : "When Admin or HR assigns you tasks, they will appear here. Past updates auto-delete after 24 hours."}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => {
                      const isUnread = !notif.isRead;
                      const priority = notif.metadata?.priority || "Medium";
                      const priorityInfo = getPriorityMeta(priority);
                      const senderName = getSenderDisplayName(notif.sender);

                      return (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-all ${
                            isUnread
                              ? "bg-blue-50/30 hover:bg-blue-50/60"
                              : "bg-white hover:bg-slate-50/80"
                          }`}
                        >
                          {/* Unread Left Border Accent */}
                          {isUnread && (
                            <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-blue-600 rounded-r-full" />
                          )}

                          {/* Left Avatar / Type Icon */}
                          <div className="relative shrink-0 mt-0.5">
                            {notif.sender?.profileImage ? (
                              <img
                                src={getUploadUrl(notif.sender.profileImage)}
                                alt=""
                                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white font-bold text-[11px] shadow-2xs">
                                {initialsOf(senderName)}
                              </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 text-blue-600 shadow-2xs">
                              <CheckSquare className="w-2.5 h-2.5 stroke-[2.5]" />
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-900 truncate">
                                {senderName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>

                            <p className={`text-[12px] leading-snug mt-0.5 line-clamp-2 ${isUnread ? "font-medium text-slate-900" : "text-slate-600"}`}>
                              {notif.message}
                            </p>

                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${priorityInfo.bg}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dot}`} />
                                {priority}
                              </span>

                              {notif.metadata?.dueDate && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  Due {new Date(notif.metadata.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              )}

                              <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                Open Task <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Auto-clears after 24 hours
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/employees/task-management");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>View Task Board</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Internal Chat Button */}
          <button
            type="button"
            onClick={() => {
              if (isChatOpen && !isMinimized) {
                closeChat();
              } else {
                openChat();
              }
            }}
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 outline-none focus:outline-none focus-visible:outline-none select-none ${
              isChatOpen && !isMinimized
                ? "bg-slate-100 text-blue-600 shadow-2xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 active:bg-slate-200/60"
            }`}
            title="Internal Chat"
            aria-label="Internal Chat"
          >
            <MessageSquare className="w-4 h-4 stroke-[1.8]" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white shadow-xs pointer-events-none">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </button>
        </div>

        <div ref={profileRef} className="relative pl-3 border-l border-slate-200">
          <div
            onClick={() => setProfileOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-50 cursor-pointer select-none transition-colors border border-transparent hover:border-slate-200/60"
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
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage({
                    src: getUploadUrl(user.profileImage),
                    alt: user?.name || "Profile Picture",
                  });
                }}
                className="relative group/avatar cursor-pointer focus:outline-none shrink-0"
                title="Click to preview image"
              >
                <img
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 transition-transform duration-200 group-hover/avatar:scale-110 ring-2 ring-transparent group-hover/avatar:ring-blue-400 shadow-xs"
                  alt={user?.name || "Profile Picture"}
                  src={getUploadUrl(user.profileImage)}
                />
              </button>
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[11px] font-bold text-blue-700">
                {initialsOf(user?.name)}
              </span>
            )}
            <ChevronDown className={`hidden md:block h-3.5 w-3.5 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </div>

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

      {/* Full-screen Circular Image Preview (Same as Employee Directory) */}
      {previewImage && (
        <HpImagePreview
          open={Boolean(previewImage)}
          src={previewImage.src}
          alt={previewImage.alt}
          shape="circle"
          onClose={() => setPreviewImage(null)}
        />
      )}
    </header>
  );
};

export default Header;
