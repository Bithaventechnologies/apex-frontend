
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useFetch } from "../Hooks/usefetch";
import { adminApi } from "../config/AdminApi";
import type {
  AdminUser,
  BalanceAction,
  CryptoCurrency,
} from "../config/AdminApi";

const CURRENCY = "USD";

const money = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
  }).format(v);

const cryptoAmount = (v: number) =>
  v.toLocaleString("en-US", {
    maximumFractionDigits: 8,
  });

const joined = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const label = (u: AdminUser) =>
  u.name.trim() || u.username || u.email;

const isAdmin = (u: AdminUser) => u.type === "admin";

type Action =
  | { kind: "adjust"; user: AdminUser }
  | { kind: "delete"; user: AdminUser }
  | null;

export default function AdminUsers() {
  const { data, error, loading, reload } =
    useFetch<AdminUser[]>(() => adminApi.users());

  const [query, setQuery] = useState("");
  const [action, setAction] = useState<Action>(null);
  const [notice, setNotice] = useState("");

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = data ?? [];

    if (!q) return all;

    return all.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q),
    );
  }, [data, query]);

  useEffect(() => {
    if (!notice) return;

    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  const close = () => setAction(null);

  const done = (msg: string) => {
    setAction(null);
    setNotice(msg);
    reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Users
          </h1>
          <p className="text-sm text-slate-500">
            {loading
              ? "Loading users..."
              : `${users.length} of ${data?.length ?? 0} users`}
          </p>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, username or UID"
          aria-label="Search users"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 sm:w-80"
        />
      </div>

      {notice && (
        <div
          aria-live="polite"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{error}</span>
          <button
            onClick={reload}
            className="font-medium underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-262.5 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">USD Balance</th>
                <th className="px-4 py-3 font-medium">BTC</th>
                <th className="px-4 py-3 font-medium">SOL</th>
                <th className="px-4 py-3 font-medium">ETH</th>
                <th className="px-4 py-3 font-medium">Invested</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!loading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {query
                      ? `No users match "${query}".`
                      : "No users have registered yet."}
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {label(u)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {u.email}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium tabular-nums text-slate-900">
                      {money(u.balance)}
                    </td>

                    <td className="px-4 py-3 tabular-nums">
                      {cryptoAmount(u.bitcoin)}
                    </td>

                    <td className="px-4 py-3 tabular-nums">
                      {cryptoAmount(u.sol)}
                    </td>

                    <td className="px-4 py-3 tabular-nums">
                      {cryptoAmount(u.ethereum)}
                    </td>

                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {money(u.activeInvestments)}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {joined(u.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge user={u} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setAction({ kind: "adjust", user: u })
                          }
                          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                        >
                          Manage funds
                        </button>

                        {!isAdmin(u) && (
                          <button
                            onClick={() =>
                              setAction({ kind: "delete", user: u })
                            }
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {action?.kind === "adjust" && (
        <AdjustBalanceModal
          user={action.user}
          onClose={close}
          onDone={done}
        />
      )}

      {action?.kind === "delete" && (
        <DeleteModal
          user={action.user}
          onClose={close}
          onDone={done}
        />
      )}
    </div>
  );
}

function StatusBadge({ user }: { user: AdminUser }) {
  if (isAdmin(user)) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
        Admin
      </span>
    );
  }

  return user.verified ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
      Verified
    </span>
  ) : (
    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      Unverified
    </span>
  );
}

/* ---------------- Modal shell ---------------- */

function Modal({
  titleId,
  busy,
  onClose,
  onSubmit,
  children,
}: {
  titleId: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-xl"
      >
        {children}
      </form>
    </div>
  );
}

/* ---------------- Add / deduct crypto ---------------- */

function AdjustBalanceModal({
  user,
  onClose,
  onDone,
}: {
  user: AdminUser;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [balanceAction, setBalanceAction] =
    useState<BalanceAction>("add");

  const [currency, setCurrency] =
    useState<CryptoCurrency>("BTC");

  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const balances: Record<CryptoCurrency, number> = {
    BTC: user.bitcoin,
    SOL: user.sol,
    ETH: user.ethereum,
  };

  const currentBalance = balances[currency];

  const valid =
    /^\d+(\.\d{1,8})?$/.test(amount.trim()) &&
    Number.isFinite(Number(amount)) &&
    Number(amount) > 0;

  const value = Number(amount);

  const insufficient =
    balanceAction === "deduct" &&
    valid &&
    value > currentBalance;

  const previewBalance =
    balanceAction === "add"
      ? currentBalance + value
      : currentBalance - value;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!valid) {
      setError(
        "Enter a positive amount with no more than 8 decimal places.",
      );
      return;
    }

    if (balanceAction === "deduct" && value > currentBalance) {
      setError("The deduction cannot exceed the user's available balance.");
      return;
    }

    const confirmed = window.confirm(
      `${balanceAction === "add" ? "Add" : "Deduct"} ${cryptoAmount(value)} ${currency} ${
        balanceAction === "add" ? "to" : "from"
      } ${label(user)}'s account?`,
    );

    if (!confirmed) return;

    setBusy(true);

    try {
      const result = await adminApi.adjustUserBalance(user.uid, {
        action: balanceAction,
        currency,
        amount: value,
      });

      const adjustment = result.adjustment;

      const finalBalance =
        adjustment?.newBalance ?? previewBalance;

      onDone(
        `${currency} ${balanceAction === "add" ? "added to" : "deducted from"} ${label(user)}'s account. New ${currency} balance: ${cryptoAmount(finalBalance)}.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to adjust the user's balance.",
      );
      setBusy(false);
    }
  }

  return (
    <Modal
      titleId="adjust-balance-title"
      busy={busy}
      onClose={onClose}
      onSubmit={submit}
    >
      <div>
        <h2
          id="adjust-balance-title"
          className="text-lg font-semibold text-slate-900"
        >
          Manage crypto balance
        </h2>

        <p className="text-sm text-slate-500">
          {label(user)} · {user.email}
        </p>
      </div>

      <div>
        <label
          htmlFor="balance-action"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Action
        </label>

        <select
          id="balance-action"
          value={balanceAction}
          onChange={(e) =>
            setBalanceAction(e.target.value as BalanceAction)
          }
          disabled={busy}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        >
          <option value="add">Add funds</option>
          <option value="deduct">Deduct funds</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="balance-currency"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Cryptocurrency
        </label>

        <select
          id="balance-currency"
          value={currency}
          onChange={(e) =>
            setCurrency(e.target.value as CryptoCurrency)
          }
          disabled={busy}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="SOL">Solana (SOL)</option>
          <option value="ETH">Ethereum (ETH)</option>
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">
          Current {currency} balance
        </p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
          {cryptoAmount(currentBalance)} {currency}
        </p>
      </div>

      <div>
        <label
          htmlFor="crypto-amount"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Amount ({currency})
        </label>

        <input
          id="crypto-amount"
          ref={inputRef}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00000000"
          disabled={busy}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />

        {valid && !insufficient && (
          <p className="mt-1.5 text-xs text-slate-500">
            Estimated balance after adjustment:{" "}
            <span className="font-medium text-slate-800">
              {cryptoAmount(previewBalance)} {currency}
            </span>
          </p>
        )}
      </div>

      {insufficient && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          The amount exceeds the available {currency} balance.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={busy || !valid || insufficient}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
            balanceAction === "add"
              ? "bg-emerald-700 hover:bg-emerald-800"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {busy
            ? "Processing..."
            : balanceAction === "add"
              ? "Confirm addition"
              : "Confirm deduction"}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- Delete user ---------------- */

function DeleteModal({
  user,
  onClose,
  onDone,
}: {
  user: AdminUser;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const matches =
    confirm.trim().toLowerCase() === user.email.toLowerCase();

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (!matches) return;

    setBusy(true);
    setError("");

    try {
      await adminApi.deleteUser(user.uid);
      onDone(`Deleted ${label(user)} and all their records.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete this user. Try again.",
      );
      setBusy(false);
    }
  }

  return (
    <Modal
      titleId="delete-title"
      busy={busy}
      onClose={onClose}
      onSubmit={submit}
    >
      <div>
        <h2
          id="delete-title"
          className="text-lg font-semibold text-slate-900"
        >
          Delete {label(user)}?
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          This permanently removes the account and its related records.
          This action cannot be undone.
        </p>
      </div>

      <div>
        <label
          htmlFor="delete-confirm"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Type{" "}
          <span className="font-semibold text-slate-900">
            {user.email}
          </span>{" "}
          to confirm
        </label>

        <input
          id="delete-confirm"
          ref={inputRef}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="off"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={busy || !matches}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Deleting..." : "Delete user"}
        </button>
      </div>
    </Modal>
  );
}
