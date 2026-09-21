import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { LangProvider } from "./i18n/lang";
import { MetaProvider } from "./state/meta";
import { StoreProvider } from "./state/store";
import "./styles/global.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

createRoot(container).render(
  <React.StrictMode>
    <LangProvider>
      <MetaProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </MetaProvider>
    </LangProvider>
  </React.StrictMode>,
);
