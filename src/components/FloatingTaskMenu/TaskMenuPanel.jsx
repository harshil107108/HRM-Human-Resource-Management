import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { X, Sparkles, Lock, Clock } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { api, apiEndpoints } from "@/api/api";
import TaskItem from "./TaskItem";

const MENU_WIDTH = 340;
const MENU_HEIGHT = 390;
const SCREEN_MARGIN = 16;
const TRIGGER_SIZE = 56;

const formatTimeDisplay = (val) => {
  if (!val) return "";
  if (/AM|PM/i.test(val)) return val;
  const parts = String(val).split(":");
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const minute = parts[1].padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
  }
  return val;
};

/**
 * TaskMenuPanel
 *
 * Professional task shortcut launcher panel styled natively for the HRM platform:
 * - Clean white card surface with hairline slate border matching HpCommonModal & Header
 * - 3x3 task shortcuts with crisp corporate badge styling
 * - Fast, hardware-accelerated transitions
 * - Dynamic viewport placement
 */
export default function TaskMenuPanel({
  isOpen,
  onClose,
  tasks = [],
  selectedTaskId,
  onSelectTask,
  isLocked = false,
  triggerPosition = { x: 0, y: 0 },
}) {
  const panelRef = useRef(null);
  const itemRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { user } = useAuth();
  const [punchInTime, setPunchInTime] = useState(() => {
    return sessionStorage.getItem("hrm.punchInTime") || "";
  });

  // Resolve today's punch in time
  useEffect(() => {
    if (!isOpen) return;

    const sessionRaw = localStorage.getItem("hrm.session");
    let sessionData = null;
    try {
      sessionData = sessionRaw ? JSON.parse(sessionRaw) : null;
    } catch {}

    const directPunchIn =
      user?.attendance?.clockIn ||
      user?.attendance?.punchTime ||
      sessionData?.attendance?.clockIn ||
      sessionData?.attendance?.punchTime ||
      user?.clockIn ||
      user?.punchIn;

    if (directPunchIn) {
      const formatted = formatTimeDisplay(directPunchIn);
      setPunchInTime(formatted);
      sessionStorage.setItem("hrm.punchInTime", formatted);
      return;
    }

    let isCancelled = false;
    const fetchTodayPunchIn = async () => {
      try {
        const token = sessionData?.token || user?.token;
        const res = await axios.post(
          api + apiEndpoints.attendance.log.LogGetData,
          {},
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (!isCancelled && res.data?.success && Array.isArray(res.data?.data)) {
          const todayStr = new Date().toISOString().split("T")[0];
          const logs = res.data.data;
          const currentEmpId = user?.employeeId || user?._id || user?.id;

          const match =
            logs.find((l) => {
              const logDate = l.date ? String(l.date).slice(0, 10) : "";
              const matchesEmp =
                !currentEmpId ||
                String(l.employeeId?._id || l.employeeId?.employeeId || l.employeeId) === String(currentEmpId);
              return logDate === todayStr && matchesEmp && l.clockIn;
            }) ||
            logs.find((l) => {
              const logDate = l.date ? String(l.date).slice(0, 10) : "";
              return logDate === todayStr && l.clockIn;
            });

          if (match?.clockIn) {
            const formatted = formatTimeDisplay(match.clockIn);
            setPunchInTime(formatted);
            sessionStorage.setItem("hrm.punchInTime", formatted);
            return;
          }
        }
      } catch (err) {
        // Fallback gracefully
      }

      if (!isCancelled) {
        const fallback = sessionStorage.getItem("hrm.punchInTime") || "09:30 AM";
        setPunchInTime(fallback);
      }
    };

    fetchTodayPunchIn();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, user]);

  // Compute smart position based on trigger coordinates & viewport bounds
  const panelPosition = useMemo(() => {
    if (typeof window === "undefined") {
      return { x: 100, y: 100 };
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Mobile: center the panel
    if (winW < 480) {
      return {
        x: Math.max(SCREEN_MARGIN, (winW - MENU_WIDTH) / 2),
        y: Math.max(SCREEN_MARGIN, (winH - MENU_HEIGHT) / 2),
      };
    }

    // Desktop: calculate optimal placement relative to floating button
    const isRightHalf = triggerPosition.x > winW / 2;
    const isBottomHalf = triggerPosition.y > winH / 2;

    let targetX = isRightHalf
      ? triggerPosition.x + TRIGGER_SIZE - MENU_WIDTH
      : triggerPosition.x;

    let targetY = isBottomHalf
      ? triggerPosition.y - MENU_HEIGHT - 12
      : triggerPosition.y + TRIGGER_SIZE + 12;

    const clampedX = Math.min(
      Math.max(SCREEN_MARGIN, targetX),
      winW - MENU_WIDTH - SCREEN_MARGIN
    );
    const clampedY = Math.min(
      Math.max(SCREEN_MARGIN, targetY),
      winH - MENU_HEIGHT - SCREEN_MARGIN
    );

    return { x: clampedX, y: clampedY };
  }, [triggerPosition]);

  useEffect(() => {
    if (isOpen) {
      const activeIdx = tasks.findIndex((t) => t.id === selectedTaskId);
      const initialIdx = activeIdx >= 0 ? activeIdx : 0;
      setFocusedIndex(initialIdx);

      requestAnimationFrame(() => {
        itemRefs.current[initialIdx]?.focus?.();
      });
    }
  }, [isOpen, selectedTaskId, tasks]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;

      const total = tasks.length;
      if (total === 0) return;

      let nextIndex = focusedIndex;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onClose();
          return;

        case "ArrowRight":
          e.preventDefault();
          nextIndex = (focusedIndex + 1) % total;
          break;

        case "ArrowLeft":
          e.preventDefault();
          nextIndex = (focusedIndex - 1 + total) % total;
          break;

        case "ArrowDown":
          e.preventDefault();
          nextIndex = (focusedIndex + 3) % total;
          break;

        case "ArrowUp":
          e.preventDefault();
          nextIndex = (focusedIndex - 3 + total) % total;
          break;

        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;

        case "End":
          e.preventDefault();
          nextIndex = total - 1;
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          if (tasks[focusedIndex]) {
            onSelectTask(tasks[focusedIndex]);
          }
          return;

        case "Tab":
          if (e.shiftKey && focusedIndex === 0) {
            e.preventDefault();
            nextIndex = total - 1;
          } else if (!e.shiftKey && focusedIndex === total - 1) {
            e.preventDefault();
            nextIndex = 0;
          }
          break;

        default:
          return;
      }

      setFocusedIndex(nextIndex);
      itemRefs.current[nextIndex]?.focus?.();
    },
    [isOpen, tasks, focusedIndex, onClose, onSelectTask]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Light backdrop for outside-click dismiss */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[9980] bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-150"
        aria-hidden="true"
      />

      {/* Main Enterprise Panel matching HRM website */}
      <div
        ref={panelRef}
        role="menu"
        aria-label="Task launcher shortcuts"
        aria-modal="true"
        onKeyDown={handleKeyDown}
        style={{
          left: `${panelPosition.x}px`,
          top: `${panelPosition.y}px`,
          width: `${MENU_WIDTH}px`,
          willChange: "transform, opacity",
        }}
        className="fixed z-[9985] rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-900/15 p-4 pt-3.5 select-none outline-none animate-in fade-in zoom-in-95 duration-150 ease-out"
      >
        {/* Header Bar matching HRM header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 px-0.5">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-slate-600">Punch In:</span>
              <span className="text-[11.5px] font-bold text-emerald-600 tracking-tight">
                {punchInTime || "09:30 AM"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close launcher"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-90 outline-none cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Locked Notification Banner when Day Report is Locked */}
        {isLocked && (
          <div className="mb-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Today's Day Report is locked. No new tasks can be started.</span>
          </div>
        )}

        {/* 3x3 Shortcut Grid */}
        <div className="grid grid-cols-3 gap-2">
          {tasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={task.id === selectedTaskId}
              onSelect={onSelectTask}
              buttonRef={(el) => (itemRefs.current[index] = el)}
              tabIndex={focusedIndex === index ? 0 : -1}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between px-1 text-xs text-slate-500">
        </div>
      </div>
    </>
  );
}
