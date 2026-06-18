import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
} else if (import.meta.env.PROD) {
  console.warn("VITE_API_URL is not set. API calls may fail if frontend and backend are on different domains.");
}

createRoot(document.getElementById("root")!).render(<App />);
