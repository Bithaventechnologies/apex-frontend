/**
 * Auth API client.
 * - Set VITE_API_URL (e.g. http://localhost:5000/api) to call your Node/Express backend.
 * - With no VITE_API_URL, every call is mocked so you can click through the UI.
 *
 * Expected backend routes (POST, JSON):
 *   /auth/register         { fullName, email, password, plan }  -> { id, fullName, email }
 *   /auth/login            { email, password, remember }        -> { id, fullName, email }
 *   /auth/forgot-password  { email }                            -> { message }
 *   /auth/reset-password   { token, password }                  -> { message }
 * On errors return a non-2xx status with { message }.
 * Prefer an httpOnly cookie for the session (credentials: "include" is already set).
 */
const API = import.meta.env.VITE_API_URL as string | undefined;
const wait = (ms = 800): Promise<void> => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class AuthError extends Error {}

export type User = { id: string; fullName: string; email: string };

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError("Can't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AuthError(data.message ?? "Something went wrong. Please try again.");
  return data as T;
}

export async function registerUser(input: { fullName: string; email: string; password: string; plan: string }): Promise<User> {
  if (!API) {
    await wait();
    return { id: "demo", fullName: input.fullName, email: input.email };
  }
  return post<User>("/auth/register", input);
}

export async function loginUser(input: { email: string; password: string; remember: boolean }): Promise<User> {
  if (!API) {
    await wait();
    return { id: "demo", fullName: "Demo User", email: input.email };
  }
  return post<User>("/auth/login", input);
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!API) return wait();
  await post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  if (!API) {
    await wait();
    if (token === "expired") throw new AuthError("This reset link has expired. Request a new one.");
    return;
  }
  await post("/auth/reset-password", { token, password });
}