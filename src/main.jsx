import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router/router.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ChatProvider>
      <RouterProvider router={router} />
    </ChatProvider>
  </AuthProvider>,
);
