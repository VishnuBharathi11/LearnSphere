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

export async function getCourseProgress(userId, courseId) {
  if (!userId || !courseId) return null;
  const response = await axios.get(
    `${PROGRESS_API_BASE_URL}/courses/${encodeURIComponent(String(courseId))}/users/${encodeURIComponent(String(userId))}`,
    { headers: getAuthHeaders(), timeout: 12000 }
  );
  return response.data || null;
}

export async function getProgressByCourses(userId, courseIds = []) {
  if (!userId || !Array.isArray(courseIds) || courseIds.length === 0) return [];
  const response = await axios.get(
    `${PROGRESS_API_BASE_URL}/users/${encodeURIComponent(String(userId))}/courses`,
    {
      params: { courseIds },
      paramsSerializer: {
        serialize: (params) => {
          const values = Array.isArray(params?.courseIds) ? params.courseIds : [];
          return values.map((value) => `courseIds=${encodeURIComponent(value)}`).join("&");
        },
      },
      headers: getAuthHeaders(),
      timeout: 12000,
    }
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function markLessonCompletedDb(userId, courseId, lessonId) {
  const response = await axios.post(
    `${PROGRESS_API_BASE_URL}/courses/${encodeURIComponent(String(courseId))}/lessons/complete`,
    { userId, lessonId },
    { headers: getAuthHeaders(), timeout: 12000 }
  );
  return response.data || null;
}

export async function saveLessonAssessmentDb(userId, courseId, lessonId, payload) {
  const response = await axios.post(
    `${PROGRESS_API_BASE_URL}/courses/${encodeURIComponent(String(courseId))}/assessments/lesson`,
    { userId, lessonId, ...payload },
    { headers: getAuthHeaders(), timeout: 12000 }
  );
  return response.data || null;
}

export async function saveFinalAssessmentDb(userId, courseId, payload) {
  const response = await axios.post(
    `${PROGRESS_API_BASE_URL}/courses/${encodeURIComponent(String(courseId))}/assessments/final`,
    { userId, ...payload },
    { headers: getAuthHeaders(), timeout: 12000 }
  );
  return response.data || null;
}
