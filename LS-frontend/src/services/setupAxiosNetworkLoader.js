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
      if (!config?.headers?.["X-Skip-Global-Loader"]) {
        incrementNetworkActivity();
      }
      return config;
    },
    (error) => {
      decrementNetworkActivity();
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      decrementNetworkActivity();
      return response;
    },
    (error) => {
      decrementNetworkActivity();
      return Promise.reject(error);
    }
  );
}

