import apiClient from "./api-client";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "guest" | "user" | "admin";
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
  error: {
    code: string;
    details: string;
  } | null;
}

// Register
export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiClient.post<ApiEnvelope<AuthResponse>>("/auth/register", payload, {
    withCredentials: true,
  });
}

// Login
export async function loginUser(payload: { email: string; password: string }) {
  return apiClient.post<ApiEnvelope<AuthResponse>>("/auth/login", payload, {
    withCredentials: true,
  });
}

// Google Login
export async function loginWithGoogle(idToken: string) {
  return apiClient.post<ApiEnvelope<AuthResponse>>(
    "/auth/google",
    { idToken },
    {
      withCredentials: true,
    }
  );
}

// Logout
export async function logoutUser() {
  return apiClient.post<ApiEnvelope<null>>(
    "/auth/logout",
    {},
    {
      withCredentials: true,
    }
  );
}

// Current User
export async function getCurrentUser() {
  return apiClient.get<ApiEnvelope<{ user: User }>>("/auth/me", {
    withCredentials: true,
  });
}
