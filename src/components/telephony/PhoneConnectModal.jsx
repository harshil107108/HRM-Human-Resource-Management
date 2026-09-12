import React, { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone,
  CheckCircle2,
  X,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  PhoneCall,
  Unlink,
} from "lucide-react";
import { useTelephony } from "@/context/TelephonyContext";

export default function PhoneConnectModal() {
  const {
    sessionId,
    isPhoneConnected,
    pairedDevice,
    isQrModalOpen,
    setIsQrModalOpen,
    serverInfo,
    disconnectDevice,
  } = useTelephony();

  const [copied, setCopied] = useState(false);
  const [customHost, setCustomHost] = useState("");

  // Determine host for QR code
  // Priority: customHost -> serverInfo.localIp -> window.location.hostname
  const activeHost = useMemo(() => {
    if (customHost.trim()) return customHost.trim();
    if (serverInfo?.localIp && serverInfo.localIp !== "localhost") {
      return serverInfo.localIp;
    }
    return window.location.hostname || "localhost";
  }, [customHost, serverInfo]);

  const port = window.location.port ? `:${window.location.port}` : ":5173";
  const protocol = window.location.protocol;

  const companionUrl = useMemo(() => {
    // If custom host starts with http, use as full base
    if (customHost.startsWith("http://") || customHost.startsWith("https://")) {
      return `${customHost}/mobile-dialer?session=${sessionId}`;
    }
    return `${protocol}//${activeHost}${port}/mobile-dialer?session=${sessionId}`;
  }, [customHost, activeHost, port, protocol, sessionId]);

  if (!isQrModalOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(companionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={() => setIsQrModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPhoneConnected
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 leading-tight">
                {isPhoneConnected ? "Phone Connected" : "Connect Mobile Dialer"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isPhoneConnected
                  ? "Your mobile phone is linked and ready to dial"
                  : "Scan with your phone to enable click-to-call"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsQrModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isPhoneConnected ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-emerald-950 truncate">
                      {pairedDevice?.deviceName || "Mobile Device"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                  <p className="text-[12px] text-emerald-700/90 mt-0.5">
                    Platform: {pairedDevice?.platform || "Smartphone"}
                  </p>
                  <p className="text-[11px] text-emerald-600/80 mt-1">
                    Linked at:{" "}
                    {pairedDevice?.pairedAt
                      ? new Date(pairedDevice.pairedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Active"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 text-[12px] space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>How Click-to-Call works:</span>
                </div>
                <p className="text-slate-500 text-[11.5px] pl-6 leading-relaxed">
                  Go to <b>Employee Listing</b>, right-click any employee row, and click{" "}
                  <span className="text-emerald-700 font-medium">"Call Employee"</span>. Your phone
                  will immediately launch its native dialer.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-semibold transition-all shadow-xs"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={disconnectDevice}
                  className="py-2.5 px-3.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-[13px] font-medium transition-colors flex items-center gap-1.5"
                  title="Unlink Phone"
                >
                  <Unlink className="w-4 h-4" />
                  Unlink
                </button>
              </div>
            </div>
          ) : (
            /* Disconnected / Pairing State */
            <div className="space-y-4">
              {/* QR Code Container */}
              <div className="flex flex-col items-center">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-md relative group">
                  <QRCodeSVG
                    value={companionUrl}
                    size={190}
                    level="M"
                    includeMargin={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 bg-white/90 rounded-2xl transition-opacity">
                    <span className="text-[11px] font-semibold text-slate-700">
                      Scan with Phone Camera
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Waiting for mobile scan...</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[12px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Wifi className="w-3.5 h-3.5 text-blue-600" />
                  <span>Requirements:</span>
                </div>
                <ol className="list-decimal list-inside text-slate-500 text-[11px] space-y-0.5 leading-relaxed">
                  <li>Your phone and computer must be on the <b>same Wi-Fi</b> network.</li>
                  <li>Scan the QR code with your phone camera or QR scanner.</li>
                  <li>Keep the companion screen open on your phone.</li>
                </ol>
              </div>

              {/* Network IP & Copy link options */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Companion URL:</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customHost || (serverInfo?.localIp !== "localhost" ? serverInfo.localIp : "")}
                    onChange={(e) => setCustomHost(e.target.value)}
                    placeholder={`e.g. ${serverInfo?.localIp || "192.168.1.100"}`}
                    className="flex-1 text-[12px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  />
                  <a
                    href={companionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                    title="Open companion in new tab to test"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[10px] text-slate-400">
                  Detected Wi-Fi IP: <span className="font-mono text-slate-600">{serverInfo?.localIp}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
