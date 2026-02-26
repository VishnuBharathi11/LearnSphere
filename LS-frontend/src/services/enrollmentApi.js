import axios from "axios";

const ENROLLMENT_API_BASE_URL =
  import.meta.env.VITE_ENROLLMENT_API_BASE_URL || "/api/enrollments";
const FALLBACK_RAZORPAY_KEY =
  import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_SIf0T7lHEketYm";

function getAuthHeaders() {
  const token = window.appStore.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
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

export async function getEnrollmentsByCourses(courseIds = []) {
  if (!Array.isArray(courseIds) || courseIds.length === 0) return [];

  const filteredIds = Array.from(
    new Set(courseIds.map((id) => String(id || "").trim()).filter(Boolean))
  );

  if (filteredIds.length === 0) return [];

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
