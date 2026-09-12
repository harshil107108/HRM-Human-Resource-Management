import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { api } from "@/api/api";
import Swal from "sweetalert2";

const TelephonyContext = createContext(null);

const SESSION_STORAGE_KEY = "hrm_telephony_session_id";

function getOrCreateSessionId() {
  let id = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id =
      "session_" +
      Math.random().toString(36).substring(2, 11) +
      "_" +
      Date.now().toString(36);
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export function TelephonyProvider({ children }) {
  const [sessionId] = useState(getOrCreateSessionId);
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);
  const [pairedDevice, setPairedDevice] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [serverInfo, setServerInfo] = useState({
    localIp: window.location.hostname || "localhost",
    backendPort: "8080",
    frontendPort: "5173",
  });
  const [activeCall, setActiveCall] = useState(null);

  const eventSourceRef = useRef(null);

  // Fetch LAN IP / server details from backend
  const fetchServerInfo = useCallback(async () => {
    try {
      const res = await axios.get(`${api}/telephony/server-info`);
      if (res.data?.success) {
        setServerInfo(res.data);
      }
    } catch (err) {
      console.warn("[Telephony] Failed to fetch server info:", err);
    }
  }, []);

  // Check pairing status
  const checkStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${api}/telephony/status/${sessionId}`);
      if (res.data?.success) {
        setIsPhoneConnected(res.data.isPaired);
        setPairedDevice(res.data.pairedDevice);
      }
    } catch (err) {
      // ignore
    }
  }, [sessionId]);

  // Connect to SSE event stream
  useEffect(() => {
    fetchServerInfo();
    checkStatus();

    const sseUrl = `${api}/telephony/events/${sessionId}?clientType=desktop`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.addEventListener("connected", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.pairedDevice) {
          setIsPhoneConnected(true);
          setPairedDevice(data.pairedDevice);
        }
      } catch (err) {}
    });

    es.addEventListener("device-paired", (e) => {
      try {
        const data = JSON.parse(e.data);
        setIsPhoneConnected(true);
        setPairedDevice(data.pairedDevice);

        // Toast notification on desktop
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Mobile Phone Linked!",
          text: `${data.pairedDevice?.deviceName || "Device"} is ready for calling`,
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
        });
      } catch (err) {}
    });

    es.addEventListener("device-disconnected", () => {
      setIsPhoneConnected(false);
      setPairedDevice(null);
    });

    es.addEventListener("call-status", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status === "dialing") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: "Dialing on Mobile...",
            text: "Native phone dialer launched on connected phone",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      } catch (err) {}
    });

    es.onerror = () => {
      // Will auto-reconnect
    };

    return () => {
      es.close();
    };
  }, [sessionId, fetchServerInfo, checkStatus]);

  // Initiate call to employee
  const initiateCall = useCallback(
    async ({ phoneNumber, employeeName, designation, department }) => {
      if (!phoneNumber) {
        Swal.fire({
          icon: "warning",
          title: "No Phone Number",
          text: `No contact number is registered for ${employeeName || "this employee"}.`,
          confirmButtonColor: "#14a6b6",
        });
        return false;
      }

      if (!isPhoneConnected) {
        // Open QR scanner modal so user can connect their phone
        setIsQrModalOpen(true);
        Swal.fire({
          icon: "info",
          title: "Connect Mobile to Call",
          text: `Please scan the QR code to pair your mobile phone before calling ${employeeName || "employee"}.`,
          confirmButtonColor: "#14a6b6",
        });
        return false;
      }

      try {
        setActiveCall({ phoneNumber, employeeName, timestamp: Date.now() });

        const res = await axios.post(`${api}/telephony/call`, {
          sessionId,
          phoneNumber,
          employeeName,
          designation,
          department,
        });

        if (res.data?.success) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Calling on Mobile Device",
            html: `Calling <b>${employeeName}</b> (<span style="color:#0f766e">${phoneNumber}</span>)... check your phone screen.`,
            showConfirmButton: false,
            timer: 4500,
            timerProgressBar: true,
          });
          return true;
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Call Failed",
          text:
            err.response?.data?.message ||
            "Could not dispatch call to mobile device.",
          confirmButtonColor: "#ef4444",
        });
        return false;
      }
    },
    [sessionId, isPhoneConnected],
  );

  // Disconnect device
  const disconnectDevice = useCallback(async () => {
    try {
      await axios.post(`${api}/telephony/disconnect`, { sessionId });
      setIsPhoneConnected(false);
      setPairedDevice(null);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "Mobile Disconnected",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      console.warn("[Telephony] Disconnect error:", err);
    }
  }, [sessionId]);

  return (
    <TelephonyContext.Provider
      value={{
        sessionId,
        isPhoneConnected,
        pairedDevice,
        isQrModalOpen,
        setIsQrModalOpen,
        serverInfo,
        initiateCall,
        disconnectDevice,
        activeCall,
      }}
    >
      {children}
    </TelephonyContext.Provider>
  );
}

export function useTelephony() {
  const context = useContext(TelephonyContext);
  if (!context) {
    throw new Error("useTelephony must be used within a TelephonyProvider");
  }
  return context;
}
