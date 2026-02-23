import axios from "axios";

const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL || "/api/auth";
const LOCAL_AUTH_USERS_KEY = "learnsphere_local_auth_users";

const DEMO_USERS = [
  {
    id: "demo_learner",
    name: "Learner User",
    email: "learner@gmail.com",
    password: "123",
    role: "learner",
  },
  {
    id: "demo_instructor",
    name: "Instructor User",
    email: "instructor@gmail.com",
    password: "123",
    role: "instructor",
  },
  {
    id: "demo_admin",
    name: "Admin User",
    email: "admin@gmail.com",
    password: "123",
    role: "admin",
  },
];

const shouldUseLocalFallback = (error) =>
  !error?.response || Number(error?.response?.status) >= 500;

const readLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users));
};

const getAllFallbackUsers = () => [...DEMO_USERS, ...readLocalUsers()];

export async function registerUser({ name, email, password, role }) {
  const payload = {
    name,
    email: email.trim().toLowerCase(),
    password,
    role,
  };

  try {
    return await axios.post(`${AUTH_API_BASE_URL}/register`, payload);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    const existing = getAllFallbackUsers().find(
      (user) => user.email === payload.email
    );

    if (existing) {
      throw new Error("Email already registered");
    }

    const localUsers = readLocalUsers();
    const newUser = {
      id: `local_${Date.now()}`,
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      password: payload.password,
      role: payload.role || "learner",
    };

    saveLocalUsers([...localUsers, newUser]);
    return { data: { message: "Registered successfully" } };
  }
}

export async function loginUser({ email, password }) {
  const payload = {
    email: email.trim().toLowerCase(),
    password,
  };

  try {
    const response = await axios.post(`${AUTH_API_BASE_URL}/login`, payload);
    return response.data;
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    const matchedUser = getAllFallbackUsers().find(
      (user) =>
        user.email === payload.email && String(user.password) === String(payload.password)
    );

    if (!matchedUser) {
      throw new Error("Invalid email or password");
    }

    return {
      userId: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
      token: "local-dev-token",
      name: matchedUser.name,
    };
  }
}

export async function sendForgotPasswordOtp(email) {
  const payload = {
    email: email.trim().toLowerCase(),
  };

  const response = await axios.post(
    `${AUTH_API_BASE_URL}/forgot-password`,
    payload
  );
  return response.data;
}

export async function resetPassword({ email, otp, newPassword }) {
  const payload = {
    email: email.trim().toLowerCase(),
    otp: otp.trim(),
    newPassword,
  };

  const response = await axios.post(
    `${AUTH_API_BASE_URL}/reset-password`,
    payload
  );
  return response.data;
}

export function normalizeApiError(error, fallbackMessage) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  return message || fallbackMessage;
}
