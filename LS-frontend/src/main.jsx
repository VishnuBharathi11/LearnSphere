import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.scss";
import { cleanupDeprecatedStoreKeys } from "./services/appStore";
import { setupAxiosNetworkLoader } from "./services/setupAxiosNetworkLoader";

cleanupDeprecatedStoreKeys();
setupAxiosNetworkLoader();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
