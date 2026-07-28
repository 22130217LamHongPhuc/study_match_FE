import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import CallFramePage from "./features/call/CallFramePage";

// Suppress known ZegoCloud tracer runtime errors globally in both parent and iframe windows
const isZegoCreateSpanError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || "");
  return message.includes("createSpan");
};

window.addEventListener("error", (event: ErrorEvent) => {
  if (isZegoCreateSpanError(event.error || event.message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn("[VideoCall][FE] Suppressed ZegoCloud tracer runtime error globally");
  }
}, true);

window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  if (isZegoCreateSpanError(event.reason)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn("[VideoCall][FE] Suppressed ZegoCloud tracer promise rejection globally");
  }
}, true);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
if (window.location.pathname === "/call-frame") {
  // Deliberately render outside StrictMode and the main application providers.
  // Each iframe gets one isolated Zego singleton for exactly one call.
  root.render(<CallFramePage />);
} else {
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId="714586252342-f47e1oar4i153si4gp61i15v7lg625ft.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
