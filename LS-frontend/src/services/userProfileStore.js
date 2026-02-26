import { appStore } from "./appStore";

const CURRENT_USER_KEY = "currentUser";
const AUTH_TOKEN_KEY = "authToken";
const IS_LOGGED_IN_KEY = "isLoggedIn";
const PROFILE_UPDATED_EVENT = "learnsphere-profile-updated";

function parseJson(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function registrationKey(email) {
  return `registrationProfile_${normalizeEmail(email)}`;
}

function instructorProfileKey(userId) {
  return `instructorProfile_${userId}`;
}

function learnerProfileKey(userId) {
  return `learnerProfile_${userId}`;
}

export function saveRegistrationSeed({ name, email, phone, role }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  const seed = {
    name: (name || "").trim(),
    email: normalizedEmail,
    phone: (phone || "").trim(),
    role: role || "",
  };

  appStore.setItem(registrationKey(normalizedEmail), JSON.stringify(seed));
}

export function getRegistrationSeedByEmail(email) {
  return parseJson(appStore.getItem(registrationKey(email)), null);
}

export function getCurrentUser() {
  return parseJson(appStore.getItem(CURRENT_USER_KEY), null);
}

export function setCurrentUser(user) {
  appStore.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export function setAuthToken(token) {
  appStore.setItem(AUTH_TOKEN_KEY, token || "");
  appStore.setItem(IS_LOGGED_IN_KEY, "true");
}

export function clearAuthSession() {
  appStore.removeItem(CURRENT_USER_KEY);
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

export function getInstructorProfile(userId) {
  if (!userId) return null;
  return parseJson(appStore.getItem(instructorProfileKey(userId)), null);
}

export function buildDefaultInstructorProfile(user, registrationSeed) {
  return {
    fullName: user?.name || registrationSeed?.name || "",
    email: user?.email || registrationSeed?.email || "",
    phone: user?.phone || registrationSeed?.phone || "",
    bio: "",
    expertise: "",
    experience: "",
    linkedin: "",
    portfolio: "",
    professionalWebsite: "",
    image: user?.image || null,
  };
}

export function buildDefaultLearnerProfile(user, registrationSeed) {
  return {
    name: user?.name || user?.username || registrationSeed?.name || "",
    email: user?.email || registrationSeed?.email || "",
    phone: user?.phone || registrationSeed?.phone || "",
    bio: "",
    image: user?.image || null,
  };
}

export function saveInstructorProfile(userId, profileData) {
  if (!userId) return;

  appStore.setItem(
    instructorProfileKey(userId),
    JSON.stringify(profileData)
  );

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const updatedUser = {
    ...currentUser,
    name: profileData.fullName || currentUser.name,
    username: profileData.fullName || currentUser.username,
    phone: profileData.phone || currentUser.phone,
    image: profileData.image || currentUser.image || null,
  };

  setCurrentUser(updatedUser);
}

export function getLearnerProfile(userId) {
  if (!userId) return null;
  return parseJson(appStore.getItem(learnerProfileKey(userId)), null);
}

export function saveLearnerProfile(userId, profileData) {
  if (!userId) return;

  appStore.setItem(learnerProfileKey(userId), JSON.stringify(profileData));

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const updatedUser = {
    ...currentUser,
    name: profileData.name || currentUser.name,
    username: profileData.name || currentUser.username,
    email: profileData.email || currentUser.email,
    phone: profileData.phone || currentUser.phone,
    image: profileData.image || currentUser.image || null,
  };

  setCurrentUser(updatedUser);
}
