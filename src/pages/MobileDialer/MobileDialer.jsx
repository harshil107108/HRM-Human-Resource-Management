import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { api } from "@/api/api";
import {
  PhoneCall,
  Smartphone,
  CheckCircle2,
  PhoneForwarded,
  Volume2,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

// Web Audio synthesizer for phone call chime
function playIncomingChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.setValueAtTime(480, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.2);
    osc2.stop(now + 1.2);
  } catch (err) {
    // AudioContext may be restricted before user gesture
  }
}

function detectDeviceName() {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return "Apple iPhone";
  if (/iPad/i.test(ua)) return "Apple iPad";
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android.*; ([a-zA-Z0-9\s_-]+)\sBuild/);
    if (match && match[1]) return match[1].trim();
    return "Android Phone";
  }
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Macintosh/i.test(ua)) return "Mac";
  return "Mobile Device";
}

export default function MobileDialer() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const [isPaired, setIsPaired] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);

  const eventSourceRef = useRef(null);

  // Notify backend of status change
  const reportCallStatus = useCallback(
    async (callId, status) => {
      if (!sessionId) return;
      try {
        await axios.post(`${api}/telephony/call-status`, {
          sessionId,
          callId,
          status,
        });
      } catch (err) {}
    },
    [sessionId],
  );

  // Pair device with session
  const pairWithSession = useCallback(async () => {
    if (!sessionId) {
      setErrorMsg("Missing session ID. Please scan the QR code again from the HRM desktop.");
      return;
    }

    try {
      const deviceName = detectDeviceName();
      const platform = /iPhone|iPad/i.test(navigator.userAgent)
        ? "iOS"
        : /Android/i.test(navigator.userAgent)
        ? "Android"
        : "Web";

      const res = await axios.post(`${api}/telephony/pair`, {
        sessionId,
        deviceName,
        platform,
        browser: navigator.userAgent.includes("Chrome") ? "Chrome" : "Safari/Other",
      });

      if (res.data?.success) {
        setIsPaired(true);
      }
    } catch (err) {
      setErrorMsg("Failed to connect to HRM server. Ensure you are on the same Wi-Fi network.");
    }
  }, [sessionId]);

  // Connect to SSE stream
  useEffect(() => {
    if (!sessionId) return;

    pairWithSession();

    const sseUrl = `${api}/telephony/events/${sessionId}?clientType=mobile`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      setIsPaired(true);
    });

    es.addEventListener("incoming-call", (event) => {
      try {
        const callData = JSON.parse(event.data);
        setIncomingCall(callData);

        // Add to history
        setCallHistory((prev) => [callData, ...prev.slice(0, 9)]);

        // Audio & vibration
        playIncomingChime();
        if ("vibrate" in navigator) {
          navigator.vibrate([300, 150, 300]);
        }

        reportCallStatus(callData.callId, "dialing");

        // Attempt automatic prompt to dial
        setTimeout(() => {
          window.location.href = `tel:${callData.phoneNumber}`;
        }, 400);
      } catch (err) {
        console.error("Error handling incoming call:", err);
      }
    });

    es.addEventListener("session-ended", () => {
      setIsPaired(false);
      setIncomingCall(null);
    });

    es.onerror = () => {
      // Reconnects automatically
    };

    return () => {
      es.close();
    };
  }, [sessionId, pairWithSession, reportCallStatus]);

  const handleManualDial = (call) => {
    if (!call?.phoneNumber) return;
    reportCallStatus(call.callId, "dialing");
    window.location.href = `tel:${call.phoneNumber}`;
  };

  const handleDismissCall = () => {
    if (incomingCall) {
      reportCallStatus(incomingCall.callId, "completed");
    }
    setIncomingCall(null);
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-2">No Session Specified</h1>
        <p className="text-slate-400 text-sm max-w-xs">
          Please scan the QR code from the <b>HRM Header</b> on your desktop computer to pair your phone.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            HR
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              HRM Mobile Dialer
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Click-to-Call Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPaired ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Connecting...
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 max-w-md mx-auto w-full flex flex-col justify-between">
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Active / Incoming Call Banner */}
          {incomingCall ? (
            <div className="p-5 rounded-2xl bg-linear-to-b from-teal-950/70 to-slate-900 border-2 border-teal-500/50 shadow-2xl shadow-teal-950/50 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-500/30 animate-bounce">
                <PhoneCall className="w-8 h-8" />
              </div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-teal-400">
                Incoming Call Request
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                {incomingCall.employeeName}
              </h2>
              {incomingCall.designation && (
                <p className="text-xs text-slate-400 mt-0.5">{incomingCall.designation}</p>
              )}
              <div className="my-3 py-2 px-3 rounded-xl bg-slate-800/80 border border-slate-700/80 inline-block font-mono text-base font-semibold text-emerald-400 tracking-wider">
                {incomingCall.phoneNumber}
              </div>

              <div className="space-y-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleManualDial(incomingCall)}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-transform"
                >
                  <PhoneForwarded className="w-4 h-4" />
                  Tap to Dial ({incomingCall.phoneNumber})
                </button>
                <button
                  type="button"
                  onClick={handleDismissCall}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            /* Standby Card */
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 text-teal-400 mb-1">
                <Smartphone className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Device Paired & Standby</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Leave this screen open. When you click <b>"Call Employee"</b> in the HRM desktop
                directory, your phone will prompt you to call instantly.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Connected via Local Network</span>
              </div>
            </div>
          )}

          {/* Call History */}
          {callHistory.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Recent Calls (This Session)
                </span>
                <span>{callHistory.length}</span>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {callHistory.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleManualDial(item)}
                    className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {item.employeeName}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {item.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      title="Redial"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="pt-6 pb-2 text-center text-[11px] text-slate-400">
          <p>Session: <span className="font-mono text-slate-400">{sessionId.slice(0, 16)}...</span></p>
          <p className="text-[10px] text-slate-400 mt-1">HRM Telephony Link • Orvexa</p>
        </footer>
      </main>
    </div>
  );
}
