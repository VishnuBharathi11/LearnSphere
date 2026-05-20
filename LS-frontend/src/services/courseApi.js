import axios from "axios";
import { appStore } from "./appStore";
import { getAdminUsers } from "./adminApi";

const COURSES_API_BASE_URL =
  import.meta.env.VITE_COURSE_API_BASE_URL || "/api/courses";
const CATEGORIES_API_BASE_URL =
  import.meta.env.VITE_CATEGORY_API_BASE_URL || "/api/categories";

const DEFAULT_CATEGORY = "General";
const DEFAULT_LEVEL = "Beginner";
const DEFAULT_INSTRUCTOR = "Instructor";
const INSTRUCTOR_CACHE_TTL_MS = 60000;
let instructorMapCache = {
  at: 0,
  map: new Map(),
};

function getAuthHeaders() {
  const token = appStore.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function deriveCategory(course, categoryMap) {
  return categoryMap.get(course.categoryId) || DEFAULT_CATEGORY;
}

function deriveLevel(course) {
  const title = (course.title || "").toLowerCase();
  if (title.includes("advanced")) return "Advanced";
  if (title.includes("intermediate")) return "Intermediate";
  return DEFAULT_LEVEL;
}

function deriveLessons(course) {
  const len = (course.description || "").length;
  return Math.max(8, Math.min(40, Math.floor(len / 18)));
}

function deriveRating(course) {
  const source = course.id || course.title || "course";
  const hash = Array.from(source).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const rating = 4 + (hash % 10) / 10;
  return Number(rating.toFixed(1));
}

function deriveEnrollments(course) {
  return 0;
}

async function getInstructorMap() {
  const now = Date.now();
  if (now - instructorMapCache.at < INSTRUCTOR_CACHE_TTL_MS) {
    return instructorMapCache.map;
  }

  try {
    const users = await getAdminUsers();
    const map = new Map(
      (Array.isArray(users) ? users : [])
        .filter((user) => user && user.id !== undefined && user.id !== null)
        .map((user) => [String(user.id), String(user.name || "").trim()])
    );
    instructorMapCache = { at: now, map };
    return map;
  } catch {
    return instructorMapCache.map;
  }
}

function mapCourse(course, categoryMap, instructorMap = new Map()) {
  const instructorName =
    instructorMap.get(String(course.instructorId || "")) ||
    String(course.instructorName || "").trim() ||
    DEFAULT_INSTRUCTOR;

  return {
    id: course.id,
    instructorId: course.instructorId || "",
    categoryId: course.categoryId || "",
    courseName: course.title,
    title: course.title,
    description: course.description || "",
    thumbnail: course.thumbnail || "",
    instructor: instructorName,
    category: deriveCategory(course, categoryMap),
    level: deriveLevel(course),
    rating: deriveRating(course),
    price: course.price || 0,
    lessons: deriveLessons(course),
    enrollments: deriveEnrollments(course),
    status: course.status || "DRAFT",
    createdAt: course.createdAt || null,
  };
}

export async function getCategoryMap() {
  try {
    const response = await axios.get(CATEGORIES_API_BASE_URL, { timeout: 12000 });
    const categories = Array.isArray(response.data) ? response.data : [];
    return new Map(categories.map((c) => [c.id, c.name]));
  } catch {
    return new Map();
  }
}

export async function getCategories() {
  const response = await axios.get(CATEGORIES_API_BASE_URL);
  return Array.isArray(response.data) ? response.data : [];
}

export async function deleteCategory(categoryId) {
  await axios.delete(`${CATEGORIES_API_BASE_URL}/${categoryId}`, {
    headers: getAuthHeaders(),
  });
}

export async function getPublishedCourses(page = 0, size = 100) {
  const [categoryMap, instructorMap] = await Promise.all([
    getCategoryMap(),
    getInstructorMap(),
  ]);
  const response = await axios.get(`${COURSES_API_BASE_URL}/published`, {
    params: { page, size },
    timeout: 12000,
  });
  const coursePage = response.data || {};
  const items = Array.isArray(coursePage.content) ? coursePage.content : [];
  return items.map((course) => mapCourse(course, categoryMap, instructorMap));
}

export async function getCourseById(id) {
  const [categoryMap, instructorMap] = await Promise.all([
    getCategoryMap(),
    getInstructorMap(),
  ]);
  const response = await axios.get(`${COURSES_API_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
    timeout: 12000,
  });
  return mapCourse(response.data, categoryMap, instructorMap);
}

export async function getCoursesByIds(courseIds = []) {
  const normalizedIds = Array.from(
    new Set(courseIds.map((id) => String(id || "").trim()).filter(Boolean))
  );
  if (normalizedIds.length === 0) return [];

  const [categoryMap, instructorMap] = await Promise.all([
    getCategoryMap(),
    getInstructorMap(),
  ]);
  const results = await Promise.all(
    normalizedIds.map(async (courseId) => {
      try {
        const response = await axios.get(`${COURSES_API_BASE_URL}/${encodeURIComponent(courseId)}`, {
          headers: getAuthHeaders(),
          timeout: 12000,
        });
        return mapCourse(response.data, categoryMap, instructorMap);
      } catch {
        return null;
      }
    })
  );

  return results.filter(Boolean);
}

export async function getInstructorCourses(instructorId, page = 0, size = 30) {
  const [categoryMap, instructorMap] = await Promise.all([
    getCategoryMap(),
    getInstructorMap(),
  ]);
  const response = await axios.get(
    `${COURSES_API_BASE_URL}/instructor/${instructorId}`,
    {
      params: { page, size },
      headers: getAuthHeaders(),
    }
  );
  const coursePage = response.data || {};
  const items = Array.isArray(coursePage.content) ? coursePage.content : [];
  return items.map((course) => mapCourse(course, categoryMap, instructorMap));
}

export async function createCategory({ name, description = "" }) {
  const response = await axios.post(
    CATEGORIES_API_BASE_URL,
    { name, description },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function createCourse({
  title,
  description,
  thumbnail,
  price,
  categoryId,
  instructorId,
}) {
  const payload = {
    title,
    description,
    thumbnail,
    price: Number(price),
    categoryId,
    instructorId: String(instructorId),
  };

  const response = await axios.post(COURSES_API_BASE_URL, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function updateCourse(
  id,
  { title, description, thumbnail, price, categoryId, instructorId }
) {
  const payload = {
    title,
    description,
    thumbnail,
    price: Number(price),
    categoryId,
    instructorId: String(instructorId),
  };

  const response = await axios.put(`${COURSES_API_BASE_URL}/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function submitCourseForReview(courseId) {
  const response = await axios.post(
    `${COURSES_API_BASE_URL}/${courseId}/submit`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function publishCourse(courseId) {
  const response = await axios.post(
    `${COURSES_API_BASE_URL}/${courseId}/publish`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getAdminCourses({ status = "", search = "" } = {}) {
  const [categoryMap, instructorMap] = await Promise.all([
    getCategoryMap(),
    getInstructorMap(),
  ]);
  const response = await axios.get(`${COURSES_API_BASE_URL}/admin/all`, {
    params: {
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    },
    headers: getAuthHeaders(),
  });
  const items = Array.isArray(response.data) ? response.data : [];
  return items.map((course) => mapCourse(course, categoryMap, instructorMap));
}

export async function rejectCourse(courseId, note = "REJECTED") {
  const response = await axios.post(
    `${COURSES_API_BASE_URL}/${courseId}/reject`,
    null,
    {
      params: { note },
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

export async function archiveCourse(courseId) {
  const response = await axios.post(
    `${COURSES_API_BASE_URL}/${courseId}/archive`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function activateCourse(courseId) {
  const response = await axios.post(
    `${COURSES_API_BASE_URL}/${courseId}/activate`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function adminDeleteCourse(courseId) {
  await axios.delete(`${COURSES_API_BASE_URL}/${courseId}/admin`, {
    headers: getAuthHeaders(),
  });
}

export async function getCourseLessons(courseId) {
  const response = await axios.get(`${COURSES_API_BASE_URL}/${courseId}/lessons`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCourseLesson(courseId, payload) {
  const response = await axios.post(`${COURSES_API_BASE_URL}/${courseId}/lessons`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function updateCourseLesson(courseId, lessonId, payload) {
  const response = await axios.put(
    `${COURSES_API_BASE_URL}/${courseId}/lessons/${lessonId}`,
    payload,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function deleteCourseLesson(courseId, lessonId) {
  await axios.delete(`${COURSES_API_BASE_URL}/${courseId}/lessons/${lessonId}`, {
    headers: getAuthHeaders(),
  });
}
