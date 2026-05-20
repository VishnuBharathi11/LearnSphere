import axios from "axios";
import { getFriendlyErrorMessage } from "./apiError";
import { appStore } from "./appStore";

const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || "/api/auth";

export async function registerUser({ name, email, phone, password, role = "learner" }) {
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

export async function submitInstructorApplication({
  name,
  expertise,
  email,
  phone,
  dateOfBirth,
  linkedin,
  resumeFile,
}) {
  const formData = new FormData();
  formData.append("name", (name || "").trim());
  formData.append("expertise", (expertise || "").trim());
  formData.append("email", (email || "").trim().toLowerCase());
  formData.append("phone", (phone || "").trim());
  formData.append("dateOfBirth", dateOfBirth || "");
  formData.append("linkedin", (linkedin || "").trim());
  formData.append("resume", resumeFile);

  const response = await axios.post(`${AUTH_API_BASE_URL}/instructor-applications`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function getInstructorApplications() {
  const response = await axios.get(`${AUTH_API_BASE_URL}/instructor-applications`, {
    headers: authHeader(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getInstructorApplicationResume(applicationId) {
  const response = await axios.get(
    `${AUTH_API_BASE_URL}/instructor-applications/${applicationId}/resume`,
    {
      headers: authHeader(),
      responseType: "blob",
    }
  );
  return response;
}

export async function approveInstructorApplication(applicationId, payload) {
  const response = await axios.post(
    `${AUTH_API_BASE_URL}/instructor-applications/${applicationId}/approve`,
    payload,
    { headers: authHeader() }
  );
  return response.data;
}

export async function rejectInstructorApplication(applicationId) {
  const response = await axios.post(
    `${AUTH_API_BASE_URL}/instructor-applications/${applicationId}/reject`,
    null,
    { headers: authHeader() }
  );
  return response.data;
}

export function normalizeApiError(error, fallbackMessage) {
  return getFriendlyErrorMessage(error, fallbackMessage);
}
