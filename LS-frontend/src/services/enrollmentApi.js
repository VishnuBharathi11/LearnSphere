import axios from "axios";
import { appStore } from "./appStore";

const ENROLLMENT_API_BASE_URL =
  import.meta.env.VITE_ENROLLMENT_API_BASE_URL || "/api/enrollments";
const FALLBACK_RAZORPAY_KEY =
  import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_SIf0T7lHEketYm";
const ENROLLMENT_CACHE_TTL_MS = 10000;
const enrollmentByUserCache = new Map();
const enrollmentByCoursesRequests = new Map();
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const MAX_GET_ATTEMPTS = 3;

function getAuthHeaders() {
  const token = appStore.getItem("authToken");
  return token && token !== "null" && token !== "undefined"
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function checkEnrollmentStatus(userId, courseId) {
  const response = await axios.get(`${ENROLLMENT_API_BASE_URL}/status`, {
    params: { userId, courseId },
    headers: getAuthHeaders(),
  });
  return Boolean(response.data);
}

export async function enrollInFreeCourse(userId, courseId) {
  const response = await axios.post(
    `${ENROLLMENT_API_BASE_URL}/free`,
    { userId, courseId },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getEnrollmentsByCourse(courseId) {
  const response = await axios.get(`${ENROLLMENT_API_BASE_URL}/course/${courseId}`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getEnrollmentsByUser(userId) {
  if (!userId) return [];
  const normalizedUserId = encodeURIComponent(String(userId));
  const now = Date.now();
  const cached = enrollmentByUserCache.get(normalizedUserId);
  if (cached && now - cached.at < ENROLLMENT_CACHE_TTL_MS) {
    return cached.promise;
  }

  const promise = axios
    .get(`${ENROLLMENT_API_BASE_URL}/user/${normalizedUserId}`, {
      headers: getAuthHeaders(),
    })
    .then((response) => (Array.isArray(response.data) ? response.data : []))
    .catch((error) => {
      enrollmentByUserCache.delete(normalizedUserId);
      throw error;
    });

  enrollmentByUserCache.set(normalizedUserId, { at: now, promise });
  return promise;
}

export async function getEnrollmentsByCourses(courseIds = []) {
  if (!Array.isArray(courseIds) || courseIds.length === 0) return [];

  const filteredIds = Array.from(
    new Set(courseIds.map((id) => String(id || "").trim()).filter(Boolean))
  );

  if (filteredIds.length === 0) return [];

  const requestKey = filteredIds.slice().sort().join(",");
  if (enrollmentByCoursesRequests.has(requestKey)) {
    return enrollmentByCoursesRequests.get(requestKey);
  }

  const request = retryIdempotentGet(async () => {
    const response = await axios.get(`${ENROLLMENT_API_BASE_URL}/courses`, {
      params: { courseIds: filteredIds },
      paramsSerializer: {
        serialize: (params) => {
          const values = Array.isArray(params?.courseIds) ? params.courseIds : [];
          return values.map((value) => `courseIds=${encodeURIComponent(value)}`).join("&");
        },
      },
      headers: getAuthHeaders(),
    });
    return Array.isArray(response.data) ? response.data : [];
  }).finally(() => enrollmentByCoursesRequests.delete(requestKey));

  enrollmentByCoursesRequests.set(requestKey, request);
  return request;
}

async function retryIdempotentGet(operation) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_GET_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const status = Number(error?.response?.status || 0);
      const isNetworkTimeout = error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT";
      if (
        attempt === MAX_GET_ATTEMPTS ||
        (!RETRYABLE_STATUS_CODES.has(status) && !isNetworkTimeout)
      ) {
        throw error;
      }
      const backoffMs = 350 * 2 ** (attempt - 1) + Math.floor(Math.random() * 150);
      await new Promise((resolve) => window.setTimeout(resolve, backoffMs));
    }
  }
  throw lastError;
}

export async function createEnrollmentOrder(userId, courseId, amount) {
  const response = await axios.post(
    `${ENROLLMENT_API_BASE_URL}/order`,
    {
      userId: String(userId),
      courseId: String(courseId),
      amount: Number(amount) > 0 ? Number(amount) : undefined,
    },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getRazorpayPublicKey() {
  return FALLBACK_RAZORPAY_KEY;
}

export async function verifyEnrollmentPayment({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  userId,
  courseId,
}) {
  const response = await axios.post(
    `${ENROLLMENT_API_BASE_URL}/verify`,
    {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId: String(userId),
      courseId: String(courseId),
    },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

function buildCourseIdParams(courseIds = []) {
  const filteredIds = Array.from(
    new Set(courseIds.map((id) => String(id || "").trim()).filter(Boolean))
  );

  return {
    courseIds: filteredIds,
    paramsSerializer: {
      serialize: (params) => {
        const values = Array.isArray(params?.courseIds) ? params.courseIds : [];
        return values.map((value) => `courseIds=${encodeURIComponent(value)}`).join("&");
      },
    },
  };
}

export async function getInstructorWithdrawalSummary(instructorId, courseIds = []) {
  if (!instructorId) return null;
  const courseParams = buildCourseIdParams(courseIds);
  const response = await axios.get(
    `${ENROLLMENT_API_BASE_URL}/instructor/${encodeURIComponent(String(instructorId))}/withdrawals/summary`,
    {
      params: { courseIds: courseParams.courseIds },
      paramsSerializer: courseParams.paramsSerializer,
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

export async function getInstructorWithdrawals(instructorId, limit = 20) {
  if (!instructorId) return [];
  const response = await axios.get(
    `${ENROLLMENT_API_BASE_URL}/instructor/${encodeURIComponent(String(instructorId))}/withdrawals`,
    {
      params: { limit },
      headers: getAuthHeaders(),
    }
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function requestInstructorWithdrawal(instructorId, payload) {
  const response = await axios.post(
    `${ENROLLMENT_API_BASE_URL}/instructor/${encodeURIComponent(String(instructorId))}/withdrawals`,
    payload,
    { headers: getAuthHeaders() }
  );
  return response.data;
}
