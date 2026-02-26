import axios from "axios";
import { appStore } from "./appStore";

const DISCUSSION_API_BASE = import.meta.env.VITE_DISCUSSION_API_BASE_URL || "/api";

function getCurrentUser() {
  try {
    return JSON.parse(appStore.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  const token = appStore.getItem("authToken");
  const currentUser = getCurrentUser();

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (currentUser?.id || currentUser?.userId) headers["X-User-Id"] = String(currentUser.id || currentUser.userId);
  return headers;
}

export async function createThread(courseId, payload) {
  const response = await axios.post(`${DISCUSSION_API_BASE}/courses/${courseId}/threads`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function listThreads(courseId, params = {}) {
  const response = await axios.get(`${DISCUSSION_API_BASE}/courses/${courseId}/threads`, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function listReportedThreads(courseId) {
  const response = await axios.get(`${DISCUSSION_API_BASE}/courses/${courseId}/threads/reported`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getThread(threadId, params = {}) {
  const response = await axios.get(`${DISCUSSION_API_BASE}/threads/${threadId}`, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function createReply(threadId, payload) {
  const response = await axios.post(`${DISCUSSION_API_BASE}/threads/${threadId}/replies`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function upvoteThread(threadId) {
  const response = await axios.put(`${DISCUSSION_API_BASE}/threads/${threadId}/upvote`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function upvoteReply(replyId) {
  const response = await axios.put(`${DISCUSSION_API_BASE}/replies/${replyId}/upvote`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function reportReply(replyId, payload) {
  await axios.post(`${DISCUSSION_API_BASE}/replies/${replyId}/report`, payload, {
    headers: getAuthHeaders(),
  });
}

export async function deleteThread(threadId) {
  await axios.delete(`${DISCUSSION_API_BASE}/threads/${threadId}`, {
    headers: getAuthHeaders(),
  });
}

export async function deleteReply(replyId) {
  await axios.delete(`${DISCUSSION_API_BASE}/replies/${replyId}`, {
    headers: getAuthHeaders(),
  });
}

export async function lockThread(threadId, locked) {
  await axios.put(`${DISCUSSION_API_BASE}/threads/${threadId}/lock`, null, {
    params: { locked },
    headers: getAuthHeaders(),
  });
}

export async function getNotifications(userId) {
  const response = await axios.get(`/notifications/${encodeURIComponent(String(userId))}`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function markNotificationRead(notificationId, userId) {
  await axios.patch(`/notifications/${encodeURIComponent(String(notificationId))}/read`, null, {
    params: { userId: String(userId) },
    headers: getAuthHeaders(),
  });
}

// Backward-compat wrappers
export async function getCourseDiscussions(courseId) {
  const data = await listThreads(String(courseId), { page: 0, size: 100 });
  return (data.items || []).map((thread) => ({
    id: thread.id,
    courseId: thread.courseId,
    userId: thread.authorId,
    message: thread.content,
    parentId: null,
    createdAt: thread.createdAt,
  }));
}

export async function createDiscussionPost({ courseId, message, parentId = null }) {
  if (parentId) {
    return createReply(String(parentId), { content: message });
  }
  return createThread(String(courseId), {
    title: "Course Discussion",
    content: message,
  });
}
