import axios from "axios";

const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL || "/api/auth";

export async function registerUser({ name, email, password, role }) {
  const payload = {
    name,
    email: email.trim().toLowerCase(),
    password,
    role,
  };

  return axios.post(`${AUTH_API_BASE_URL}/register`, payload);
}

export async function loginUser({ email, password }) {
  const payload = {
    email: email.trim().toLowerCase(),
    password,
  };

  const response = await axios.post(`${AUTH_API_BASE_URL}/login`, payload);
  return response.data;
}

export async function sendForgotPasswordOtp(email) {
  const payload = {
    email: email.trim().toLowerCase(),
  };

  const response = await axios.post(
    `${AUTH_API_BASE_URL}/forgot-password`,
    payload
  );
  return response.data;
}

export async function resetPassword({ email, otp, newPassword }) {
  const payload = {
    email: email.trim().toLowerCase(),
    otp: otp.trim(),
    newPassword,
  };

  const response = await axios.post(
    `${AUTH_API_BASE_URL}/reset-password`,
    payload
  );
  return response.data;
}

export function normalizeApiError(error, fallbackMessage) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  return message || fallbackMessage;
}
