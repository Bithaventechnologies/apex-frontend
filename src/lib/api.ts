import axios from "axios";

const configuredUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "");
const baseURL = configuredUrl ? `${configuredUrl.replace(/\/api$/i, "")}/api` : "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
    if (!error.response) return "Can't reach the server. Check your connection and try again.";
    return error.response.data?.message || error.response.data?.error || "Something went wrong. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function unwrapData<T>(response: T): T { return response; }
