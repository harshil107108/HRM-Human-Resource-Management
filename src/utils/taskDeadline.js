/**
 * taskDeadline.js
 * Utility to calculate dynamic countdown timers, deadline thresholds,
 * loading line progress percentages, and color classes for tasks.
 */

export function parseTaskDeadline(task) {
  if (!task) return null;

  const estHours =
    task.estimatedHours !== null &&
    task.estimatedHours !== undefined &&
    task.estimatedHours !== ""
      ? parseFloat(String(task.estimatedHours).replace(/[^\d.]/g, ""))
      : null;

  // If task has estimatedHours, deadline is createdAt + estimatedHours
  if (estHours && estHours > 0) {
    const createdMs = task.createdAt
      ? new Date(task.createdAt).getTime()
      : Date.now();
    return new Date(createdMs + estHours * 3600 * 1000);
  }

  // Fallback to dueDate if no estimatedHours
  if (task.dueDate) {
    const rawDueDate = task.dueDate;
    let dateObj = null;

    if (rawDueDate instanceof Date) {
      dateObj = new Date(rawDueDate.getTime());
    } else if (typeof rawDueDate === "string") {
      const trimmed = rawDueDate.trim();
      const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);

      if (isoDateMatch) {
        const datePart = `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;
        const timePart =
          task.dueTime && /^([01]\d|2[0-3]):[0-5]\d/.test(task.dueTime.trim())
            ? task.dueTime.trim().slice(0, 5)
            : null;

        if (timePart) {
          dateObj = new Date(`${datePart}T${timePart}:00`);
        } else if (trimmed.includes("T")) {
          dateObj = new Date(trimmed);
        } else {
          dateObj = new Date(`${datePart}T23:59:59`);
        }
      } else {
        dateObj = new Date(trimmed);
      }
    }

    if (dateObj && !Number.isNaN(dateObj.getTime())) return dateObj;
  }

  return null;
}

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
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m`;
  }
  return "< 1m";
}

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

export function getTaskDeadlineInfo(task, now = new Date()) {
  if (!task) {
    return {
      hasDeadline: false,
      state: "none",
      color: "slate",
      timerText: "No deadline",
      formattedDeadline: "No deadline set",
      percent: 0,
      rowClass: "",
      cardClass: "",
    };
  }

  if (task.status === "Completed") {
    return {
      hasDeadline: Boolean(task.dueDate || task.estimatedHours),
      state: "completed",
      color: "emerald",
      timerText: "Completed",
      formattedDeadline: task.dueDate
        ? new Date(task.dueDate).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Completed",
      percent: 100,
      isOverdue: false,
      isNearDeadline: false,
      rowClass: "",
      cardClass: "hp-grid-card--completed",
    };
  }

  const deadline = parseTaskDeadline(task);
  if (!deadline) {
    return {
      hasDeadline: false,
      state: "none",
      color: "slate",
      timerText: "No deadline",
      formattedDeadline: "No deadline set",
      percent: 0,
      isOverdue: false,
      isNearDeadline: false,
      rowClass: "",
      cardClass: "",
    };
  }

  const nowMs = now.getTime();
  const deadlineMs = deadline.getTime();
  const diffMs = deadlineMs - nowMs;

  const estHours =
    task.estimatedHours !== null &&
    task.estimatedHours !== undefined &&
    task.estimatedHours !== ""
      ? parseFloat(String(task.estimatedHours).replace(/[^\d.]/g, ""))
      : null;

  // Base created time for progress calculation
  const createdMs = task.createdAt
    ? new Date(task.createdAt).getTime()
    : estHours && estHours > 0
      ? deadlineMs - estHours * 3600 * 1000
      : deadlineMs - 24 * 60 * 60 * 1000;

  const totalDuration =
    estHours && estHours > 0
      ? estHours * 3600 * 1000
      : Math.max(60000, deadlineMs - createdMs);

  const elapsedMs = Math.max(0, nowMs - createdMs);

  // Formatted deadline display with date and time
  const formattedDate = deadline.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
  const timeString = deadline.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const formattedDeadline = `${formattedDate}, ${timeString}`;

  // 1. OVERDUE (Time Exceeded!)
  if (diffMs < 0) {
    const overdueDuration = formatDuration(diffMs);
    return {
      hasDeadline: true,
      deadline,
      formattedDeadline,
      state: "overdue",
      color: "red",
      isOverdue: true,
      isNearDeadline: true,
      timerText: `Overdue by ${overdueDuration}`,
      shortTimerText: `-${overdueDuration}`,
      percent: 100,
      rowClass: "hp-grid-row--overdue",
      cardClass: "hp-grid-card--overdue",
    };
  }

  // 2. CRITICAL (Very near deadline: < 2 hours or >= 90% time elapsed)
  const remainingHours = diffMs / (3600 * 1000);
  const progressPercent = Math.min(
    98,
    Math.max(5, Math.round((elapsedMs / totalDuration) * 100)),
  );

  if (remainingHours <= 2 || progressPercent >= 90) {
    const timeLeft = formatDuration(diffMs);
    return {
      hasDeadline: true,
      deadline,
      formattedDeadline,
      state: "critical",
      color: "red",
      isOverdue: false,
      isNearDeadline: true,
      timerText: `${timeLeft} left (Urgent)`,
      shortTimerText: `${timeLeft} left`,
      percent: Math.max(90, progressPercent),
      rowClass: "hp-grid-row--critical",
      cardClass: "hp-grid-card--critical",
    };
  }

  // 3. WARNING (Near deadline: <= 8 hours or progress >= 65%)
  if (remainingHours <= 8 || progressPercent >= 65) {
    const timeLeft = formatDuration(diffMs);
    return {
      hasDeadline: true,
      deadline,
      formattedDeadline,
      state: "warning",
      color: "yellow",
      isOverdue: false,
      isNearDeadline: true,
      timerText: `${timeLeft} left`,
      shortTimerText: `${timeLeft} left`,
      percent: Math.max(65, progressPercent),
      rowClass: "hp-grid-row--warning",
      cardClass: "hp-grid-card--warning",
    };
  }

  // 4. NORMAL (Comfortable time remaining)
  const timeLeft = formatDuration(diffMs);
  return {
    hasDeadline: true,
    deadline,
    formattedDeadline,
    state: "normal",
    color: "green",
    isOverdue: false,
    isNearDeadline: false,
    timerText: `${timeLeft} left`,
    shortTimerText: `${timeLeft} left`,
    percent: Math.min(60, progressPercent),
    rowClass: "",
    cardClass: "hp-grid-card--normal",
  };
}
