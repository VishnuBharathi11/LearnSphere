import axios from "axios";
import { appStore } from "./appStore";

const PROGRESS_API_BASE_URL = import.meta.env.VITE_PROGRESS_API_BASE_URL || "/api/progress";

function getAuthHeaders() {
  const token = appStore.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function saveCourseQuiz(payload) {
  const response = await axios.post(`${PROGRESS_API_BASE_URL}/quizzes`, payload, {
    headers: getAuthHeaders(),
    timeout: 12000,
  });
  return response.data;
}

export async function getCourseQuizByCourseId(courseId) {
  if (!courseId) return null;
  try {
    const response = await axios.get(`${PROGRESS_API_BASE_URL}/quizzes/course/${encodeURIComponent(String(courseId))}/latest`, {
      headers: getAuthHeaders(),
      timeout: 12000,
    });
    return response.data || null;
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

export async function getCourseQuizzesByCourseId(courseId) {
  if (!courseId) return [];
  const response = await axios.get(`${PROGRESS_API_BASE_URL}/quizzes/course/${encodeURIComponent(String(courseId))}`, {
    headers: getAuthHeaders(),
    timeout: 12000,
  });
  return Array.isArray(response.data) ? response.data : [];
}
