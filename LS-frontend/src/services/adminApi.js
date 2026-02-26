import axios from "axios";

const ADMIN_API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || "/api/admin";

function getAuthHeaders() {
  const token = window.appStore.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAdminDashboard() {
  const response = await axios.get(`${ADMIN_API_BASE_URL}/dashboard`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getAdminUsers() {
  const response = await axios.get(`${ADMIN_API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function suspendAdminUser(userId, value) {
  const response = await axios.put(
    `${ADMIN_API_BASE_URL}/users/${userId}/suspend`,
    null,
    {
      params: { value },
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

export async function deleteAdminUser(userId) {
  await axios.delete(`${ADMIN_API_BASE_URL}/users/${userId}`, {
    headers: getAuthHeaders(),
  });
}

export async function updateAdminUserRole(userId, role) {
  const response = await axios.put(
    `${ADMIN_API_BASE_URL}/users/${userId}/role`,
    { role },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getAdminSettings() {
  const response = await axios.get(`${ADMIN_API_BASE_URL}/settings`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function saveAdminSettings(payload) {
  const response = await axios.put(`${ADMIN_API_BASE_URL}/settings`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getAdminRoles() {
  const response = await axios.get(`${ADMIN_API_BASE_URL}/roles`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function saveAdminRolePermissions(payload) {
  const response = await axios.put(`${ADMIN_API_BASE_URL}/roles`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getCourseMetrics(courseIds = []) {
  if (!Array.isArray(courseIds) || courseIds.length === 0) return [];
  const response = await axios.get(`${ADMIN_API_BASE_URL}/course-metrics`, {
    params: { courseIds },
    headers: getAuthHeaders(),
    paramsSerializer: {
      serialize: (params) => {
        const values = Array.isArray(params?.courseIds) ? params.courseIds : [];
        return values.map((value) => `courseIds=${encodeURIComponent(value)}`).join("&");
      },
    },
  });
  return Array.isArray(response.data) ? response.data : [];
}

