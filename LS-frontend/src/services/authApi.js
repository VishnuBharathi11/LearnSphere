import axios from "axios";
import { getFriendlyErrorMessage } from "./apiError";
import { appStore } from "./appStore";

const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || "/api/auth";

export async function registerUser({ name, email, phone, password, role }) {
  const payload = {
    name,
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    password,
    role,
  };

  const response = await axios.post(`${AUTH_API_BASE_URL}/register`, payload);
  return response;
}

export async function loginUser({ email, password }) {
  const payload = {
    email: email.trim().toLowerCase(),
    password,
  };

  const response = await axios.post(`${AUTH_API_BASE_URL}/login`, payload);
  return response.data;
}

function authHeader() {
  const token = appStore.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMyProfile() {
  const response = await axios.get(`${AUTH_API_BASE_URL}/profile`, {
    headers: authHeader(),
  });
  return response.data;
}

export async function updateMyProfile(profilePayload) {
  const response = await axios.put(`${AUTH_API_BASE_URL}/profile`, profilePayload, {
    headers: authHeader(),
  });
  return response.data;
}

export async function sendForgotPasswordOtp(email) {
  const payload = {
    email: email.trim().toLowerCase(),
  };

  const response = await axios.post(`${AUTH_API_BASE_URL}/forgot-password`, payload);
  return response.data;
}

export async function resetPassword({ email, otp, newPassword }) {
  const payload = {
    email: email.trim().toLowerCase(),
    otp: otp.trim(),
    newPassword,
  };

  const response = await axios.post(`${AUTH_API_BASE_URL}/reset-password`, payload);
  return response.data;
}

export function normalizeApiError(error, fallbackMessage) {
  return getFriendlyErrorMessage(error, fallbackMessage);
}
