import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { api, apiEndpoints } from "@/api/api";
import { useAuth } from "./AuthContext";
import { playIncomingMessageSound, playOutgoingMessageSound } from "@/utils/chatSound";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?._id;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeColleague, setActiveColleague] = useState(null);
  const [colleagues, setColleagues] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map()); // userId -> timeoutId
  const [totalUnread, setTotalUnread] = useState(0);
  const [incomingToast, setIncomingToast] = useState(null);

  const socketRef = useRef(null);
  const isChatOpenRef = useRef(isChatOpen);
  const activeColleagueRef = useRef(activeColleague);
  const isMinimizedRef = useRef(isMinimized);
  const colleaguesRef = useRef(colleagues);
  const latestUnreadSenderIdRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  useEffect(() => {
    isMinimizedRef.current = isMinimized;
  }, [isMinimized]);

  useEffect(() => {
    activeColleagueRef.current = activeColleague;
  }, [activeColleague]);

  useEffect(() => {
    colleaguesRef.current = colleagues;
  }, [colleagues]);

  // Read stored JWT token
  const getStoredToken = () => {
    try {
      const raw = localStorage.getItem("hrm.session");
      return raw ? JSON.parse(raw)?.token : null;
    } catch {
      return null;
    }
  };

  // Fetch initial colleagues list
  const fetchColleagues = useCallback(async () => {
    if (!currentUserId) return;
    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await axios.get(api + apiEndpoints.chat.getColleagues, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success && res.data?.data) {
        setColleagues(res.data.data.colleagues || []);
        setTotalUnread(res.data.data.totalUnread || 0);
      }
    } catch (err) {
      console.warn("[ChatContext] Failed to load colleagues:", err.message);
    }
  }, [currentUserId]);

  // Mark all unread messages from a colleague as read
  const markMessagesAsRead = useCallback(
    async (colleagueId) => {
      if (!currentUserId || !colleagueId) return;

      // Update local unread state immediately
      setColleagues((prev) =>
        prev.map((c) => {
          if (String(c._id) === String(colleagueId) && c.unreadCount > 0) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        })
      );

      // Re-sum total unread from fresh snapshot
      setTotalUnread(() => {
        return (colleaguesRef.current || [])
          .filter((c) => String(c._id) !== String(colleagueId))
          .reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      });

      // Clear latest unread pointer if this colleague was the one
      if (String(latestUnreadSenderIdRef.current) === String(colleagueId)) {
        latestUnreadSenderIdRef.current = null;
      }

      // Notify socket
      if (socketRef.current?.connected) {
        socketRef.current.emit("mark_as_read", { senderId: colleagueId });
      }

      // Sync via REST
      try {
        const token = getStoredToken();
        if (token) {
          await axios.post(
            api + apiEndpoints.chat.markAsRead,
            { senderId: colleagueId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (err) {
        console.warn("[ChatContext] markAsRead REST error:", err.message);
      }
    },
    [currentUserId]
  );

  // Fetch conversation messages when active colleague changes
  const loadMessages = useCallback(
    async (colleagueId) => {
      if (!currentUserId || !colleagueId) return;
      const token = getStoredToken();
      if (!token) return;

      setLoadingMessages(true);
      try {
        const res = await axios.get(api + apiEndpoints.chat.getMessages(colleagueId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          setMessages(res.data.data || []);
        }
      } catch (err) {
        console.warn("[ChatContext] Failed to load messages:", err.message);
      } finally {
        setLoadingMessages(false);
      }
    },
    [currentUserId]
  );

  // Handle selecting a colleague to chat with
  const selectColleague = useCallback(
    (colleague) => {
      if (!colleague) return;
      setActiveColleague(colleague);
      setIsChatOpen(true);
      setIsMinimized(false);
      setIncomingToast(null);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

      // Clear previous messages immediately so stale chat from another user never flashes
      setMessages([]);

      if (colleague._id) {
        loadMessages(colleague._id);
        markMessagesAsRead(colleague._id);
      }
    },
    [loadMessages, markMessagesAsRead]
  );

  // Open chat intelligently:
  // 1. If explicit target colleague or ID provided: open that conversation.
  // 2. If recent unread message arrived: auto-select that sender!
  // 3. If any colleague has unread messages: auto-select that colleague!
  // 4. Otherwise: if an active conversation is open, refresh its messages; if none, open colleagues directory cleanly.
  const openChat = useCallback(
    (targetColleagueOrId = null) => {
      setIsChatOpen(true);
      setIsMinimized(false);
      setIncomingToast(null);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

      const list = colleaguesRef.current || [];

      // 1. Explicit target provided
      let target = null;
      if (typeof targetColleagueOrId === "string") {
        target = list.find((c) => String(c._id) === String(targetColleagueOrId));
      } else if (targetColleagueOrId && targetColleagueOrId._id) {
        target = targetColleagueOrId;
      }

      // 2. Check if a recent unread sender is waiting
      if (!target && latestUnreadSenderIdRef.current) {
        target = list.find(
          (c) =>
            String(c._id) === String(latestUnreadSenderIdRef.current) &&
            (c.unreadCount || 0) > 0
        );
      }

      // 3. Fallback: check if any colleague has unread messages
      if (!target) {
        target = list.find((c) => (c.unreadCount || 0) > 0);
      }

      if (target?._id) {
        latestUnreadSenderIdRef.current = null;
        selectColleague(target);
        return;
      }

      // 4. No unread messages waiting:
      if (activeColleagueRef.current?._id) {
        loadMessages(activeColleagueRef.current._id);
        markMessagesAsRead(activeColleagueRef.current._id);
      } else {
        // Open directly to the colleagues directory
        setActiveColleague(null);
      }
    },
    [selectColleague, loadMessages, markMessagesAsRead]
  );

  // Close chat completely and reset active colleague so reopening starts clean
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    setIsMinimized(false);
    setActiveColleague(null);
    setIncomingToast(null);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  // Dismiss incoming message floating toast
  const dismissIncomingToast = useCallback(() => {
    setIncomingToast(null);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  // Initialize Socket connection
  useEffect(() => {
    if (!currentUserId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = getStoredToken();
    if (!token) return;

    fetchColleagues();

    const socketUrl = api.replace(/\/$/, "");
    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Re-sync colleagues list on connection/reconnection
      fetchColleagues();
    });

    // Initial online users list
    socket.on("initial_online_users", (userIds = []) => {
      setOnlineUsers(new Set(userIds));
    });

    // User online event
    socket.on("user_online", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    // User offline event
    socket.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // User typing event
    socket.on("user_typing", ({ userId, isTyping }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (isTyping) {
          if (next.has(userId)) clearTimeout(next.get(userId));
          const timeout = setTimeout(() => {
            setTypingUsers((curr) => {
              const updated = new Map(curr);
              updated.delete(userId);
              return updated;
            });
          }, 3500);
          next.set(userId, timeout);
        } else {
          if (next.has(userId)) clearTimeout(next.get(userId));
          next.delete(userId);
        }
        return next;
      });
    });

    // Messages marked as read by other user
    socket.on("messages_read", ({ readBy }) => {
      if (String(activeColleagueRef.current?._id) === String(readBy)) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.recipient === readBy || String(msg.recipient?._id) === String(readBy)
              ? { ...msg, isRead: true }
              : msg
          )
        );
      }
    });

    // Incoming new message handler
    socket.on("new_message", (message) => {
      const senderId =
        typeof message.sender === "object" ? message.sender?._id : message.sender;
      const isSenderActive = String(activeColleagueRef.current?._id) === String(senderId);
      const isChatVisible = isChatOpenRef.current && !isMinimizedRef.current;

      // Condition:
      // If chat is open, NOT minimized, AND actively viewing this sender:
      // => Immediately mark as read, DO NOT play sound, DO NOT increment unread badge!
      if (isChatVisible && isSenderActive) {
        setMessages((prev) => {
          if (
            prev.some(
              (m) =>
                m._id === message._id ||
                (message.tempId && m.tempId === message.tempId)
            )
          ) {
            return prev;
          }
          return [...prev, { ...message, isRead: true }];
        });

        // Mark as read immediately on backend
        socket.emit("mark_as_read", { senderId });

        // Update last message in colleagues list without incrementing unread
        setColleagues((prev) => {
          const updated = prev.map((c) =>
            String(c._id) === String(senderId)
              ? {
                  ...c,
                  lastMessage: {
                    _id: message._id,
                    message: message.message,
                    sender: message.sender,
                    isRead: true,
                    createdAt: message.createdAt,
                  },
                }
              : c
          );
          // Bump to top
          return updated.sort((a, b) => {
            if (String(a._id) === String(senderId)) return -1;
            if (String(b._id) === String(senderId)) return 1;
            return 0;
          });
        });
      } else {
        // Chat is either closed, minimized, or viewing someone else:
        // => PLAY NOTIFICATION SOUND and INCREMENT UNREAD BADGE!
        playIncomingMessageSound();

        // Track as the latest unread sender for smart one-click open
        latestUnreadSenderIdRef.current = senderId;

        // If this sender is loaded into current thread (even if closed or minimized),
        // keep messages state updated so reopening reveals the new message instantly!
        if (isSenderActive) {
          setMessages((prev) => {
            if (
              prev.some(
                (m) =>
                  m._id === message._id ||
                  (message.tempId && m.tempId === message.tempId)
              )
            ) {
              return prev;
            }
            return [...prev, message];
          });
        }

        setTotalUnread((prev) => prev + 1);

        setColleagues((prev) => {
          let found = false;
          const updated = prev.map((c) => {
            if (String(c._id) === String(senderId)) {
              found = true;
              return {
                ...c,
                unreadCount: (c.unreadCount || 0) + 1,
                lastMessage: {
                  _id: message._id,
                  message: message.message,
                  sender: message.sender,
                  isRead: false,
                  createdAt: message.createdAt,
                },
              };
            }
            return c;
          });

          if (!found) {
            fetchColleagues();
            return prev;
          }

          // Bump colleague to top
          return updated.sort((a, b) => {
            if (String(a._id) === String(senderId)) return -1;
            if (String(b._id) === String(senderId)) return 1;
            return 0;
          });
        });

        // Trigger floating in-app notification toast
        const senderObj = typeof message.sender === "object" ? message.sender : null;
        const currentSenderColleague = (colleaguesRef.current || []).find(
          (c) => String(c._id) === String(senderId)
        );
        const senderName =
          senderObj?.firstName
            ? [senderObj.firstName, senderObj.middleName, senderObj.lastName].filter(Boolean).join(" ")
            : senderObj?.name || currentSenderColleague?.name || "Colleague";
        const senderAvatar =
          senderObj?.profileImage || currentSenderColleague?.profileImage || null;

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

        setIncomingToast({
          id: message._id || `toast_${Date.now()}`,
          senderId,
          senderName,
          senderAvatar,
          senderColleague: currentSenderColleague || {
            _id: senderId,
            name: senderName,
            profileImage: senderAvatar,
          },
          messageText: message.message,
          createdAt: message.createdAt || new Date().toISOString(),
        });

        toastTimeoutRef.current = setTimeout(() => {
          setIncomingToast(null);
        }, 6500);
      }
    });

    // Message sent sync (for current user across tabs)
    socket.on("message_sent", (message) => {
      const recipientId =
        typeof message.recipient === "object" ? message.recipient?._id : message.recipient;

      // If viewing this recipient in active chat
      if (String(activeColleagueRef.current?._id) === String(recipientId)) {
        setMessages((prev) => {
          // Replace optimistic message if tempId matches
          if (message.tempId) {
            const index = prev.findIndex((m) => m.tempId === message.tempId);
            if (index !== -1) {
              const clone = [...prev];
              clone[index] = message;
              return clone;
            }
          }
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Update last message in colleagues list
      setColleagues((prev) =>
        prev.map((c) =>
          String(c._id) === String(recipientId)
            ? {
                ...c,
                lastMessage: {
                  _id: message._id,
                  message: message.message,
                  sender: message.sender,
                  isRead: false,
                  createdAt: message.createdAt,
                },
              }
            : c
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [currentUserId, fetchColleagues]);

  // Send message function
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || !activeColleague?._id || !currentUserId) return;

      const recipientId = activeColleague._id;
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const optimisticMsg = {
        _id: tempId,
        tempId,
        sender: {
          _id: currentUserId,
          name: user?.name,
          profileImage: user?.profileImage,
        },
        recipient: recipientId,
        message: trimmed,
        messageType: "text",
        isRead: false,
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      // Play soft sent pop
      playOutgoingMessageSound();

      // Optimistic append
      setMessages((prev) => [...prev, optimisticMsg]);

      // Update last message preview
      setColleagues((prev) => {
        const updated = prev.map((c) =>
          String(c._id) === String(recipientId)
            ? {
                ...c,
                lastMessage: {
                  _id: tempId,
                  message: trimmed,
                  sender: currentUserId,
                  isRead: false,
                  createdAt: new Date().toISOString(),
                },
              }
            : c
        );
        return updated.sort((a, b) => {
          if (String(a._id) === String(recipientId)) return -1;
          if (String(b._id) === String(recipientId)) return 1;
          return 0;
        });
      });

      // Socket send
      if (socketRef.current?.connected) {
        socketRef.current.emit(
          "send_message",
          {
            recipientId,
            message: trimmed,
            tempId,
          },
          (res) => {
            if (res?.error) {
              console.error("[ChatContext] Send message failed:", res.error);
            }
          }
        );
      } else {
        // Fallback REST POST
        try {
          const token = getStoredToken();
          const res = await axios.post(
            api + apiEndpoints.chat.sendMessage,
            { recipientId, message: trimmed },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data?.success && res.data?.data) {
            const savedMsg = res.data.data;
            setMessages((prev) =>
              prev.map((m) => (m.tempId === tempId ? savedMsg : m))
            );
          }
        } catch (err) {
          console.error("[ChatContext] REST send message failed:", err);
        }
      }
    },
    [activeColleague, currentUserId, user]
  );

  // Send typing indicator
  const sendTypingStatus = useCallback(
    (isTyping) => {
      if (!activeColleague?._id || !socketRef.current?.connected) return;
      socketRef.current.emit("typing", {
        recipientId: activeColleague._id,
        isTyping: Boolean(isTyping),
      });
    },
    [activeColleague]
  );

  const value = useMemo(
    () => ({
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
      onlineUsers,
      isColleagueOnline: (id) => onlineUsers.has(String(id)),
      isColleagueTyping: (id) => typingUsers.has(String(id)),
      totalUnread,
      sendMessage,
      sendTypingStatus,
      markMessagesAsRead,
      fetchColleagues,
    }),
    [
      isChatOpen,
      isMinimized,
      activeColleague,
      selectColleague,
      openChat,
      closeChat,
      incomingToast,
      dismissIncomingToast,
      colleagues,
      messages,
      loadingMessages,
      onlineUsers,
      typingUsers,
      totalUnread,
      sendMessage,
      sendTypingStatus,
      markMessagesAsRead,
      fetchColleagues,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
};

export default ChatContext;
