import { X } from "lucide-react";
import ModalPortal from "@/hp-common-modal/ModalPortal";
import { useModal } from "@/hp-common-modal/useModal";
import "./feedback.css";

/**
 * HpImagePreview
 * ---------------------------------------------------------------------------
 * Full-screen image preview (lightbox) built on the same overlay plumbing as
 * HpCommonModal: portal, scroll lock, Escape/backdrop to close, focus trap,
 * focus restoration and enter/exit animation.
 *
 * Usage:
 *   {open && <HpImagePreview open src={url} alt="Asset" onClose={close} />}
 *   shape="circle" renders a round avatar-style frame.
 * ---------------------------------------------------------------------------
 */
export default function HpImagePreview({
    open,
    src,
    alt = "Image preview",
    onClose,
    shape = "rounded",
}) {
    const { dialogRef, requestClose } = useModal({ open, onClose });

    if (!open || !src) return null;

    return (
        <ModalPortal>
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={alt}
                tabIndex={-1}
                className="hrm-preview-backdrop"
                data-state="entered"
                onClick={(event) => {
                    if (event.target === event.currentTarget) requestClose("backdrop");
                }}
            >
                <div className={`hrm-preview-frame ${shape === "circle" ? "hrm-preview-frame--circle" : ""}`}>
                    <img src={src} alt={alt} draggable={false} />
                </div>

                <button
                    type="button"
                    className="hrm-preview-close"
                    aria-label="Close preview"
                    onClick={() => requestClose("close-button")}
                >
                    <X size={22} aria-hidden="true" />
                </button>
            </div>
        </ModalPortal>
    );
}
