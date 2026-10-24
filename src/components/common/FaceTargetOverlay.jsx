import { motion } from "framer-motion";

/**
 * Enterprise Biometric Viewport Overlay
 * Minimalist, high-end biometric reticle with subtle corner brackets,
 * smooth vignette backdrop, and clean ambient laser line.
 * Eliminates AI-generated clutter and cartoon sketches for an executive enterprise look.
 */
export default function FaceTargetOverlay({
  capturing = false,
  cameraActive = true,
  sizeClass = "w-44 h-48 sm:w-48 sm:h-52",
}) {
  if (!cameraActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden z-10">
      {/* 
        Central Targeting Viewport 
        Uses shadow-[0_0_0_9999px_rgba(15,23,42,0.60)] to dim bystanders and peripheral areas
      */}
      <div
        className={`relative ${sizeClass} rounded-3xl flex items-center justify-center shadow-[0_0_0_9999px_rgba(15,23,42,0.60)] border border-white/20 overflow-hidden transition-all duration-300`}
      >
        {/* Sleek Corner Brackets (Executive Reticle) */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-indigo-400/90 rounded-tl-xl shadow-[0_0_6px_rgba(129,140,248,0.4)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-indigo-400/90 rounded-tr-xl shadow-[0_0_6px_rgba(129,140,248,0.4)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-indigo-400/90 rounded-bl-xl shadow-[0_0_6px_rgba(129,140,248,0.4)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-indigo-400/90 rounded-br-xl shadow-[0_0_6px_rgba(129,140,248,0.4)]" />

        {/* Minimalist Biometric Frame Alignment Guide */}
        <div className="absolute inset-3 flex items-center justify-center pointer-events-none opacity-25">
          <div className="w-28 h-36 rounded-[2.5rem] border border-dashed border-white/70" />
        </div>

        {/* Subtle Sweeping Laser Ray */}
        <motion.div
          animate={{ y: ["-10%", "110%", "-10%"] }}
          transition={{
            repeat: Infinity,
            duration: 2.4,
            ease: "easeInOut",
          }}
          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/90 to-transparent shadow-[0_0_10px_rgba(99,102,241,0.7)] pointer-events-none"
        />
      </div>

      {/* Single Clean Floating Status Tag */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-20">
        <div className="px-3.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium tracking-wide flex items-center gap-2 shadow-lg">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              capturing ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"
            }`}
          />
          <span>{capturing ? "Recognizing face..." : "Align face within frame"}</span>
        </div>
      </div>
    </div>
  );
}
