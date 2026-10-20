import React, { useState } from "react";
import FloatingTaskMenu from "./FloatingTaskMenu";
import { DEFAULT_TASKS } from "./tasksConfig";
import {
  Sparkles,
  Move,
  Layers,
  MousePointer,
  Keyboard,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Terminal,
  Zap,
} from "lucide-react";

export default function FloatingTaskMenuDemo() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [snapToEdge, setSnapToEdge] = useState(true);
  const [closeOnSelect, setCloseOnSelect] = useState(true);
  const [defaultPosition, setDefaultPosition] = useState("bottom-right");
  const [useCustomTasks, setUseCustomTasks] = useState(false);

  // Example of a custom task configuration list showing extensibility
  const customTaskList = [
    ...DEFAULT_TASKS.slice(0, 4),
    {
      id: "code-review",
      label: "Code Review",
      shortLabel: "Review",
      icon: Code2,
      description: "Review pull requests and give feedback",
      category: "work",
    },
    {
      id: "quick-sync",
      label: "Quick Sync",
      shortLabel: "Sync",
      icon: Zap,
      description: "5-minute blocker resolution",
      category: "collaboration",
    },
  ];

  const handleTaskSelect = (task) => {
    const timestamp = new Date().toLocaleTimeString();
    setSelectedTask(task);
    setEventHistory((prev) => [
      { task, timestamp, type: "START", id: `${task.id}-${Date.now()}` },
      ...prev.slice(0, 9),
    ]);
  };

  const handleTaskStop = (sessionData) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventHistory((prev) => [
      {
        task: {
          ...sessionData.task,
          label: `${sessionData.task.label} (Ended - ${sessionData.formattedTime})`,
        },
        timestamp,
        type: "STOP",
        id: `stop-${Date.now()}`,
      },
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 font-sans selection:bg-neutral-800 selection:text-white relative">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black" />

      <div className="relative max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-300 mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AssistiveTouch Task Launcher</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Floating Task Menu
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed">
            A polished, iOS AssistiveTouch-inspired quick launcher for React.
            Drag the circular floating icon anywhere on your screen, release to let it
            magnetically snap to the edge, and tap to reveal the task shortcuts.
          </p>
        </header>

        {/* Live Interaction Status & Callout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Selected Task Card */}
          <div className="lg:col-span-1 bg-slate-950/70 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Latest Callback Received
            </h2>

            {selectedTask ? (
              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/15">
                    {React.createElement(selectedTask.icon || Sparkles, {
                      className: "w-6 h-6",
                    })}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {selectedTask.label}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {selectedTask.id}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  {selectedTask.description}
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-sm">
                Click the floating AssistiveTouch button on screen and select any task to see the callback payload here.
              </div>
            )}

            {/* Event log feed */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Callback History ({eventHistory.length})
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {eventHistory.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">No events logged yet</p>
                ) : (
                  eventHistory.map((item) => (
                    <div
                      key={item.id}
                      className="text-xs font-mono bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-slate-300"
                    >
                      <span className="text-sky-300 font-medium">
                        {item.task.label}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {item.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Interactive Controls & Settings */}
          <div className="lg:col-span-2 bg-slate-950/70 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Component Props & Playground
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Snap To Edge Toggle */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={snapToEdge}
                  onChange={(e) => setSnapToEdge(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-sky-400"
                />
                <div>
                  <span className="text-sm font-semibold text-white block">
                    snapToEdge ({snapToEdge ? "Enabled" : "Disabled"})
                  </span>
                  <span className="text-xs text-slate-400">
                    Magnetically springs to the nearest screen edge on drag release.
                  </span>
                </div>
              </label>

              {/* Close On Select Toggle */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={closeOnSelect}
                  onChange={(e) => setCloseOnSelect(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-sky-400"
                />
                <div>
                  <span className="text-sm font-semibold text-white block">
                    closeOnSelect ({closeOnSelect ? "Yes" : "No"})
                  </span>
                  <span className="text-xs text-slate-400">
                    Automatically dismisses menu upon selecting a task.
                  </span>
                </div>
              </label>

              {/* Default Position Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <label className="text-sm font-semibold text-white block">
                  defaultPosition
                </label>
                <select
                  value={defaultPosition}
                  onChange={(e) => setDefaultPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="bottom-right">bottom-right (default)</option>
                  <option value="bottom-left">bottom-left</option>
                  <option value="top-right">top-right</option>
                  <option value="top-left">top-left</option>
                </select>
              </div>

              {/* Custom Tasks Toggle */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={useCustomTasks}
                  onChange={(e) => setUseCustomTasks(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-sky-400"
                />
                <div>
                  <span className="text-sm font-semibold text-white block">
                    Custom Tasks Prop
                  </span>
                  <span className="text-xs text-slate-400">
                    Inject customized tasks (e.g. Code Review, Quick Sync).
                  </span>
                </div>
              </label>
            </div>

            {/* Quick Feature Checklist */}
            <div className="border-t border-slate-800/80 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-emerald-400" />
                <span>Viewport Clamped</span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-sky-400" />
                <span>Drag vs Tap Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-amber-400" />
                <span>Full Keyboard Nav</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>Touch & Mobile Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* The 9 Shortcuts Overview */}
        <section className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Configured Task Shortcuts</h2>
              <p className="text-xs text-slate-400">
                All 9 required shortcuts with stable identifiers and Lucide icons.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              9 Shortcuts Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {DEFAULT_TASKS.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shrink-0">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {task.label}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {task.id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Integration Code Snippet */}
        <section className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            Quick Usage Example
          </h2>

          <pre className="p-4 rounded-2xl bg-black/80 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
{`import { FloatingTaskMenu } from "@/components/FloatingTaskMenu";

function App() {
  const handleTaskSelect = (task) => {
    console.log("Selected task ID:", task.id);
    console.log("Selected task label:", task.label);
    // Ready for future prompt logic: timers, attendance, dialogs, etc.
  };

  return (
    <div>
      {/* Your application content */}

      {/* Floating AssistiveTouch Shortcut Menu */}
      <FloatingTaskMenu
        onTaskSelect={handleTaskSelect}
        defaultPosition="bottom-right"
        snapToEdge={true}
      />
    </div>
  );
}`}
          </pre>
        </section>
      </div>

      {/* Render the actual FloatingTaskMenu component on the page */}
      <FloatingTaskMenu
        key={`${defaultPosition}-${useCustomTasks ? "custom" : "default"}`}
        onTaskSelect={handleTaskSelect}
        onTaskStop={handleTaskStop}
        tasks={useCustomTasks ? customTaskList : DEFAULT_TASKS}
        defaultPosition={defaultPosition}
        snapToEdge={snapToEdge}
        closeOnSelect={closeOnSelect}
      />
    </div>
  );
}
