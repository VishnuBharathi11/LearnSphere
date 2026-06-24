import axios from "axios";
import {
  decrementNetworkActivity,
  incrementNetworkActivity,
} from "./networkActivityStore";

let initialized = false;

export function setupAxiosNetworkLoader() {
  if (initialized) return;
  initialized = true;

  axios.interceptors.request.use(
    (config) => {
      const url = config?.url || "";
      const isBackground =
        config?.headers?.["X-Skip-Global-Loader"] ||
        url.includes("/notifications") ||
        url.includes("/withdrawals") ||
        url.includes("/api/progress/users") ||
        url.includes("/api/enrollments/user") ||
        url.includes("/api/enrollments/courses") ||
        url.includes("/api/courses/instructor");

      if (!isBackground) {
        incrementNetworkActivity();
      }
      config.metadata = { ...config.metadata, isBackground: Boolean(isBackground) };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      if (!response.config?.metadata?.isBackground) {
        decrementNetworkActivity();
      }
      return response;
    },
    (error) => {
      if (error.config && !error.config.metadata?.isBackground) {
        decrementNetworkActivity();
      }
      return Promise.reject(error);
    }
  );
}

