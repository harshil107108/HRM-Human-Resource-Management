import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Eraser, Save } from "lucide-react";
import "@/hp-common-modal/styles.css";

/**
 * HpFooter
 * A footer bar that follows the application sidebar and uses the modal action
 * button styles for consistent page actions.
 *
 * Props:
 *  - onBack:   () => void
 *  - onSave:   () => void
 *  - onClear:  () => void
 */
export default function HpFooter({
    onBack,
    onSave,
    onClear,
}) {
    const [visible, setVisible] = useState(true);

    return (
        <>
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide footer actions" : "Show footer actions"}
                aria-expanded={visible}
                className={`hp-footer-toggle ${visible ? "hp-footer-toggle--open" : ""}`}
            >
                {visible ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronUp size={15} aria-hidden="true" />}
            </button>

            <footer
                className={`hp-footer ${visible ? "hp-footer--visible" : "hp-footer--hidden"}`}
            >


                <div className="hp-modal-footer__right">
                    <button
                        type="button"
                        onClick={onClear}
                        className="hp-modal-btn hp-modal-btn--clear"
                    >
                        <span className="hp-modal-btn__icon"><Eraser size={16} /></span>
                        Clear
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        className="hp-modal-btn hp-modal-btn--primary"
                    >
                        <span className="hp-modal-btn__icon"><Save size={16} /></span>
                        Save
                    </button>
                    <button type="button" onClick={onBack} className="hp-modal-btn hp-modal-btn--secondary">
                        <span className="hp-modal-btn__icon"><ArrowLeft size={16} /></span>
                        Back
                    </button>
                </div>
            </footer>
        </>
    );
}

