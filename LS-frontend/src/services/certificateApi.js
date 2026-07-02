import axios from "axios";
import { appStore } from "./appStore";

const CERTIFICATE_API_BASE_URL =
  import.meta.env.VITE_CERTIFICATE_API_BASE_URL || "/api/certificates";
const certificateGenerationRequests = new Map();

export function isValidCertificateRouteId(value) {
  const normalized = String(value ?? "").trim();
  return Boolean(normalized) && !["nan", "null", "undefined"].includes(normalized.toLowerCase());
}

function requireValidCertificateId(value) {
  if (!isValidCertificateRouteId(value)) {
    throw new TypeError("Invalid certificate ID.");
  }
  return encodeURIComponent(String(value).trim());
}

function getAuthHeaders() {
  const token = appStore.getItem("authToken");
  return token && token !== "null" && token !== "undefined"
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function generateCertificate(payload) {
  const studentUserId = String(payload?.studentUserId || "").trim();
  const courseId = String(payload?.courseId || "").trim();
  if (!studentUserId || !isValidCertificateRouteId(courseId)) {
    throw new TypeError("A valid learner and course ID are required to generate a certificate.");
  }
  const requestKey = `${studentUserId}:${courseId}`;
  if (certificateGenerationRequests.has(requestKey)) {
    return certificateGenerationRequests.get(requestKey);
  }
  const request = axios
    .post(`${CERTIFICATE_API_BASE_URL}/generate`, payload, {
      headers: getAuthHeaders(),
    })
    .then((response) => response.data)
    .finally(() => certificateGenerationRequests.delete(requestKey));
  certificateGenerationRequests.set(requestKey, request);
  return request;
}

export async function getCertificate(certificateId) {
  const validId = requireValidCertificateId(certificateId);
  const response = await axios.get(`${CERTIFICATE_API_BASE_URL}/${validId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getCertificateForRender(certificateId) {
  const validId = requireValidCertificateId(certificateId);
  const response = await axios.get(`${CERTIFICATE_API_BASE_URL}/render/${validId}`);
  return response.data;
}

export async function getStudentCertificates(studentUserId) {
  if (!studentUserId) return [];
  const response = await axios.get(`${CERTIFICATE_API_BASE_URL}/student/${studentUserId}`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function verifyCertificate(token) {
  const response = await axios.get(`${CERTIFICATE_API_BASE_URL}/verify/${token}`);
  return response.data;
}

export async function getCertificateTemplates() {
  const response = await axios.get(`${CERTIFICATE_API_BASE_URL}/templates`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function saveCertificateTemplate(payload) {
  const response = await axios.post(`${CERTIFICATE_API_BASE_URL}/templates`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export function getCertificateDownloadUrl(certificateId) {
  const validId = requireValidCertificateId(certificateId);
  return `${CERTIFICATE_API_BASE_URL}/${validId}/download`;
}
