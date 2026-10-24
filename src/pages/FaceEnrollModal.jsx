import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { api, apiEndpoints } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import {
  Camera,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  X,
  UserCheck,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import FaceTargetOverlay from "@/components/common/FaceTargetOverlay";
import { captureSquareSnapshot } from "@/utils/faceCapture";

export default function FaceEnrollModal({
  isOpen,
  onClose,
  initialSnapshot,
  onManualLogin,
}) {
  const { enrollFace } = useAuth();

  const [snapshot, setSnapshot] = useState(initialSnapshot || "");
  const [isRetaking, setIsRetaking] = useState(!initialSnapshot);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Sync snapshot when modal opens with initial snapshot
  useEffect(() => {
    if (initialSnapshot) {
      setSnapshot(initialSnapshot);
      setIsRetaking(false);
    } else {
      setIsRetaking(true);
    }
    setError("");
  }, [initialSnapshot, isOpen]);

  // Fetch candidates when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingCandidates(true);
    setError("");

    axios
      .get(api + apiEndpoints.auth.enrollmentCandidates)
      .then((res) => {
        if (isMounted && res.data?.success) {
          setCandidates(res.data.data || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load employee list. Please check your network.");
        }
      })
      .finally(() => {
        if (isMounted) setLoadingCandidates(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle camera preview during retake mode
  useEffect(() => {
    if (!isOpen || !isRetaking) {
      stopCamera();
      return;
    }

    let isMounted = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        if (isMounted) {
          setCameraActive(false);
          setError("Unable to access webcam. Please check browser camera permissions.");
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, isRetaking]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const dataUrl = captureSquareSnapshot(videoRef.current, 0.85, 480);
      if (!dataUrl) {
        setError("Webcam stream is not ready yet. Please wait a moment.");
        return;
      }
      setSnapshot(dataUrl);
      setIsRetaking(false);
      stopCamera();
    } catch {
      setError("Failed to capture snapshot from webcam.");
    }
  };

  const filteredCandidates = candidates.filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (!selectedEmp) {
      setError("Please select your employee profile from the list.");
      return;
    }
    if (!snapshot) {
      setError("Please capture your face photo first.");
      return;
    }
    if (!password) {
      setError("Please enter your account password to verify your identity.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await enrollFace({
        employeeId: selectedEmp._id,
        image: snapshot,
        password,
        autoLogin: true,
      });

      if (!res.success) {
        setError(res.message || "Failed to register face. Please check your password.");
        setSubmitting(false);
      } else {
        stopCamera();
        onClose();
      }
    } catch {
      setError("An unexpected error occurred during face enrollment.");
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-rose-500/5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200/80">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                  Face Not in Database — Register Profile
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Select your profile, verify your password, and link your biometric face ID
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {error && (
              <div
                role="alert"
                className="mx-5 mt-3 shrink-0 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{error}</span>
              </div>
            )}

            <div className="flex-1 min-h-0 p-5 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-hidden">

              <div className="md:col-span-5 flex flex-col justify-between space-y-3 min-h-0 overflow-y-auto pr-1">
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md flex items-center justify-center">
                    {isRetaking ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        <FaceTargetOverlay
                          capturing={false}
                          cameraActive={cameraActive}
                          sizeClass="w-28 h-28"
                        />
                        {!cameraActive && (
                          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-white p-2 text-center text-xs z-20">
                            <Loader2 className="w-4 h-4 animate-spin mb-1 text-indigo-400" />
                            <span className="text-[10px]">Starting...</span>
                          </div>
                        )}
                      </>
                    ) : snapshot ? (
                      <img
                        src={snapshot}
                        alt="Captured Face"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs flex flex-col items-center">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">No Photo</span>
                      </div>
                    )}

                    {!isRetaking && snapshot && (
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                        Captured
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    {isRetaking ? (
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!cameraActive}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Take Photo</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsRetaking(true)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retake</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="enrollPassword"
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between"
                  >
                    <span>Account Password <span className="text-rose-500">*</span></span>
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      id="enrollPassword"
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="Verify account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Required to verify identity and prevent account hijacking.
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Know your password?</span>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      onClose();
                      onManualLogin();
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Manual Login
                  </button>
                </div>
              </div>

              <div className="md:col-span-7 flex flex-col min-h-0 overflow-hidden space-y-2">
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Select Your Profile <span className="text-rose-500">*</span>
                  </span>
                  {selectedEmp && (
                    <span className="text-[11px] font-bold text-indigo-600 truncate max-w-[180px]">
                      {selectedEmp.name}
                    </span>
                  )}
                </div>

                <div className="relative shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID (e.g. EMP001)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5 border border-slate-100 rounded-xl p-1 bg-slate-50/50">
                  {loadingCandidates ? (
                    <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-1 text-xs">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Loading employee list...</span>
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-xs">
                      No matching employee profiles found.
                    </div>
                  ) : (
                    filteredCandidates.map((emp) => {
                      const isSelected = selectedEmp?._id === emp._id;
                      const initials = emp.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                      return (
                        <div
                          key={emp._id}
                          onClick={() => setSelectedEmp(emp)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? "bg-indigo-50/90 border-indigo-500 shadow-xs"
                            : "bg-white border-slate-200/60 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-700"
                                }`}
                            >
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {emp.name}
                                </span>
                                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded shrink-0">
                                  {emp.employeeId}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">
                                {emp.department} • {emp.designation}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {emp.hasFaceEnrolled ? (
                              <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                Enrolled
                              </span>
                            ) : (
                              <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                                New Face
                              </span>
                            )}

                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300 bg-white"
                                }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Footer (Fixed at Bottom) */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                  onManualLogin();
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel & Use Manual Login
              </button>

              <button
                type="submit"
                disabled={submitting || !selectedEmp || !snapshot || !password}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:from-indigo-500 hover:via-purple-500 hover:to-rose-450 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Registering & Clocking In...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Register Face & Clock In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
