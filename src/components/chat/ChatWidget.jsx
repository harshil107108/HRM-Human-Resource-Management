import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  MessageSquare,
  Search,
  X,
  Minus,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  SendHorizontal,
  Smile,
  Check,
  CheckCheck,
  Users,
  ShieldCheck,
  Briefcase,
  Mail,
  Lock,
  Clock,
} from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { getUploadUrl } from "@/utils/fileUpload";
import { HpImagePreview } from "@/components/feedback";

const EMOJI_PALETTE = [
  "👋", "👍", "❤️", "😊", "🔥", "🎉", "✅", "🚀",
  "🙌", "👏", "💯", "🤝", "💡", "⭐", "👌", "🙏",
];

const formatChatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatMessageDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

// Deterministic pastel avatar background for colleagues without an uploaded picture
const getAvatarGradient = (name = "") => {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-blue-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const ChatWidget = () => {
  const { user } = useAuth();
  const {
    isChatOpen,
    setIsChatOpen,
    isMinimized,
    setIsMinimized,
    activeColleague,
    setActiveColleague,
    selectColleague,
    openChat,
    closeChat,
    incomingToast,
    dismissIncomingToast,
    colleagues,
    messages,
    loadingMessages,
    isColleagueOnline,
    isColleagueTyping,
    totalUnread,
    sendMessage,
    sendTypingStatus,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread'
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Auto-scroll messages to bottom
  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    if (activeColleague && messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [activeColleague, messages.length, scrollToBottom]);

  // Focus input when a conversation is opened
  useEffect(() => {
    if (activeColleague && !isMinimized && isChatOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [activeColleague, isMinimized, isChatOpen]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return undefined;
    const handleOutsideClick = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showEmojiPicker]);

  // Filter colleagues list
  const filteredColleagues = useMemo(() => {
    let list = colleagues;
    if (activeTab === "unread") {
      list = list.filter((c) => (c.unreadCount || 0) > 0);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.designation && c.designation.toLowerCase().includes(q)) ||
          (c.department && c.department.toLowerCase().includes(q))
      );
    }
    return list;
  }, [colleagues, activeTab, searchQuery]);

  const onlineCount = useMemo(() => {
    return colleagues.filter((c) => isColleagueOnline(c._id)).length;
  }, [colleagues, isColleagueOnline]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (activeColleague?._id) {
      sendTypingStatus(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 2000);
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInputText("");
    setShowEmojiPicker(false);
    sendTypingStatus(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTimeout(() => scrollToBottom("smooth"), 40);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleAvatarPreview = (e, person) => {
    e.stopPropagation();
    if (person?.profileImage) {
      setPreviewImage({
        src: getUploadUrl(person.profileImage),
        alt: person.name || "Colleague Photo",
      });
    }
  };

  // Group messages chronologically with hairline date dividers
  const groupedMessages = [];
  let lastDateStr = null;
  messages.forEach((msg) => {
    const dateStr = formatMessageDate(msg.createdAt);
    if (dateStr !== lastDateStr) {
      groupedMessages.push({
        type: "date-divider",
        date: dateStr,
        _id: `date-${dateStr}-${msg._id || msg.tempId}`,
      });
      lastDateStr = dateStr;
    }
    groupedMessages.push({
      type: "message",
      data: msg,
      _id: msg._id || msg.tempId,
    });
  });

  return (
    <>
      {/* Floating Incoming Chat Message Notification Toast (top-right under header) */}
      {incomingToast && (
        <div
          role="alert"
          aria-live="assertive"
          onClick={() => openChat(incomingToast.senderColleague || incomingToast.senderId)}
          className="fixed top-20 right-4 sm:right-6 z-[70] w-[340px] sm:w-[380px] p-3.5 rounded-2xl bg-white/98 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-950/15 cursor-pointer hover:shadow-slate-950/20 hover:border-blue-200 transition-all duration-200 group animate-in fade-in slide-in-from-top-3 select-none"
        >
          <div className="flex items-start gap-3">
            {/* Colleague Avatar */}
            <div className="relative shrink-0 mt-0.5">
              {incomingToast.senderAvatar ? (
                <img
                  src={getUploadUrl(incomingToast.senderAvatar)}
                  alt={incomingToast.senderName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 shadow-2xs"
                />
              ) : (
                <div
                  className={`flex w-10 h-10 items-center justify-center rounded-full bg-linear-to-br ${getAvatarGradient(
                    incomingToast.senderName
                  )} text-white font-bold text-xs shadow-2xs`}
                >
                  {initialsOf(incomingToast.senderName)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[13px] font-bold text-slate-900 truncate">
                    {incomingToast.senderName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                    New message
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissIncomingToast();
                  }}
                  className="p-1 -mr-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors outline-none focus:outline-none"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </div>

              <p className="text-[12px] text-slate-600 line-clamp-2 leading-relaxed">
                {incomingToast.messageText}
              </p>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400">Click to reply</span>
                <span className="font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                  Open chat
                  <ArrowRight className="w-3 h-3 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Sleek Pill */}
      {isChatOpen && isMinimized && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/25 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-150 group border border-slate-700/60"
          >
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              {totalUnread > 0 && (
                <span className="absolute -top-2 -right-2.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-xs">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </div>
            <span className="text-[12.5px] font-medium text-slate-100 tracking-tight">
              {activeColleague ? activeColleague.name : "Internal Chat"}
            </span>
            <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      )}

      {/* Full Chat Window */}
      {isChatOpen && !isMinimized && (
        <div
          role="dialog"
          aria-label="Internal Chat Widget"
          className="fixed bottom-4 right-4 sm:right-6 z-50 flex flex-col w-[360px] sm:w-[410px] h-[590px] max-h-[86vh] rounded-2xl bg-white/98 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/16 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
        {/* Industry-Standard Header: Sleek, Crisp, White/Slate Aesthetic */}
        <header className="flex items-center justify-between px-3.5 py-3 bg-white border-b border-slate-200/80 shrink-0 select-none">
          {activeColleague ? (
            /* Active Thread Top Bar */
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setActiveColleague(null)}
                className="p-1.5 -ml-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Back to colleagues"
                aria-label="Back to colleagues list"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              </button>

              {/* Colleague Avatar (Previewable on click) */}
              <div
                className="relative shrink-0 cursor-pointer group/avatar"
                onClick={(e) => handleAvatarPreview(e, activeColleague)}
                title={activeColleague.profileImage ? "Click to preview photo" : activeColleague.name}
              >
                {activeColleague.profileImage ? (
                  <img
                    src={getUploadUrl(activeColleague.profileImage)}
                    alt={activeColleague.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 transition-transform group-hover/avatar:scale-105"
                  />
                ) : (
                  <div
                    className={`flex w-9 h-9 items-center justify-center rounded-full bg-linear-to-br ${getAvatarGradient(
                      activeColleague.name
                    )} text-white font-bold text-xs shadow-2xs`}
                  >
                    {initialsOf(activeColleague.name)}
                  </div>
                )}
                {isColleagueOnline(activeColleague._id) && (
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                    title="Online"
                  />
                )}
              </div>

              {/* Name & Presence Info */}
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold text-slate-900 truncate leading-snug">
                  {activeColleague.name}
                </h3>
                <div className="text-[11px] leading-tight flex items-center gap-1.5">
                  {isColleagueTyping(activeColleague._id) ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      typing...
                    </span>
                  ) : isColleagueOnline(activeColleague._id) ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active now
                    </span>
                  ) : (
                    <span className="text-slate-400 truncate">
                      {activeColleague.designation || "Colleague"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Directory View Top Bar */
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <MessageSquare className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold tracking-tight text-slate-900">
                    Internal Chat
                  </h3>
                  {totalUnread > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                      {totalUnread} new
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{onlineCount} online</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-400 font-medium" title="All chat messages automatically delete after 24 hours">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Auto-clears in 24h
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Window action buttons */}
          <div className="flex items-center gap-0.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Minimize chat"
              aria-label="Minimize chat"
            >
              <Minus className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              type="button"
              onClick={closeChat}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close chat"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        {activeColleague ? (
          /* =========================================================================
             CONVERSATION THREAD VIEW
             ========================================================================= */
          <div className="flex flex-col flex-1 min-h-0 bg-slate-50/70">
            {/* Scrollable Messages Stream */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 [scrollbar-width:thin]">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px]">Loading conversation...</span>
                </div>
              ) : (
                /* Telegram/Slack-style Welcome Hero Header */
                <div className="my-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center flex flex-col items-center">
                  <div
                    className="relative mb-2 cursor-pointer group/hero"
                    onClick={(e) => handleAvatarPreview(e, activeColleague)}
                    title={activeColleague.profileImage ? "Click to preview full photo" : activeColleague.name}
                  >
                    {activeColleague.profileImage ? (
                      <img
                        src={getUploadUrl(activeColleague.profileImage)}
                        alt={activeColleague.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100 transition-transform group-hover/hero:scale-105 shadow-xs"
                      />
                    ) : (
                      <div
                        className={`flex w-14 h-14 items-center justify-center rounded-full bg-linear-to-br ${getAvatarGradient(
                          activeColleague.name
                        )} text-white font-bold text-lg shadow-xs`}
                      >
                        {initialsOf(activeColleague.name)}
                      </div>
                    )}
                    {isColleagueOnline(activeColleague._id) && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <h4 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                    {activeColleague.name}
                  </h4>

                  <div className="flex items-center justify-center gap-1.5 flex-wrap mt-1">
                    {activeColleague.designation && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <Briefcase className="w-2.5 h-2.5" />
                        {activeColleague.designation}
                      </span>
                    )}
                    {activeColleague.department && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                        {activeColleague.department}
                      </span>
                    )}
                  </div>

                  {activeColleague.email && (
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                      <Mail className="w-3 h-3 text-slate-300" />
                      {activeColleague.email}
                    </p>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10.5px] text-slate-400 font-medium">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Direct internal chat</span>
                    <span className="text-slate-300">•</span>
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span className="text-slate-600 font-medium">Auto-clears in 24h</span>
                  </div>
                </div>
              )}

              {/* Message Items with Hairline Date Dividers */}
              {groupedMessages.map((item) => {
                if (item.type === "date-divider") {
                  return (
                    <div key={item._id} className="relative flex items-center justify-center my-4 select-none">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200/80" />
                      </div>
                      <span className="relative bg-slate-50 px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase text-slate-400 shadow-2xs">
                        {item.date}
                      </span>
                    </div>
                  );
                }

                const msg = item.data;
                const isMine =
                  (typeof msg.sender === "object" ? msg.sender?._id : msg.sender) === user?._id;

                return (
                  <div
                    key={item._id}
                    className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    {!isMine && (
                      <div
                        className="shrink-0 mb-0.5 cursor-pointer group/sender-avatar"
                        onClick={(e) => handleAvatarPreview(e, activeColleague)}
                        title={activeColleague.profileImage ? "Click to preview photo" : activeColleague.name}
                      >
                        {activeColleague.profileImage ? (
                          <img
                            src={getUploadUrl(activeColleague.profileImage)}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 transition-transform group-hover/sender-avatar:scale-110"
                          />
                        ) : (
                          <div
                            className={`flex w-6 h-6 items-center justify-center rounded-full bg-linear-to-br ${getAvatarGradient(
                              activeColleague.name
                            )} text-white font-bold text-[9px]`}
                          >
                            {initialsOf(activeColleague.name)}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`relative group max-w-[78%] px-3.5 py-2 text-[12.5px] leading-relaxed shadow-xs transition-shadow ${
                        isMine
                          ? "bg-blue-600 text-white rounded-2xl rounded-tr-xs"
                          : "bg-white border border-slate-200/90 text-slate-800 rounded-2xl rounded-tl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words select-text">{msg.message}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[9.5px] ${
                          isMine ? "text-blue-100/90" : "text-slate-400"
                        }`}
                      >
                        <span>{formatChatTime(msg.createdAt)}</span>
                        {isMine && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-200 stroke-[2.4]" title="Read" />
                            ) : (
                              <Check className="w-3 h-3 text-blue-200 stroke-[2]" title="Sent" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Real-Time Typing Bubble */}
              {isColleagueTyping(activeColleague._id) && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-600">
                      {initialsOf(activeColleague.name)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Quick Emoji Picker Popover */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="mx-3 mb-2 p-2 bg-white/98 rounded-xl border border-slate-200 shadow-lg shadow-slate-900/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Reactions
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_PALETTE.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-100 active:scale-90 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Card: Modern Elevated Compose Box */}
            <div className="p-3 bg-white border-t border-slate-200/80">
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all p-2 flex flex-col gap-1.5 shadow-2xs">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeColleague.name.split(" ")[0]}...`}
                  className="w-full bg-transparent border-0 resize-none outline-none text-[12.5px] text-slate-800 placeholder-slate-400 leading-relaxed max-h-24 [scrollbar-width:thin]"
                />

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        showEmojiPicker
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                      }`}
                      title="Insert emoji"
                      aria-label="Insert emoji"
                    >
                      <Smile className="w-4 h-4 stroke-[1.8]" />
                    </button>
                    <span className="text-[10px] text-slate-400 hidden sm:inline select-none">
                      Enter ↵ to send
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className={`h-7 px-3 rounded-lg flex items-center gap-1 text-[11.5px] font-semibold transition-all ${
                      inputText.trim()
                        ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs"
                        : "bg-slate-200/70 text-slate-400 cursor-not-allowed"
                    }`}
                    title="Send message"
                    aria-label="Send message"
                  >
                    <span>Send</span>
                    <SendHorizontal className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             COLLEAGUES DIRECTORY / CONVERSATION LIST VIEW
             ========================================================================= */
          <div className="flex flex-col flex-1 min-h-0 bg-white">
            {/* Search Input Box */}
            <div className="p-3 border-b border-slate-100 space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search colleagues by name, role or dept..."
                  className="w-full pl-8.5 pr-8 py-1.5 text-[12px] bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center bg-slate-100/80 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 py-1 rounded-md transition-all text-center ${
                    activeTab === "all"
                      ? "bg-white text-slate-900 font-semibold shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All ({colleagues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`flex-1 py-1 rounded-md transition-all text-center flex items-center justify-center gap-1.5 ${
                    activeTab === "unread"
                      ? "bg-white text-blue-600 font-semibold shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>Unread</span>
                  {totalUnread > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                      {totalUnread}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Colleagues Scroll List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 [scrollbar-width:thin]">
              {filteredColleagues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2.5">
                    <Users className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <p className="text-[13px] font-semibold text-slate-800">No colleagues found</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[210px] leading-relaxed">
                    {searchQuery
                      ? "No results matching your filter query."
                      : "No colleagues available in your organization."}
                  </p>
                </div>
              ) : (
                filteredColleagues.map((colleague) => {
                  const online = isColleagueOnline(colleague._id);
                  const typing = isColleagueTyping(colleague._id);
                  const hasUnread = (colleague.unreadCount || 0) > 0;

                  return (
                    <div
                      key={colleague._id}
                      onClick={() => selectColleague(colleague)}
                      className={`group flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                        hasUnread
                          ? "bg-blue-50/30 hover:bg-blue-50/60"
                          : "hover:bg-slate-50/90"
                      }`}
                    >
                      {/* Avatar with Image Preview Click */}
                      <div
                        className="relative shrink-0 cursor-pointer group/colleague-avatar"
                        onClick={(e) => handleAvatarPreview(e, colleague)}
                        title={colleague.profileImage ? "Click to view full photo" : colleague.name}
                      >
                        {colleague.profileImage ? (
                          <img
                            src={getUploadUrl(colleague.profileImage)}
                            alt={colleague.name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 transition-transform group-hover/colleague-avatar:scale-105 shadow-2xs"
                          />
                        ) : (
                          <div
                            className={`flex w-10 h-10 items-center justify-center rounded-full bg-linear-to-br ${getAvatarGradient(
                              colleague.name
                            )} text-white font-bold text-[12px] shadow-2xs`}
                          >
                            {initialsOf(colleague.name)}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                            online ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                          title={online ? "Online" : "Offline"}
                        />
                      </div>

                      {/* Colleague Information & Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`text-[12.5px] truncate ${
                                hasUnread ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                              }`}
                            >
                              {colleague.name}
                            </span>
                            {colleague.role && colleague.role === "SUPER_ADMIN" && (
                              <span className="shrink-0 px-1 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                                Admin
                              </span>
                            )}
                          </div>
                          {colleague.lastMessage?.createdAt && (
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {formatMessageDate(colleague.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1.5 mt-0.5">
                          <p
                            className={`text-[11.5px] truncate leading-tight ${
                              typing
                                ? "text-emerald-600 font-semibold italic"
                                : hasUnread
                                ? "text-slate-900 font-medium"
                                : "text-slate-500"
                            }`}
                          >
                            {typing ? (
                              "typing..."
                            ) : colleague.lastMessage?.message ? (
                              colleague.lastMessage.message
                            ) : (
                              <span className="text-slate-400">
                                {colleague.designation || colleague.department || "Start chatting"}
                              </span>
                            )}
                          </p>

                          {hasUnread && (
                            <span className="shrink-0 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-[9.5px] font-bold text-white shadow-2xs">
                              {colleague.unreadCount > 99 ? "99+" : colleague.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Full-Screen Circular User Image Preview Lightbox */}
      {previewImage && (
        <HpImagePreview
          open={Boolean(previewImage)}
          src={previewImage.src}
          alt={previewImage.alt}
          shape="circle"
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
};

export default ChatWidget;
