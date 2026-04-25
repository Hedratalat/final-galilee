import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import OneSignal from "react-onesignal";

OneSignal.init({
  appId: "0047e379-3dd6-45a3-be26-776439d0bcc5",
  allowLocalhostAsSecureOrigin: true,
  serviceWorkerParam: { scope: "/" },
  serviceWorkerPath: "OneSignalSDKWorker.js",
  notifyButton: {
    enable: false,
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
