import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router/router.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

// Prevent global Ctrl+A / Cmd+A select-all outside editable & selectable areas
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
    const active = document.activeElement;
    const target = e.target;
    const isInput =
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable ||
        active.closest?.(
          ".selectable, .allow-select, .user-select-text, [data-selectable='true']",
        ));

    const isTargetInput =
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest?.(
          ".selectable, .allow-select, .user-select-text, [data-selectable='true']",
        ));

    if (!isInput && !isTargetInput) {
      e.preventDefault();
    }
  }
});

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ChatProvider>
      <RouterProvider router={router} />
    </ChatProvider>
  </AuthProvider>,
);
