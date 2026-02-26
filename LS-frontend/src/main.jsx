import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.scss";
import { appStore, cleanupDeprecatedStoreKeys } from "./services/appStore";

if (!window.appStore) {
  window.appStore = appStore;
}

cleanupDeprecatedStoreKeys();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
