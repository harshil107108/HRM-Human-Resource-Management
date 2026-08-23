import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Eraser, Save } from "lucide-react";
import "@/hp-common-modal/styles.css";

export default function HpFooter({
    onBack,
    onSave,
    onClear,
}) {
    const [visible, setVisible] = useState(true);

    return (
        <>
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

