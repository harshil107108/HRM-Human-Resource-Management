import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Code, Cpu, Orbit } from "lucide-react";

export default function UnderConstruction({ moduleName = "This module" }) {
  const [activeStep, setActiveStep] = useState(0);

  // Live status updater for interactive feel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const buildSteps = [
    {
      label: "Refining Design System Tokens",
      code: "const tokens = { primary: '#2563EB', radius: '12px' };",
    },
    {
      label: "Compiling Modular Views",
      code: "import { Grid, StatCard } from './components';",
    },
    {
      label: "Optimizing Micro-animations",
      code: "motion(div).animate({ scale: 1.02 });",
    },
    {
      label: "Securing OAuth Access Handshake",
      code: "const session = await auth.verifySessionToken();",
    },
  ];

  return (
    <div className="relative min-h-[80vh] w-full flex items-center justify-center p-6 md:p-12 overflow-hidden select-none bg-slate-50/50">
      {/* Stripe-like Background Laser Beam & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1.5px,transparent_1.5px),linear-gradient(to_bottom,#e2e8f0_1.5px,transparent_1.5px)] bg-[size:4rem_4rem] opacity-35 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Viewport Grid Wrapper */}
      <div className="relative max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        {/* Left Column: Premium Pitch & Code Logs (lg:col-span-7) */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 rounded-full text-blue-700 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-600" />
            <span>Active Development Cycle</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Crafting the Next-Gen{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              {moduleName}
            </span>{" "}
            View
          </h1>

          <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-w-lg">
            We are designing a state-of-the-art admin environment. Live
            compilers are binding APIs, polishing shadows, and finalizing the
            layout architecture.
          </p>

          {/* Micro Code Sandbox Console */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-2xl relative overflow-hidden max-w-lg">
            <div className="absolute top-0 right-0 p-3 flex gap-1 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>

            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-900 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              <Code className="w-3.5 h-3.5 text-blue-500" />
              <span>Dev Console • compiler.sh</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 shrink-0 select-none">&gt;</span>
                <span className="text-slate-300 leading-normal">
                  {buildSteps[activeStep].label}
                </span>
              </div>
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-slate-900/80 rounded-lg text-emerald-400 border border-slate-900/60 break-all select-all"
              >
                {buildSteps[activeStep].code}
              </motion.div>
            </div>
          </div>

          {/* Navigation Button */}
          <div className="pt-2">
            <Link to="/dashboard">
              <button className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-[13px] font-semibold rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Right Column: Interactive 3D Layered Blueprint Mockup (lg:col-span-5) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Soft Radial Backing Shadow */}
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl animate-pulse" />

            {/* Orbit paths */}
            <div className="absolute w-72 h-72 border border-slate-200/50 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute w-60 h-60 border border-slate-200/50 border-dashed rounded-full animate-[spin_12s_linear_infinite_reverse]" />

            {/* Floating 3D Blueprint Panel */}
            <motion.div
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              animate={{
                rotateX: [18, 22, 18],
                rotateY: [-28, -24, -28],
                y: [0, -6, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut",
              }}
              className="relative w-64 h-48 bg-white/40 border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.08)] backdrop-blur-md flex items-center justify-center"
            >
              {/* Layer 1: Header Blueprint (Z: 25px) */}
              <div
                style={{ transform: "translateZ(25px)" }}
                className="absolute top-3 inset-x-3 h-8 bg-blue-50/70 border border-blue-200/40 rounded-lg flex items-center px-2.5 gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="w-16 h-1.5 rounded-full bg-slate-200" />
              </div>

              {/* Layer 2: Main Grid Canvas (Z: 40px) */}
              <div
                style={{ transform: "translateZ(40px)" }}
                className="absolute bottom-3 left-3 w-[116px] h-24 bg-white/90 border border-slate-200/60 rounded-xl p-2.5 flex flex-col justify-between shadow-sm"
              >
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="w-16 h-2 rounded bg-slate-200" />
                  <div className="w-12 h-1.5 rounded bg-slate-100" />
                </div>
              </div>

              {/* Layer 3: Dynamic Graph layer (Z: 60px) */}
              <div
                style={{ transform: "translateZ(60px)" }}
                className="absolute bottom-3 right-3 w-[100px] h-24 bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-500/30 rounded-xl p-3 flex flex-col justify-between shadow-lg"
              >
                <Orbit className="w-4 h-4 text-blue-200 animate-spin" />
                <div className="space-y-1">
                  <div className="w-10 h-1.5 rounded bg-white/40" />
                  <div className="w-14 h-2 rounded bg-white/20" />
                </div>
              </div>
            </motion.div>

            {/* Particle clouds floating behind panel */}
            <div className="absolute top-12 left-10 w-2.5 h-2.5 bg-blue-400 rounded-full animate-ping opacity-60" />
            <div className="absolute bottom-16 right-12 w-2 h-2 bg-indigo-400 rounded-full animate-bounce opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
