/**
 * taskDeadline.js
 * Professional real-time deadline & timer tracking utility.
 *
 * Requirements:
 * 1. "Assigned" status:
 *    Timer is OFF. The employee hasn't started yet.
 *    Displays allocated time (e.g. "Not Started (2h)") with neutral styling (0% progress).
 *
 * 2. "Running" status:
 *    Timer is ON in real time.
 *    Takes full allocated time (e.g. 2 hours) starting from when it entered Running state.
 *    Elapsed working time = (task.totalWorkedMs || 0) + (now - task.runningStartedAt)
 *    Remaining time = totalDuration - elapsed
 *
 *    Thresholds:
 *    - remaining <= 0: "overdue" (RED, "Overdue by MM:SS")
 *    - remaining <= 10 minutes: "critical" (RED, "MM:SS left (Critical)" / "MM:SS left (Urgent)")
 *      Turns RED when 5 to 10 min remaining!
 *    - remaining <= 20 minutes or >= 80% progress: "warning" (Amber/Yellow)
 *    - remaining > 20 minutes: "normal" (Emerald green)
 *
 * 3. "Code Review" status:
 *    Timer is PAUSED. Displays "In Review (X worked / Y allocated)".
 *
 * 4. "Completed" status:
 *    Timer is STOPPED. Displays "Completed (X worked)".
 */

/**
 * Format milliseconds into live MM:SS or HH:MM:SS with seconds precision
 */
