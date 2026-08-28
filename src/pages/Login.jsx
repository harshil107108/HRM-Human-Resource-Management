import companyLogo from "@assets/images/companyLogo.png";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF9F6] font-sans text-slate-600 antialiased selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">

      <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[650px] h-[650px] bg-rose-100/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-200/60 bg-white/50 backdrop-blur-md">

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1.5px,transparent_1.5px),linear-gradient(to_bottom,#e2e8f0_1.5px,transparent_1.5px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none" />

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

        <div className="relative flex-1 flex items-center justify-center">
          <div className="relative w-[450px] h-[450px] flex items-center justify-center">

            <div className="absolute inset-0 border border-indigo-100 rounded-full animate-[spin_60s_linear_infinite]" />

            <div className="absolute inset-8 border border-dashed border-rose-100/60 rounded-full animate-[spin_30s_linear_infinite_reverse]" />

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

              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>

                <div className="w-16 h-2 rounded bg-slate-100" />
              </div>

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

              {/* Hires Card */}
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

            {/* Employee Bubble 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              }}
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

            {/* Employee Bubble 2 */}
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

        {/* Footer */}
        <div className="relative flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest z-20">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
            <span>Secure Enterprise Line</span>
          </span>

          <span>© 2026 HRM Inc.</span>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative">

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40 pointer-events-none" />

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative w-full max-w-md bg-white border border-slate-200/85 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden"
        >

          {/* Corner Glow */}
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
              Sign in with your email and password
            </p>
          </div>

          {/* Email / Password Form */}
          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">

              <label
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
                htmlFor="password"
              >
                Security Password
              </label>

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

            <button
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:from-indigo-500 hover:via-purple-500 hover:to-rose-450 text-white text-xs font-bold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all cursor-pointer"
              type="submit"
            >
              <span>Sign In to Workspace</span>

              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}