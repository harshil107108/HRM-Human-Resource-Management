import React, { useState, useEffect } from "react";
import { X, Clock, Coffee, Briefcase, PartyPopper, Users, Sparkles } from "lucide-react";

const ACTIVITY_TYPES = [
  { id: "Break", label: "Break", icon: Coffee, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "Task", label: "Task", icon: Briefcase, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "Celebration", label: "Celebration", icon: PartyPopper, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { id: "Meeting", label: "Meeting", icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { id: "Other", label: "Other", icon: Sparkles, color: "text-slate-600 bg-slate-50 border-slate-200" },
];

export default function ActivityModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  date,
  isPending = false,
}) {
  const [type, setType] = useState("Task");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || "Task");
      setTitle(initialData.title || "");
      setCategory(initialData.category || "");
      setStartTime(initialData.startTime || "");
      setEndTime(initialData.endTime || "");
      setDurationMinutes(initialData.durationMinutes || 0);
      setRemarks(initialData.remarks || "");
    } else {
      setType("Task");
      setTitle("");
      setCategory("");
      // Default to current time formatted
      const now = new Date();
      const formattedNow = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setStartTime(formattedNow);
      setEndTime("");
      setDurationMinutes(30);
      setRemarks("");
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter an activity title");
      return;
    }
    if (!startTime.trim()) {
      setError("Please enter a start time");
      return;
    }

    onSave({
      activityId: initialData?._id,
      type,
      title: title.trim(),
      category: category.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      durationMinutes: Number(durationMinutes) || 0,
      remarks: remarks.trim(),
      date,
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {initialData ? "Edit Activity" : "Log New Activity"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Day Report for {date}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Activity Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {ACTIVITY_TYPES.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-300"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title / Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "Break"
                  ? "e.g. Lunch Break, Coffee Refreshment"
                  : type === "Celebration"
                  ? "e.g. Rahul's Birthday, Diwali Celebration"
                  : "e.g. Frontend Bugfix, API Integration"
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category / Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category / Tags (Optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Meal, Development, HR Event"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Time & Duration Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 12:30 PM"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="e.g. 01:15 PM"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="45"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Notes
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any additional details or notes..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Saving..." : initialData ? "Update Activity" : "Save Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
