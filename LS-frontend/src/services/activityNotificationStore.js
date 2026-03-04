import { appStore } from "./appStore";

const STORAGE_KEY = "app_notifications_v1";
const MAX_NOTIFICATIONS = 250;

function parseStoredList(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadAllNotifications() {
  return parseStoredList(appStore.getItem(STORAGE_KEY)).filter(Boolean);
}

function saveAllNotifications(list) {
  const safe = Array.isArray(list) ? list.filter(Boolean).slice(0, MAX_NOTIFICATIONS) : [];
  appStore.setItem(STORAGE_KEY, JSON.stringify(safe));
}

function normalizeDate(value) {
  const iso = value ? new Date(value).toISOString() : new Date().toISOString();
  return Number.isNaN(new Date(iso).getTime()) ? new Date().toISOString() : iso;
}

function generateLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getLocalNotificationsByUser(userId, role = "") {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return [];
  const safeRole = String(role || "").trim().toLowerCase();

  return loadAllNotifications()
    .filter((item) => String(item.userId) === safeUserId)
    .filter((item) => !safeRole || String(item.role || "").toLowerCase() === safeRole)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export function pushLocalNotification(notification = {}) {
  const safeUserId = String(notification.userId || "").trim();
  if (!safeUserId) return null;

  const all = loadAllNotifications();
  const eventKey = String(notification.eventKey || "").trim();
  if (eventKey) {
    const exists = all.some(
      (item) => String(item.userId) === safeUserId && String(item.eventKey || "") === eventKey
    );
    if (exists) return null;
  }

  const next = {
    id: notification.id || generateLocalId(),
    source: "local",
    userId: safeUserId,
    role: String(notification.role || "").trim().toLowerCase(),
    type: String(notification.type || "general"),
    title: String(notification.title || "New update"),
    message: String(notification.message || ""),
    eventKey: eventKey || null,
    read: Boolean(notification.read),
    createdAt: normalizeDate(notification.createdAt),
    courseId: notification.courseId ? String(notification.courseId) : "",
    threadId: notification.threadId ? String(notification.threadId) : "",
    targetPath: notification.targetPath ? String(notification.targetPath) : "",
  };

  saveAllNotifications([next, ...all]);
  return next;
}

export function markLocalNotificationRead(notificationId, userId) {
  const safeUserId = String(userId || "").trim();
  const safeNotificationId = String(notificationId || "").trim();
  if (!safeUserId || !safeNotificationId) return;

  const next = loadAllNotifications().map((item) => {
    if (String(item.userId) !== safeUserId) return item;
    if (String(item.id) !== safeNotificationId) return item;
    return { ...item, read: true };
  });

  saveAllNotifications(next);
}

export function markAllLocalNotificationsRead(userId, role = "") {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return;
  const safeRole = String(role || "").trim().toLowerCase();

  const next = loadAllNotifications().map((item) => {
    if (String(item.userId) !== safeUserId) return item;
    if (safeRole && String(item.role || "").toLowerCase() !== safeRole) return item;
    return { ...item, read: true };
  });

  saveAllNotifications(next);
}
