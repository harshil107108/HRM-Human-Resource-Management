import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Lottie } from "lottie-react";
import mailSentAnimation from "@/assets/images/Mail Sent Animation.json";

/**
 * MailSendingModal
 * ----------------------------------------------------------------------
 * Full-screen blurred backdrop with a BIG centered Lottie animation
 * and zero surrounding UI cards, buttons or boxes.
 * Mounted directly to document.body via createPortal with z-[999999]
 * so sidebar, header, and content are 100% covered and blurred.
 */
const MailSendingModal = ({
  isOpen,
  status = "sending", // "sending" | "success" | "error"
  onClose,
}) => {
  // Prevent background scrolling while full screen animation is active
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Auto-close on success after animation completes (2.2s)
  useEffect(() => {
    if (!isOpen || status !== "success") return;
    const timer = setTimeout(() => {
      onClose?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, [isOpen, status, onClose]);

  // Auto-close on error after 1.8s
  useEffect(() => {
    if (!isOpen || status !== "error") return;
    const timer = setTimeout(() => {
      onClose?.();
    }, 1800);
    return () => clearTimeout(timer);
  }, [isOpen, status, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[999999] w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-2xl transition-all duration-300 animate-in fade-in select-none cursor-pointer"
      title="Click to dismiss"
    >
      {/* Big Centered Lottie Animation - zero surrounding UI */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex items-center justify-center w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px] max-w-[95vw] max-h-[95vh] pointer-events-auto"
      >
        <Lottie
          src={mailSentAnimation}
          autoplay
          loop={status === "sending"}
          className="w-full h-full drop-shadow-2xl"
        />
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : content;
};

export default MailSendingModal;
