import companyLogo from "@assets/images/companyLogo.png";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Key,
  Lock,
  Mail,
  Shield,
  Sliders,
  Users
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF9F6] font-sans text-slate-600 antialiased selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
      {/* BACKGROUND DECORATIVE GLOWS (Warm Cream & Indigo-Rose Palette) */}
      <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[650px] h-[650px] bg-rose-100/30 rounded-full blur-[140px] pointer-events-none" />

      {/* LEFT COLUMN: Clean Isometric Workspace Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-200/60 bg-white/50 backdrop-blur-md">
        {/* Technical drafting grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1.5px,transparent_1.5px),linear-gradient(to_bottom,#e2e8f0_1.5px,transparent_1.5px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative flex items-center gap-2.5 z-20">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-lg border border-slate-200 flex items-center justify-center">
            <img
              src={companyLogo}
              alt="Company Logo"
              className="w-full h-full object-contain p-1"
            />
          </div>

          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-sm leading-none">
              Orvexa
            </h1>

            <p className="text-[9px] text-indigo-600 mt-1 font-bold leading-none uppercase tracking-widest">
              Enterprise HRM
            </p>
          </div>
        </div>

        {/* 3D PERSPECTIVE WIREFRAME (Layered Mockups with Parallax Depth) */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="relative w-[450px] h-[450px] flex items-center justify-center">
            {/* Spinning vector guidelines in soft rose/indigo */}
            <div className="absolute inset-0 border border-indigo-100 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-8 border border-dashed border-rose-100/60 rounded-full animate-[spin_30s_linear_infinite_reverse]" />

            {/* 3D Tilted Glassmorphic UI Panel (Light Theme Showcase) */}
            <motion.div
              style={{
                transformStyle: "preserve-3d",
                perspective: 1200,
              }}
              animate={{
                rotateX: [16, 20, 16],
                rotateY: [-30, -24, -30],
                rotateZ: [6, 10, 6],
                y: [0, -6, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 6.5,
                ease: "easeInOut",
              }}
              className="relative w-80 h-56 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_20px_50px_rgba(99,102,241,0.06)] backdrop-blur-md"
            >
              {/* Premium Gradient Top Shimmer Edge (Indigo to Rose) */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

              {/* Tilted Panel Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="w-16 h-2 rounded bg-slate-100" />
              </div>

              {/* Panel mock content */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-rose-500/10 border border-indigo-100/50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="w-24 h-2.5 rounded bg-slate-200" />
                    <div className="w-16 h-1.5 rounded bg-slate-100" />
                  </div>
                </div>

                <div className="w-full h-8 bg-slate-50/80 border border-slate-200/60 rounded-lg p-2 flex items-center justify-between">
                  <div className="w-12 h-1.5 rounded bg-slate-200" />
                  <div className="w-4 h-4 rounded bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Float-out Card 1: Attendance Metric (Z: 40px) */}
              <div
                style={{ transform: "translateZ(40px)" }}
                className="absolute top-10 -right-8 w-28 bg-white border border-slate-100 rounded-xl p-3 shadow-md space-y-1.5"
              >
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  Attendance
                </p>
                <p className="text-sm font-extrabold text-slate-900 leading-none">
                  98.4%
                </p>
                <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="w-[98%] h-full bg-emerald-500 rounded-full" />
                </div>
              </div>

              {/* Float-out Card 2: Hiring Growth Sparkline (Z: 65px) */}
              <div
                style={{ transform: "translateZ(65px)" }}
                className="absolute -bottom-8 -left-8 w-32 bg-white border border-slate-100 rounded-xl p-3 shadow-lg space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Hires
                  </span>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    +12%
                  </span>
                </div>
                <div className="h-6 w-full">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 30"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 25 L20 22 L40 28 L60 15 L80 18 L100 5"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Floating Employee Bubble 1 (With Indigo Gradient ring) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-12 left-12 bg-white border border-slate-200/80 rounded-full p-1 shadow-md flex items-center gap-2 z-20"
            >
              <img
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/20"
                alt="Staff Member"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              />
              <span className="text-[10px] font-bold pr-2.5 text-slate-700">
                Sarah Connor
              </span>
            </motion.div>

            {/* Floating Employee Bubble 2 (With Rose Gradient ring) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4.5,
                delay: 0.5,
                ease: "easeInOut",
              }}
              className="absolute bottom-16 right-16 bg-white border border-slate-200/80 rounded-full p-1 shadow-md flex items-center gap-2 z-20"
            >
              <img
                className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-500/20"
                alt="Staff Member"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
              />
              <span className="text-[10px] font-bold pr-2.5 text-slate-700">
                Mark Peterson
              </span>
            </motion.div>
          </div>
        </div>

        {/* Footer info details */}
        <div className="relative flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest z-20">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
            <span>Secure Enterprise Line</span>
          </span>
          <span>© 2026 HRM Inc.</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Modern Clean Sign-In Form with Navigation Tabs */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative">
        {/* Soft grid overlay right */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40 pointer-events-none" />

        {/* Form Container Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white border border-slate-200/85 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden"
        >
          {/* Subtle Glowing Corner light */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
              <Shield className="w-4 h-4" />
              <span>Identity Verification</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Access Dashboard
            </h2>
            <p className="text-[12px] text-slate-400 font-medium mt-1">
              Sign in with your credentials
            </p>
          </div>

          {/* Login Mode Switcher Tabs */}
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setLoginMethod("email")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === "email"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Work Email</span>
            </button>
            <button
              onClick={() => setLoginMethod("sso")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === "sso"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Single Sign-On</span>
            </button>
          </div>

          {/* Tab 1: Email/Password Login */}
          {loginMethod === "email" ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Input: Email */}
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
                  htmlFor="email"
                >
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-9.5 pr-3 py-2.5 text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    placeholder="name@enterprise.hrm"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Input: Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
                    htmlFor="password"
                  >
                    Security Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-9.5 pr-3 py-2.5 text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    placeholder="••••••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 select-none pt-0.5">
                <input
                  id="remember"
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="remember"
                  className="text-xs font-semibold text-slate-455 cursor-pointer"
                >
                  Remember session for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:from-indigo-500 hover:via-purple-500 hover:to-rose-450 text-white text-xs font-bold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all cursor-pointer"
                type="submit"
              >
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* Tab 2: Single Sign-On / OAuth View */
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Use your organization's centralized identity provider server to
                sign in with single sign-on (SSO).
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 bg-white rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <svg
                    className="w-4.5 h-4.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google Workspace SSO</span>
                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 bg-white rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span>SAML 2.0 Identity Server</span>
                </button>
              </div>

              <div className="w-full h-[1px] bg-slate-100 my-4" />

              <div className="flex gap-2 items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                <span>SSO Configured via Domain DNS</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
