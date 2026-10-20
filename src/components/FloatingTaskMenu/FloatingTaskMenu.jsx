import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { DEFAULT_TASKS } from "./tasksConfig";
import { useDraggable } from "./useDraggable";
import FloatingTrigger from "./FloatingTrigger";
import TaskMenuPanel from "./TaskMenuPanel";
import FullScreenTimer from "./FullScreenTimer";
import MinimizedTimerPill from "./MinimizedTimerPill";
import { toast } from "@/components/feedback";
import "./FloatingTaskMenu.css";

/**
 * FloatingTaskMenu
 *
 * Professional AssistiveTouch-style quick launcher & Full-Screen Executive Timer.
 *
 * Capabilities:
 * 1. Small, draggable circular floating icon with AssistiveTouch layered aesthetics.
 * 2. Instantaneous, zero-lag 3x3 shortcut menu with curated task colors & typography.
 * 3. Full-Screen Professional Timer Mode: clicking ANY task (e.g. Lunch Break, Focus Time)
 *    immediately engages an immersive full-screen stopwatch with real-time counter.
 * 4. Timer Controls: Pause / Resume, Stop & Finish, and Minimize to floating dynamic island.
 * 5. Multi-tasking HUD: Minimized pill keeps timer ticking while navigating the HRM app.
 * 6. Clean callbacks: `onTaskSelect(task)` and `onTaskStop(sessionData)`.
 */
export default function FloatingTaskMenu({
  onTaskSelect = () => {},
  onTaskStop = () => {},
  tasks = DEFAULT_TASKS,
  isLocked = false,
  defaultPosition = "bottom-right",
  snapToEdge = true,
  closeOnSelect = true,
  ariaLabel = "Floating task launcher",
  className = "",
}) {
  // Menu launcher state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Active Timer state
  const [activeTask, setActiveTask] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sessionNote, setSessionNote] = useState("");

  const timerIntervalRef = useRef(null);

  // Draggable physics for the floating button
  const handleToggleMenu = useCallback(() => {
    // If a timer is running and minimized, clicking the floating button toggles menu
    setIsOpen((prev) => !prev);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const {
    position,
    isDragging,
    isSnapping,
    isIdle,
    isInitialized,
    dragProps,
  } = useDraggable({
    size: 56,
    margin: 16,
    snapToEdge,
    defaultPosition,
    isOpen,
    onToggle: handleToggleMenu,
  });

  // Ticking stopwatch logic
  useEffect(() => {
    if (isTimerActive && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerActive, isPaused]);

  // When a task is selected from the menu
  const handleSelectTask = useCallback(
    (task) => {
      if (isLocked) {
        toast.error({
          title: "Day Report is Locked",
          message: "Today's Day Report is locked. You cannot perform or track new tasks.",
        });
        setIsOpen(false);
        return;
      }

      setSelectedTaskId(task.id);

      // Invoke consumer callback with task object
      if (typeof onTaskSelect === "function") {
        onTaskSelect(task);
      }

      // Close the shortcut menu
      setIsOpen(false);
      setSelectedTaskId(null);

      // Launch the Full-Screen Professional Timer Mode
      setActiveTask(task);
      setElapsedSeconds(0);
      setIsPaused(false);
      setIsTimerActive(true);
      setStartTime(new Date());
      setSessionNote("");
      setIsFullScreen(true);
    },
    [isLocked, onTaskSelect]
  );

  // Pause / Resume Timer
  const handlePauseToggle = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Stop Timer Session
  const handleStopTimer = useCallback(() => {
    const sessionData = {
      task: activeTask,
      elapsedSeconds,
      formattedTime: `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`,
      startTime,
      endTime: new Date(),
      note: sessionNote,
    };

    if (typeof onTaskStop === "function") {
      onTaskStop(sessionData);
    }

    // Reset timer
    setIsTimerActive(false);
    setIsFullScreen(false);
    setActiveTask(null);
    setElapsedSeconds(0);
    setIsPaused(false);
  }, [activeTask, elapsedSeconds, startTime, sessionNote, onTaskStop]);

  // Minimize Timer to dynamic island
  const handleMinimize = useCallback(() => {
    setIsFullScreen(false);
  }, []);

  // Maximize Timer back to full screen
  const handleMaximize = useCallback(() => {
    setIsFullScreen(true);
  }, []);

  // Trigger keyboard listener
  const handleTriggerKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggleMenu();
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleCloseMenu();
      }
    },
    [handleToggleMenu, handleCloseMenu, isOpen]
  );

  if (!isInitialized) return null;

  return (
    <div className={`floating-task-menu-root ${className}`}>
      {/* Draggable AssistiveTouch circular floating button */}
      <FloatingTrigger
        position={position}
        isDragging={isDragging}
        isSnapping={isSnapping}
        isIdle={isIdle}
        isOpen={isOpen}
        isLocked={isLocked}
        dragProps={dragProps}
        onKeyDown={handleTriggerKeyDown}
        ariaLabel={ariaLabel}
      />

      {/* Zero-lag Executive Task Launcher Panel */}
      <TaskMenuPanel
        isOpen={isOpen}
        onClose={handleCloseMenu}
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={handleSelectTask}
        isLocked={isLocked}
        triggerPosition={position}
      />

      {/* Centered Professional Timer Mode with blurred background */}
      {isTimerActive && isFullScreen && (
        <FullScreenTimer
          task={activeTask}
          elapsedSeconds={elapsedSeconds}
          onStop={handleStopTimer}
          onMinimize={handleMinimize}
        />
      )}

      {/* Minimized HUD Pill (visible when timer is running in background) */}
      {isTimerActive && !isFullScreen && (
        <MinimizedTimerPill
          task={activeTask}
          elapsedSeconds={elapsedSeconds}
          onMaximize={handleMaximize}
          onStop={handleStopTimer}
        />
      )}
    </div>
  );
}

FloatingTaskMenu.propTypes = {
  /**
   * Callback invoked when a task shortcut is clicked.
   */
  onTaskSelect: PropTypes.func,

  /**
   * Callback invoked when the timer session is stopped/completed.
   */
  onTaskStop: PropTypes.func,

  /**
   * List of task shortcut configurations. Defaults to the 9 built-in tasks.
   */
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      shortLabel: PropTypes.string,
      icon: PropTypes.elementType,
      description: PropTypes.string,
      category: PropTypes.string,
      color: PropTypes.string,
      glowColor: PropTypes.string,
      tagline: PropTypes.string,
    })
  ),

  /**
   * Starting placement of the floating button:
   * 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | { x, y }
   */
  defaultPosition: PropTypes.oneOfType([
    PropTypes.oneOf(["bottom-right", "bottom-left", "top-right", "top-left"]),
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
  ]),

  /**
   * Whether to smoothly snap to viewport edges on drag release.
   */
  snapToEdge: PropTypes.bool,

  /**
   * Whether to dismiss menu after selecting a task.
   */
  closeOnSelect: PropTypes.bool,

  /**
   * Accessible description.
   */
  ariaLabel: PropTypes.string,

  /**
   * Optional CSS classes for root.
   */
  className: PropTypes.string,
};
