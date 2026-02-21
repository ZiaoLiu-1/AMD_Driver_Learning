import { createRoot } from "react-dom/client";
import App from "./App";
import "./lib/i18n";
import "./index.css";

// Load analytics only when VITE_ANALYTICS_ENDPOINT is configured
if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
  const script = document.createElement("script");
  script.defer = true;
  script.src = `${import.meta.env.VITE_ANALYTICS_ENDPOINT}/umami`;
  if (import.meta.env.VITE_ANALYTICS_WEBSITE_ID) {
    script.dataset.websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
  }
  document.head.appendChild(script);
}

createRoot(document.getElementById("root")!).render(<App />);
