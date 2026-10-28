
/**
 * Admin API client.
 *
 * Set VITE_API_URL to include /api, for example:
 * http://localhost:5000/api
 *
 * Crypto balance adjustment:
 * POST /admin/users/:uid/adjust-balance
 *
 * Supported currencies: BTC, SOL, ETH
 * Supported actions: add, deduct
 */

const API = import.meta.env.VITE_API_URL as string | undefined;

/* ============================== Errors ============================== */

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("AdminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  if (!API) {
    throw new ApiError("VITE_API_URL is not set.");
  }

  let res: Response;

  try {
    res = await fetch(
      `${API.replace(/\/+$/, "")}${path}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeaders(),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
  } catch {
    throw new ApiError(
      "Cannot reach the server. Check the backend URL and CORS configuration.",
    );
  }

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data && typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `Request failed (${res.status}).`;

    throw new ApiError(message, res.status);
  }

  return data as T;
}

/* ============================== Types ============================== */

export type AdminRequest = {
  id: number;
  uid: string;
  name: string;
  email: string;
  amount: number;
  method: string;
  details: string;
  status: string;
  transactionId: string;
  createdAt: string;
};

export type CryptoCurrency = "BTC" | "SOL" | "ETH";

export type BalanceAction = "add" | "deduct";

export type CryptoBalanceAdjustment = {
  action: BalanceAction;
  currency: CryptoCurrency;
  amount: number;
};

export type CryptoAdjustmentResult = {
  action: BalanceAction;
  currency: CryptoCurrency;
  amount: number;
  previousBalance: number;
  newBalance: number;
};

export type AdminUser = {
  id: number;
  uid: string;
  name: string;
  username: string;
  email: string;

  balance: number;
  bitcoin: number;
  sol: number;
  ethereum: number;

  activeInvestments: number;
  pendingWithdrawals: number;
  totalWithdrawals: number;
  totalDeposits: number;
  earnings: number;

  verified: boolean;
  type: string;
  createdAt: string;
};

export type AdminInvestment = {
  id: string;
  uid: string;
  name: string;
  email: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string;
  endDate: string;
};

export type AdminEarning = {
  id: string;
  uid: string;
  name: string;
  email: string;
  amount: number;
  source: string;
  createdAt: string;
};

export type AdminPlan = {
  id: number;
  name: string;
  returns: number;
  minAmount: number;
  maxAmount: number;
  duration: number;
  createdAt: string;
};

export type PlanInput = {
  name: string;
  returns: number;
  minAmount: number;
  maxAmount: number;
  duration: number;
};

export type AdminGateway = {
  id: number;
  name: string;
  currency: string;
  network: string;
  address: string;
  qrCode: string;
  instructions: string;
  isActive: boolean;
  createdAt: string;
};

export type GatewayInput = {
  name: string;
  currency: string;
  network: string;
  address: string;
  qrCode?: string;
  instructions?: string;
  isActive?: boolean;
};

export type AdminLoginInput = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  success: boolean;
  message: string;
  token: string;
  admin: {
    id: number;
    uid: string;
    name: string;
    username: string;
    email: string;
    type: string;
  };
};

/* ============================== Helpers ============================== */

type Rec = Record<string, unknown>;

const str = (v: unknown, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const when = (v: unknown) => {
  if (typeof v !== "number" && typeof v !== "string") {
    return "";
  }

  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
};

const userRef = (v: unknown) => {
  const u = v && typeof v === "object" ? (v as Rec) : {};

  return {
    name: str(u.name),
    email: str(u.email),
  };
};

const rows = (res: unknown): Rec[] => {
  if (!res || typeof res !== "object") return [];

  const data = (res as { data?: unknown }).data;
  return Array.isArray(data) ? (data as Rec[]) : [];
};

const first = (o: Rec, ...keys: string[]) =>
  keys
    .map((key) => o[key])
    .find((v) => v !== undefined && v !== null && v !== "");

/* ============================== Normalisers ============================== */

function toDeposit(r: Rec): AdminRequest {
  const u = userRef(r.user);

  return {
    id: num(r.id),
    uid: str(r.uid),
    name: str(r.name, u.name),
    email: str(r.email, u.email),
    amount: num(r.amount),
    method: str(r.method, "—"),
    details: [str(r.from), str(r.to)].filter(Boolean).join(" → "),
    status: str(r.status, "pending"),
    transactionId: str(r.transaction_id),
    createdAt: when(r.createdAt),
  };
}

function toWithdrawal(r: Rec): AdminRequest {
  const u = userRef(r.user);

  return {
    id: num(r.id),
    uid: str(r.uid),
    name: str(r.name, u.name),
    email: str(r.email, u.email),
    amount: num(r.amount),
    method: str(r.method, "—"),
    details: str(r.to),
    status: str(r.status, "pending"),
    transactionId: str(r.transaction_id),
    createdAt: when(r.createdAt),
  };
}

function toUser(r: Rec): AdminUser {
  return {
    id: num(r.id),
    uid: str(r.uid),
    name: str(r.name),
    username: str(r.username),
    email: str(r.email),

    balance: num(r.balance),
    bitcoin: num(r.bitcoin),
    sol: num(r.sol),
    ethereum: num(r.ethereum),

    activeInvestments: num(r.activeInvestments),
    pendingWithdrawals: num(r.pendingWithdrawals),
    totalWithdrawals: num(r.totalWithdrawals),
    totalDeposits: num(r.totalDeposits),
    earnings: num(r.earnings),

    verified: r.verified === true,
    type: str(r.type),
    createdAt: when(r.createdAt),
  };
}

function toInvestment(r: Rec): AdminInvestment {
  const u = userRef(r.user);

  const plan =
    r.plan && typeof r.plan === "object"
      ? str((r.plan as Rec).name)
      : str(r.plan);

  const status =
    typeof r.active === "boolean"
      ? r.active
        ? "active"
        : "completed"
      : str(r.status, "—");

  return {
    id: str(first(r, "id")),
    uid: str(r.uid),
    name: str(r.name, u.name),
    email: str(r.email, u.email),
    planName:
      plan || str(first(r, "planName", "name"), "—"),
    amount: num(r.amount),
    status,
    createdAt: when(first(r, "createdAt", "startDate", "date")),
    endDate: when(first(r, "endDate", "expiresAt", "endsAt")),
  };
}

function toEarning(r: Rec): AdminEarning {
  const u = userRef(r.user);

  return {
    id: str(first(r, "id")),
    uid: str(r.uid),
    name: str(r.name, u.name),
    email: str(r.email, u.email),
    amount: num(r.amount),
    source: str(
      first(r, "source", "planName", "plan", "investmentId", "description"),
      "—",
    ),
    createdAt: when(first(r, "createdAt", "date")),
  };
}

function toPlan(r: Rec): AdminPlan {
  return {
    id: num(r.id),
    name: str(r.name),
    returns: num(r.returns),
    minAmount: num(r.minAmount),
    maxAmount: num(r.maxAmount),
    duration: num(r.duration),
    createdAt: when(r.createdAt),
  };
}

function toGateway(r: Rec): AdminGateway {
  return {
    id: num(r.id),
    name: str(r.name),
    currency: str(r.currency),
    network: str(r.network),
    address: str(r.address),
    qrCode: str(r.qrCode),
    instructions: str(r.instructions),
    isActive: r.isActive === true,
    createdAt: when(r.createdAt),
  };
}

/* ============================== Endpoints ============================== */

export const adminApi = {
  // Authentication
  login: (input: AdminLoginInput) =>
    request<AdminLoginResponse>("POST", "/admin/auth/login", input),

  // Users
  users: async (): Promise<AdminUser[]> =>
    rows(await request<unknown>("GET", "/admin/users")).map(toUser),

  adjustUserBalance: async (
    uid: string,
    input: CryptoBalanceAdjustment,
  ): Promise<{
    message: string;
    user?: AdminUser;
    adjustment?: CryptoAdjustmentResult;
  }> => {
    const res = await request<{
      message: string;
      data?: {
        user?: Rec;
        adjustment?: CryptoAdjustmentResult;
      };
    }>(
      "POST",
      `/admin/users/${encodeURIComponent(uid)}/adjust-balance`,
      input,
    );

    return {
      message: res.message,
      user: res.data?.user
        ? toUser(res.data.user)
        : undefined,
      adjustment: res.data?.adjustment,
    };
  },

  deleteUser: (uid: string) =>
    request<{ message: string }>(
      "DELETE",
      `/admin/users/${encodeURIComponent(uid)}`,
    ),

  // Deposits
  deposits: async () =>
    rows(await request<unknown>("GET", "/admin/deposits")).map(toDeposit),

  depositAction: (
    id: number,
    action: "processing" | "approve" | "decline",
  ) =>
    request("PATCH", `/admin/deposits/${id}/${action}`),

  // Withdrawals
  withdrawals: async () =>
    rows(await request<unknown>("GET", "/admin/withdrawals/all")).map(toWithdrawal),

  withdrawalAction: (id: number, action: "approve" | "decline") =>
    request("PATCH", `/admin/withdrawals/${id}/${action}`),

  // Investments and earnings
  investments: async () =>
    rows(await request<unknown>("GET", "/admin/investments/all")).map(toInvestment),

  earnings: async () =>
    rows(await request<unknown>("GET", "/admin/earnings/all")).map(toEarning),

  // Plans
  plans: async () =>
    rows(await request<unknown>("GET", "/admin/plans")).map(toPlan),

  createPlan: async (input: PlanInput) => {
    const res = await request<{ data?: Rec }>("POST", "/admin/plans", {
      name: input.name,
      returns: String(input.returns),
      minAmount: String(input.minAmount),
      maxAmount: String(input.maxAmount),
      duration: String(input.duration),
    });

    return toPlan(res.data ?? {});
  },

  deletePlan: (id: number) =>
    request("DELETE", `/admin/plans/${id}`),

  // Deposit gateways
  // Routes mounted at /api/gateway
  gateways: async () =>
    rows(await request<unknown>("GET", "/gateway/admin")).map(toGateway),

  createGateway: async (input: GatewayInput) => {
    const res = await request<{ data?: Rec }>(
      "POST",
      "/gateway/admin",
      input,
    );

    return toGateway(res.data ?? {});
  },

  updateGateway: async (
    id: number,
    input: Partial<GatewayInput>,
  ) => {
    const res = await request<{ data?: Rec }>(
      "PATCH",
      `/gateway/admin/${id}`,
      input,
    );

    return toGateway(res.data ?? {});
  },

  setGatewayStatus: (id: number, isActive: boolean) =>
    request("PATCH", `/gateway/admin/${id}/status`, { isActive }),

  deleteGateway: (id: number) =>
    request("DELETE", `/gateway/admin/${id}`),
};
