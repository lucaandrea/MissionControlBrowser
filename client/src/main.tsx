import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { setupMockServerAdapter } from "./mocks/mock-server-adapter";

// Initialize mock server in development mode
if (import.meta.env.DEV) {
  setupMockServerAdapter();
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
