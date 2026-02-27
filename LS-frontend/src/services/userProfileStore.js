import { appStore } from "./appStore";
import { getMyProfile } from "./authApi";

const AUTH_TOKEN_KEY = "authToken";
const IS_LOGGED_IN_KEY = "isLoggedIn";
const PROFILE_UPDATED_EVENT = "learnsphere-profile-updated";

let currentUserCache = null;

function toCurrentUser(profile) {
  if (!profile) return null;
  return {
    id: profile.userId,
    userId: profile.userId,
    name: profile.name || "",
    username: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    role: profile.role || "",
    image: profile.profileImage || null,
  };
}

export function getCurrentUser() {
  return currentUserCache;
}

export function setCurrentUser(user) {
  currentUserCache = user || null;
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export function hasAuthToken() {
  return Boolean(appStore.getItem(AUTH_TOKEN_KEY));
}

export function setAuthToken(token) {
  appStore.setItem(AUTH_TOKEN_KEY, token || "");
  appStore.setItem(IS_LOGGED_IN_KEY, "true");
}

export async function loadCurrentUser() {
  if (!hasAuthToken()) return null;
  const profile = await getMyProfile();
  const normalized = toCurrentUser(profile);
  setCurrentUser(normalized);
  return normalized;
}

export function clearAuthSession() {
  currentUserCache = null;
  appStore.removeItem(AUTH_TOKEN_KEY);
  appStore.removeItem(IS_LOGGED_IN_KEY);
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export function logoutUser() {
  clearAuthSession();
}

export function onProfileUpdated(handler) {
  window.addEventListener(PROFILE_UPDATED_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
