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
  error: { code: string; details: string } | null;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await apiClient.post<ApiEnvelope<AuthResponse>>(
    "/auth/register",
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function loginUser(payload: {
  email: string;
  password: string;
}) {
  const res = await apiClient.post<ApiEnvelope<AuthResponse>>(
    "/auth/login",
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function loginWithGoogle(idToken: string) {
  const res = await apiClient.post<ApiEnvelope<AuthResponse>>(
    "/auth/google",
    { idToken },
    { withCredentials: true }
  );
  return res.data;
}

export async function logoutUser() {
  const res = await apiClient.post<ApiEnvelope<null>>(
    "/auth/logout",
    {},
    { withCredentials: true }
  );
  return res.data;
}

export async function getCurrentUser() {
  const res = await apiClient.get<ApiEnvelope<{ user: User }>>("/auth/me", {
    withCredentials: true,
  });
  return res.data;
}
