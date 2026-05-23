import axios from "axios";
import { appStore } from "./appStore";

const CERTIFICATE_API_BASE_URL =
  import.meta.env.VITE_CERTIFICATE_API_BASE_URL || "/api/certificates";

function getAuthHeaders() {
  const token = appStore.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function generateCertificate(payload) {
  const response = await axios.post(`${CERTIFICATE_API_BASE_URL}/generate`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getCertificate(certificateId) {
  const response = await axios.get(`${CERTIFICATE_API_BASE_URL}/${certificateId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getCertificateForRender(certificateId) {
  const response = await axios.get(`${CERTIFICATE_API_BASE_URL}/render/${certificateId}`);
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
  return `${CERTIFICATE_API_BASE_URL}/${certificateId}/download`;
}
