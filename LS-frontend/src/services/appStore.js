const memory = new Map();

const hasLocalStorage = (() => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
})();

function normalize(value) {
  if (value === undefined || value === null) {
    return null;
  }
  return String(value);
}

const DEPRECATED_KEYS = new Set([
  "Token",
  "users",
  "courses",
  "courseDiscussions",
  "courseRatings",
  "forum_topics",
  "forum_notifications",
  "enrolledCourses",
  "rzp_checkout_order_id",
  "rzp_device_id",
  "rzp_stored_checkout_id",
]);

function isDeprecatedKey(key) {
  const safeKey = String(key || "");
  if (DEPRECATED_KEYS.has(safeKey)) return true;
  return safeKey.startsWith("rzp_");
}

function isDeprecatedPrefixKey(key) {
  const safeKey = String(key || "");
  return (
    safeKey.startsWith("registrationProfile_") ||
    safeKey.startsWith("instructorProfile_") ||
    safeKey.startsWith("learnerProfile_")
  );
}

export function cleanupDeprecatedStoreKeys() {
  if (!hasLocalStorage) return;

  for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (isDeprecatedKey(key) || isDeprecatedPrefixKey(key)) {
      window.localStorage.removeItem(key);
    }
  }
}

export const appStore = {
  getItem(key) {
    if (hasLocalStorage) return window.localStorage.getItem(key);
    if (!memory.has(key)) return null;
    return memory.get(key);
  },
  setItem(key, value) {
    if (isDeprecatedKey(key) || isDeprecatedPrefixKey(key)) {
      return;
    }

    const normalized = normalize(value);
    if (hasLocalStorage) {
      window.localStorage.setItem(key, normalized);
      return;
    }
    memory.set(key, normalized);
  },
  removeItem(key) {
    if (hasLocalStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    memory.delete(key);
  },
  clear() {
    if (hasLocalStorage) {
      window.localStorage.clear();
      return;
    }
    memory.clear();
  },
};
