import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Eraser, Lock, Save } from "lucide-react";
import { useRouteAccess, canSaveForm } from "@/context/RouteAccessContext";
import "@/hp-common-modal/styles.css";

// Add/edit pages receive the record id in navigation state (e.g.
// { companyid }, { assetid }); with an id it's an edit, otherwise an add.
const intentFromState = (state) =>
    state && Object.entries(state).some(([key, value]) => /id$/i.test(key) && value) ? "edit" : "add";

export default function HpFooter({
    onBack,
    onSave,
    onClear,
}) {
    const [visible] = useState(true);
    const access = useRouteAccess();
    const location = useLocation();

    // Without Add (new record) / Edit (existing record): view only.
    const intent = access.intent || intentFromState(location.state);
    const readOnly = !canSaveForm(access, intent);
    const reason = `You don't have permission to ${intent === "add" ? "add records" : "make changes"} here`;

    return (
        <>
            <footer
                className={`hp-footer ${visible ? "hp-footer--visible" : "hp-footer--hidden"}`}
            >

                <div className="hp-modal-footer__right">
                    {readOnly && (
                        <span className="hp-modal-readonly" style={{ margin: 0 }} role="note">
                            <Lock size={14} aria-hidden="true" />
                            View only
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onClear}
                        disabled={readOnly}
                        title={readOnly ? reason : undefined}
                        className="hp-modal-btn hp-modal-btn--clear"
                    >
                        <span className="hp-modal-btn__icon"><Eraser size={16} /></span>
                        Clear
                    </button>
                    <button
                        type="button"
                        onClick={readOnly ? undefined : onSave}
                        disabled={readOnly}
                        title={readOnly ? reason : undefined}
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
