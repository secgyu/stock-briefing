import { QueryClientProvider } from "@tanstack/react-query";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import config from "../granite.config.ts";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TDSMobileAITProvider brandPrimaryColor={config.brand.primaryColor}>
        <App />
      </TDSMobileAITProvider>
    </QueryClientProvider>
  </StrictMode>,
);
