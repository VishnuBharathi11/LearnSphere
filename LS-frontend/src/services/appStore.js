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

export const appStore = {
  getItem(key) {
    if (hasLocalStorage) return window.localStorage.getItem(key);
    if (!memory.has(key)) return null;
    return memory.get(key);
  },
  setItem(key, value) {
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
