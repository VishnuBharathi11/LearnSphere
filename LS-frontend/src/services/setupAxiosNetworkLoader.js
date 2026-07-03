import axios from "axios";
import {
  decrementNetworkActivity,
  incrementNetworkActivity,
} from "./networkActivityStore";

let initialized = false;
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const RETRY_DELAYS_MS = [3000, 6000, 12000];
const activeColdStarts = new Set();

function notifyColdStart(config, active) {
  const requestId = config.metadata?.coldStartRequestId;
  if (!requestId) return;

  if (active) {
    activeColdStarts.add(requestId);
  } else {
    activeColdStarts.delete(requestId);
  }

  window.dispatchEvent(
    new CustomEvent("learnsphere:cold-start", {
      detail: { active: activeColdStarts.size > 0 },
    })
  );
}

function delay(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

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

      if (!config.metadata?.coldStartRequestId) {
        config.metadata = {
          ...config.metadata,
          coldStartRequestId: crypto.randomUUID(),
        };
      }

      if (!isBackground && !config.metadata.networkActivityStarted) {
        incrementNetworkActivity();
        config.metadata.networkActivityStarted = true;
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
      notifyColdStart(response.config, false);
      if (
        !response.config?.metadata?.isBackground &&
        !response.config?.metadata?.networkActivityCompleted
      ) {
        decrementNetworkActivity();
        response.config.metadata.networkActivityCompleted = true;
      }
      return response;
    },
    async (error) => {
      const config = error.config;
      const retryCount = config?.metadata?.coldStartRetryCount || 0;
      const canRetry =
        config &&
        !config.skipColdStartRetry &&
        RETRYABLE_STATUS_CODES.has(error.response?.status) &&
        retryCount < RETRY_DELAYS_MS.length;

      if (canRetry) {
        config.metadata.coldStartRetryCount = retryCount + 1;
        notifyColdStart(config, true);
        await delay(RETRY_DELAYS_MS[retryCount]);
        return axios.request(config);
      }

      if (config) {
        notifyColdStart(config, false);
      }
      if (
        config &&
        !config.metadata?.isBackground &&
        !config.metadata?.networkActivityCompleted
      ) {
        decrementNetworkActivity();
        config.metadata.networkActivityCompleted = true;
      }
      return Promise.reject(error);
    }
  );
}

