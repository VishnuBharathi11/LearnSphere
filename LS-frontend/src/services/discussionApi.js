import axios from "axios";

const DISCUSSION_API_BASE_URL =
  import.meta.env.VITE_DISCUSSION_API_BASE_URL || "/discussion";

function getAuthHeaders() {
  const token = window.appStore.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCourseDiscussions(courseId) {
  const response = await axios.get(`${DISCUSSION_API_BASE_URL}/${courseId}`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createDiscussionPost({ courseId, userId, message, parentId = null }) {
  const response = await axios.post(
    DISCUSSION_API_BASE_URL,
    {
      courseId: Number(courseId),
      userId: Number(userId),
      message: String(message || "").trim(),
      parentId: parentId == null ? null : Number(parentId),
    },
    { headers: getAuthHeaders() }
  );
  return response.data;
}