export function formatLiveDuration(ms) {
  const absMs = Math.max(0, Math.abs(ms));
  const totalSecs = Math.floor(absMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Format milliseconds into human-readable duration (e.g. "2h 30m" or "45m")
 */
export function formatDuration(ms) {
  const absMs = Math.abs(ms);
  const totalMins = Math.floor(absMs / 60000);
  const days = Math.floor(totalMins / 1440);
  const hours = Math.floor((totalMins % 1440) / 60);
  const mins = totalMins % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  if (mins > 0) {
    return `${mins}m`;
  }
  const secs = Math.floor((absMs % 60000) / 1000);
  return secs > 0 ? `${secs}s` : "< 1m";
}

/**
 * Format 24h time to 12h AM/PM
 */
export function formatTime12(time24) {
  if (!time24 || typeof time24 !== "string") return "";
  const match = /^([01]\d|2[0-3]):([0-5]\d)/.exec(time24.trim());
  if (!match) return time24;
  const hour = Number(match[1]);
  const min = match[2];
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${min} ${period}`;
}

/**
 * Parse allocated task duration in milliseconds (from estimatedHours or dueDate)
 */
export function getTaskAllocatedDuration(task) {
  if (!task) return null;

  const estHours =
    task.estimatedHours !== null &&
    task.estimatedHours !== undefined &&
    task.estimatedHours !== ""
      ? parseFloat(String(task.estimatedHours).replace(/[^\d.]/g, ""))
      : null;

  if (estHours && estHours > 0) {
    return estHours * 3600 * 1000;
  }

  if (task.dueDate) {
    const rawDueDate = task.dueDate;
    let dueObj = null;

    if (rawDueDate instanceof Date) {
      dueObj = rawDueDate;
    } else if (typeof rawDueDate === "string") {
      dueObj = new Date(rawDueDate);
    }

    if (dueObj && !Number.isNaN(dueObj.getTime())) {
      const startMs = task.startedAt
        ? new Date(task.startedAt).getTime()
        : task.createdAt
          ? new Date(task.createdAt).getTime()
          : Date.now();
      return Math.max(60000, dueObj.getTime() - startMs);
    }
  }

  return null;
}

/**
 * Calculate total elapsed working time for task in milliseconds
 */
export function getTaskWorkedDuration(task, nowMs = Date.now()) {
  if (!task) return 0;
  const baseWorkedMs = Number(task.totalWorkedMs) || 0;

  if (task.status === "Running") {
    const runStart = task.runningStartedAt
      ? new Date(task.runningStartedAt).getTime()
      : task.startedAt
        ? new Date(task.startedAt).getTime()
        : task.createdAt
          ? new Date(task.createdAt).getTime()
          : nowMs;
    const currentSessionMs = Math.max(0, nowMs - runStart);
    return baseWorkedMs + currentSessionMs;
  }

  return baseWorkedMs;
}

/**
 * Parse target deadline Date object
 */
export function parseTaskDeadline(task) {
  if (!task) return null;

  if (task.dueDate) {
    const dueObj = new Date(task.dueDate);
    if (!Number.isNaN(dueObj.getTime())) return dueObj;
  }

  const estHours =
    task.estimatedHours !== null &&
    task.estimatedHours !== undefined &&
    task.estimatedHours !== ""
      ? parseFloat(String(task.estimatedHours).replace(/[^\d.]/g, ""))
      : null;

  if (estHours && estHours > 0) {
    const baseTime = task.startedAt
      ? new Date(task.startedAt).getTime()
      : task.createdAt
        ? new Date(task.createdAt).getTime()
        : Date.now();
    return new Date(baseTime + estHours * 3600 * 1000);
  }

  return null;
}

/**
 * Main real-time deadline & timer computation
 */
export function getTaskDeadlineInfo(task, now = new Date()) {
  if (!task) {
    return {
      hasDeadline: false,
      state: "none",
      color: "slate",
      timerText: "No deadline",
      shortTimerText: "--",
      formattedDeadline: "No deadline set",
      percent: 0,
      isOverdue: false,
      isNearDeadline: false,
      isCritical: false,
      rowClass: "",
      cardClass: "",
    };
  }

  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const allocatedMs = getTaskAllocatedDuration(task);
  const workedMs = getTaskWorkedDuration(task, nowMs);

  // Formatted date string for target deadline if applicable
  const deadlineDate = parseTaskDeadline(task);
  let formattedDeadline = "No deadline set";
  if (deadlineDate) {
    const dateStr = deadlineDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const timeStr = deadlineDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    formattedDeadline = `${dateStr}, ${timeStr}`;
  } else if (allocatedMs) {
    formattedDeadline = `${formatDuration(allocatedMs)} allocated`;
  }

  // ----------------------------------------------------
  // 1. COMPLETED STATUS
  // ----------------------------------------------------
  if (task.status === "Completed") {
    const totalTimeText = workedMs > 0 ? formatDuration(workedMs) : "Completed";
    return {
      hasDeadline: Boolean(allocatedMs || task.dueDate),
      state: "completed",
      color: "emerald",
      timerText: workedMs > 0 ? `Completed (${totalTimeText})` : "Completed",
      shortTimerText: "Done",
      formattedDeadline: formattedDeadline || "Completed",
      percent: 100,
      isOverdue: false,
      isNearDeadline: false,
      isCritical: false,
      workedMs,
      allocatedMs,
      remainingMs: 0,
      rowClass: "",
      cardClass: "hp-grid-card--completed",
    };
  }

  // ----------------------------------------------------
  // 2. ASSIGNED STATUS (NOT STARTED OR PAUSED WORK)
  // ----------------------------------------------------
  if (task.status === "Assigned") {
    const isPaused = workedMs > 0;

    // If the task was previously worked on in Running and put back into Assigned:
    if (isPaused && allocatedMs) {
      const remainingMs = allocatedMs - workedMs;
      const percent = Math.min(
        100,
        Math.max(0, Math.round((workedMs / allocatedMs) * 100)),
      );
      const remainingText = formatDuration(Math.max(0, remainingMs));
      const workedText = formatDuration(workedMs);

      if (remainingMs <= 0) {
        const overdueText = formatDuration(Math.abs(remainingMs));
        return {
          hasDeadline: true,
          state: "paused",
          color: "amber",
          timerText: `Paused (Overdue by ${overdueText})`,
          shortTimerText: `Paused (-${overdueText})`,
          formattedDeadline: `${formatDuration(allocatedMs)} allocated (${workedText} worked)`,
          percent: 100,
          isOverdue: true,
          isNearDeadline: false,
          isCritical: false,
          workedMs,
          allocatedMs,
          remainingMs,
          rowClass: "",
          cardClass: "hp-grid-card--paused",
        };
      }

      return {
        hasDeadline: true,
        state: "paused",
        color: "amber",
        timerText: `Paused (${remainingText} left)`,
        shortTimerText: `${remainingText} left`,
        formattedDeadline: `${formatDuration(allocatedMs)} allocated (${workedText} worked)`,
        percent,
        isOverdue: false,
        isNearDeadline: false,
        isCritical: false,
        workedMs,
        allocatedMs,
        remainingMs,
        rowClass: "",
        cardClass: "hp-grid-card--paused",
      };
    }

    const allocatedText = allocatedMs ? formatDuration(allocatedMs) : null;
    return {
      hasDeadline: Boolean(allocatedMs || task.dueDate),
      state: "assigned",
      color: "slate",
      timerText: allocatedText ? `Not Started (${allocatedText})` : "Not Started",
      shortTimerText: allocatedText ? `${allocatedText} alloc` : "Not Started",
      formattedDeadline: formattedDeadline,
      percent: 0,
      isOverdue: false,
      isNearDeadline: false,
      isCritical: false,
      workedMs: 0,
      allocatedMs,
      remainingMs: allocatedMs || 0,
      rowClass: "",
      cardClass: "",
    };
  }

  // ----------------------------------------------------
  // 3. CODE REVIEW STATUS (PAUSED)
  // ----------------------------------------------------
  if (task.status === "Code Review") {
    const percent = allocatedMs
      ? Math.min(100, Math.round((workedMs / allocatedMs) * 100))
      : 100;
    const workedText = formatDuration(workedMs);
    return {
      hasDeadline: Boolean(allocatedMs || task.dueDate),
      state: "review",
      color: "purple",
      timerText: `In Review (${workedText} spent)`,
      shortTimerText: "In Review",
      formattedDeadline: formattedDeadline,
      percent,
      isOverdue: false,
      isNearDeadline: false,
      isCritical: false,
      workedMs,
      allocatedMs,
      remainingMs: allocatedMs ? Math.max(0, allocatedMs - workedMs) : 0,
      rowClass: "",
      cardClass: "",
    };
  }

  // ----------------------------------------------------
  // 4. RUNNING STATUS (TIME IS ON! REAL-TIME COUNTDOWN)
  // ----------------------------------------------------
  if (task.status === "Running") {
    if (!allocatedMs && !deadlineDate) {
      // Running task without estimate or deadline
      const workedText = formatDuration(workedMs);
      return {
        hasDeadline: false,
        state: "normal",
        color: "green",
        timerText: `Running (${workedText})`,
        shortTimerText: workedText,
        formattedDeadline: "No deadline set",
        percent: 50,
        isOverdue: false,
        isNearDeadline: false,
        isCritical: false,
        workedMs,
        allocatedMs: null,
        remainingMs: null,
        rowClass: "",
        cardClass: "hp-grid-card--normal",
      };
    }

    const totalDuration = allocatedMs || Math.max(60000, deadlineDate.getTime() - nowMs);
    const remainingMs = totalDuration - workedMs;
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round((workedMs / totalDuration) * 100)),
    );

    // 4.1 OVERDUE (Time has run out / exceeded allocated duration)
    if (remainingMs <= 0) {
      const overdueMs = Math.abs(remainingMs);
      const overdueText = formatLiveDuration(overdueMs);
      return {
        hasDeadline: true,
        state: "overdue",
        color: "red",
        timerText: `Overdue by ${overdueText}`,
        shortTimerText: `-${overdueText}`,
        formattedDeadline,
        percent: 100,
        isOverdue: true,
        isNearDeadline: true,
        isCritical: true,
        workedMs,
        allocatedMs: totalDuration,
        remainingMs,
        rowClass: "hp-grid-row--overdue",
        cardClass: "hp-grid-card--overdue",
      };
    }

    // 4.2 CRITICAL - RED ZONE (5 to 10 minutes or fewer remaining!)
    // When remainingMs <= 10 minutes (600,000 ms), turns RED immediately!
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    if (remainingMs <= TEN_MINUTES_MS) {
      const timeLeftText = formatLiveDuration(remainingMs);
      const isUrgent = remainingMs <= FIVE_MINUTES_MS;
      return {
        hasDeadline: true,
        state: "critical",
        color: "red",
        timerText: `${timeLeftText} left (${isUrgent ? "Urgent" : "Critical"})`,
        shortTimerText: `${timeLeftText} left`,
        formattedDeadline,
        percent: Math.max(88, progressPercent),
        isOverdue: false,
        isNearDeadline: true,
        isCritical: true,
        workedMs,
        allocatedMs: totalDuration,
        remainingMs,
        rowClass: "hp-grid-row--critical",
        cardClass: "hp-grid-card--critical",
      };
    }

    // 4.3 WARNING ZONE (10 to 20 minutes remaining or progress >= 80%)
    const TWENTY_MINUTES_MS = 20 * 60 * 1000;
    if (remainingMs <= TWENTY_MINUTES_MS || progressPercent >= 80) {
      const timeLeftText = formatLiveDuration(remainingMs);
      return {
        hasDeadline: true,
        state: "warning",
        color: "yellow",
        timerText: `${timeLeftText} left`,
        shortTimerText: `${timeLeftText} left`,
        formattedDeadline,
        percent: Math.max(70, progressPercent),
        isOverdue: false,
        isNearDeadline: true,
        isCritical: false,
        workedMs,
        allocatedMs: totalDuration,
        remainingMs,
        rowClass: "hp-grid-row--warning",
        cardClass: "hp-grid-card--warning",
      };
    }

    // 4.4 NORMAL ZONE (Comfortable time remaining > 20 min)
    const timeLeftText = formatLiveDuration(remainingMs);
    return {
      hasDeadline: true,
      state: "normal",
      color: "green",
      timerText: `${timeLeftText} left`,
      shortTimerText: `${timeLeftText} left`,
      formattedDeadline,
      percent: Math.min(75, progressPercent),
      isOverdue: false,
      isNearDeadline: false,
      isCritical: false,
      workedMs,
      allocatedMs: totalDuration,
      remainingMs,
      rowClass: "",
      cardClass: "hp-grid-card--normal",
    };
  }

  // Fallback for any unknown state
  return {
    hasDeadline: Boolean(allocatedMs || deadlineDate),
    state: "none",
    color: "slate",
    timerText: "No deadline",
    shortTimerText: "--",
    formattedDeadline,
    percent: 0,
    isOverdue: false,
    isNearDeadline: false,
    isCritical: false,
    rowClass: "",
    cardClass: "",
  };
}
