
import axios from "axios";
import { api, apiErrorMessage } from "./api";
export { api } from "./api";

// -------------------- TYPES --------------------

export class AuthError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export type User = {
  id: string;
  uid?: string;
  fullName: string;
  name?: string;
  email: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  emailVerified?: boolean;
  verified?: boolean;
  balance?: number;
  btcBal?: number;
  usdtBal?: number;
  ethBal?: number;
  solBal?: number;
  profilePic?: string;
  dob?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  type?: string;
  bitcoin?: string;
  sol?: string;
  ethereum?: string;
  referralId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BackendUser = {
  id: string | number;
  uid?: string;
  name?: string | null;
  username?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  phoneNumber?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  emailVerified?: boolean;
  verified?: boolean;
  balance?: number;
  btcBal?: number;
  usdtBal?: number;
  ethBal?: number;
  solBal?: number;
  profilePic?: string | null;
  dob?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  routingNumber?: string | null;
  type?: string | null;
  bitcoin?: string | null;
  sol?: string | null;
  ethereum?: string | null;
  referralId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  code?: string;
  token?: string;
  user?: T;
  data?: T;
};

// -------------------- USER MAPPING --------------------

function toUser(data: BackendUser): User {
  const fullName =
    data.fullName ||
    data.name ||
    [data.firstName, data.lastName]
      .filter(Boolean)
      .join(" ");

  return {
    id: String(data.id),
    uid: data.uid,
    fullName: fullName || "",
    name: fullName || "",
    email: data.email,
    phone: data.phone ?? data.phoneNumber ?? "",
    country: data.country ?? "",
    state: data.state ?? "",
    city: data.city ?? "",
    firstName:
      data.firstName ?? fullName.split(/\s+/)[0] ?? "",
    lastName:
      data.lastName ??
      fullName.split(/\s+/).slice(1).join(" "),
    username: data.username ?? undefined,
    emailVerified: data.emailVerified,
    verified: data.verified,
    balance: data.balance,
    btcBal: data.btcBal,
    usdtBal: data.usdtBal,
    ethBal: data.ethBal,
    solBal: data.solBal,
    profilePic: data.profilePic ?? undefined,
    dob: data.dob ?? undefined,
    bankName: data.bankName ?? undefined,
    accountNumber: data.accountNumber ?? undefined,
    routingNumber: data.routingNumber ?? undefined,
    type: data.type ?? undefined,
    bitcoin: data.bitcoin ?? undefined,
    sol: data.sol ?? undefined,
    ethereum: data.ethereum ?? undefined,
    referralId: data.referralId ?? undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// -------------------- ERROR HANDLING --------------------

function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as { code?: string } | undefined;
    throw new AuthError(apiErrorMessage(error), response?.code);
  }

  if (error instanceof AuthError) {
    throw error;
  }

  throw new AuthError("Something went wrong. Please try again.");
}

// -------------------- HTTP HELPERS --------------------

async function post<T>(
  path: string,
  body: unknown
): Promise<T> {
  try {
    const response = await api.post<T>(path, body);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
}

async function get<T>(path: string): Promise<T> {
  try {
    const response = await api.get<T>(path);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
}

// -------------------- REGISTER --------------------

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<User> {
  const names = input.fullName.trim().split(/\s+/);
  const firstName = names.shift() ?? "";
  const lastName = names.join(" ");

  const response = await post<ApiResponse<BackendUser>>(
    "/auth/register",
    {
      firstName,
      lastName,
      email: input.email.trim().toLowerCase(),
      password: input.password,
    }
  );

  if (!response.user) {
    throw new AuthError(
      response.message ??
        "Registration response is missing user data."
    );
  }

  return toUser(response.user);
}

// -------------------- LOGIN --------------------

export async function loginUser(input: {
  email: string;
  password: string;
  remember: boolean;
}): Promise<User> {
  const response = await post<ApiResponse<BackendUser>>(
    "/auth/login",
    {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    }
  );

  if (!response.user) {
    throw new AuthError(
      response.message ?? "Login response is missing user data."
    );
  }

  if (response.token) {
    localStorage.setItem("token", response.token);
  } else {
    throw new AuthError(
      "Login succeeded without a token. Please check the backend login response."
    );
  }

  return toUser(response.user);
}

// -------------------- VERIFY EMAIL OTP --------------------

export async function verifyOtp(
  email: string,
  code: string
): Promise<User> {
  const response = await post<ApiResponse<BackendUser>>(
    "/auth/verify-email",
    {
      email: email.trim().toLowerCase(),
      otp: code.trim(),
    }
  );

  if (!response.user) {
    throw new AuthError(
      response.message ??
        "Verification response is missing user data."
    );
  }

  return toUser(response.user);
}

// -------------------- RESEND VERIFICATION OTP --------------------

export async function resendOtp(email: string): Promise<void> {
  await post("/auth/resend-verification", {
    email: email.trim().toLowerCase(),
  });
}

// -------------------- FORGOT PASSWORD --------------------

export async function requestPasswordReset(
  email: string
): Promise<void> {
  await post("/auth/forgot-password", {
    email: email.trim().toLowerCase(),
  });
}

// -------------------- RESET PASSWORD --------------------

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<void> {
  await post("/auth/reset-password", {
    email: email.trim().toLowerCase(),
    otp: otp.trim(),
    newPassword,
  });
}

// -------------------- LOGOUT --------------------

export async function logoutUser(): Promise<void> {
  try {
    // This endpoint is optional. The token is always cleared locally.
    await post("/auth/logout", {});
  } catch {
    // The backend may not implement a logout endpoint.
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
  }
}

// -------------------- GET PROFILE --------------------

/**
 * Gets the currently authenticated user's profile.
 *
 * Backend route:
 * GET /users/profile
 *
 * Axios attaches the JWT through the request interceptor.
 *
 * Expected response:
 * { message: "...", data: { id, email, ... } }
 */
export async function getProfile(): Promise<User> {
  const response = await get<{
    success?: boolean;
    message?: string;
    data?: BackendUser;
  }>("/users/profile");

  if (!response.data) {
    throw new AuthError(
      response.message ?? "Failed to retrieve profile."
    );
  }

  return toUser(response.data);
}

// -------------------- UPDATE PROFILE --------------------

export async function saveProfile(input: {
  fullName: string;
  username?: string;
  phone: string;
  country?: string;
  state?: string;
  city?: string;
}): Promise<User> {
  try {
    const response = await api.patch<{
      success?: boolean;
      message?: string;
      data?: BackendUser;
    }>("/users/profile", {
      name: input.fullName.trim(),

      ...(input.username !== undefined && {
        username: input.username.trim(),
      }),

      phoneNumber: input.phone.trim(),

      ...(input.country !== undefined && {
        country: input.country.trim(),
      }),

      ...(input.state !== undefined && {
        state: input.state.trim(),
      }),

      ...(input.city !== undefined && {
        city: input.city.trim(),
      }),
    });

    if (!response.data.data) {
      throw new AuthError(
        response.data.message ??
          "Profile update response is missing user data."
      );
    }

    return toUser(response.data.data);
  } catch (error) {
    return handleError(error);
  }
}

// -------------------- CHANGE PASSWORD --------------------

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await post("/auth/change-password", input);
}
