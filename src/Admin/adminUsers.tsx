import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useFetch } from "../Hooks/usefetch"; // adjust path to your useFetch
import { adminApi } from "../config/AdminApi"; // adjust path to your admin API client
import type { AdminUser } from "../config/AdminApi";

const CURRENCY = "USD";

const money = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY }).format(v);

const joined = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";

const label = (u: AdminUser) => u.name.trim() || u.username || u.email;
const isAdmin = (u: AdminUser) => u.type === "admin";

type Action = { kind: "topup" | "delete"; user: AdminUser } | null;

export default function AdminUsers() {
  const { data, error, loading, reload } = useFetch<AdminUser[]>(() => adminApi.users());
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
          <h1 className="text-xl font-semibold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">
            {loading ? "Loading users..." : `${users.length} of ${data?.length ?? 0} users`}
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

      <div aria-live="polite">
        {notice && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            {notice}
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{error}</span>
          <button onClick={reload} className="font-medium underline underline-offset-2">
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-205 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Balance</th>
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
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    {query ? `No users match "${query}".` : "No users have registered yet."}
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{label(u)}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums text-slate-900">{money(u.balance)}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{money(u.activeInvestments)}</td>
                    <td className="px-4 py-3 text-slate-600">{joined(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge user={u} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setAction({ kind: "topup", user: u })}
                          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                        >
                          Top up
                        </button>
                        {!isAdmin(u) && (
                          <button
                            onClick={() => setAction({ kind: "delete", user: u })}
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

      {action?.kind === "topup" && <TopUpModal user={action.user} onClose={close} onDone={done} />}
      {action?.kind === "delete" && <DeleteModal user={action.user} onClose={close} onDone={done} />}
    </div>
  );
}

function StatusBadge({ user }: { user: AdminUser }) {
  if (isAdmin(user)) {
    return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">Admin</span>;
  }
  return user.verified ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Verified</span>
  ) : (
    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Unverified</span>
  );
}

/* ---------- shared modal shell ---------- */

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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
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

/* ---------- top up ---------- */

function TopUpModal({
  user,
  onClose,
  onDone,
}: {
  user: AdminUser;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => ref.current?.focus(), []);

  // matches the server rule: positive, at most 2 decimal places
  const valid = /^\d+(\.\d{1,2})?$/.test(amount.trim()) && Number(amount) > 0;
  const value = Number(amount);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) {
      setError("Enter an amount greater than 0 with at most 2 decimal places.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { newBalance } = await adminApi.topUpUser(user.uid, value);
      onDone(`Added ${money(value)} to ${label(user)}. New balance: ${money(newBalance)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Top-up failed. Try again.");
      setBusy(false);
    }
  }

  return (
    <Modal titleId="topup-title" busy={busy} onClose={onClose} onSubmit={submit}>
      <div>
        <h2 id="topup-title" className="text-lg font-semibold text-slate-900">
          Top up account
        </h2>
        <p className="text-sm text-slate-500">
          {label(user)} &middot; current balance {money(user.balance)}
        </p>
      </div>

      <div>
        <label htmlFor="topup-amount" className="mb-1 block text-sm font-medium text-slate-700">
          Amount ({CURRENCY})
        </label>
        <input
          id="topup-amount"
          ref={ref}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
        {valid && (
          <p className="mt-1.5 text-xs text-slate-500">
            New balance will be{" "}
            <span className="font-medium text-slate-800">{money(user.balance + value)}</span>
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
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
          disabled={busy || !valid}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Adding funds..." : "Add funds"}
        </button>
      </div>
    </Modal>
  );
}

/* ---------- delete ---------- */

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
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => ref.current?.focus(), []);

  const matches = confirm.trim().toLowerCase() === user.email.toLowerCase();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!matches) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.deleteUser(user.uid);
      onDone(`Deleted ${label(user)} and all their records.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this user. Try again.");
      setBusy(false);
    }
  }

  return (
    <Modal titleId="delete-title" busy={busy} onClose={onClose} onSubmit={submit}>
      <div>
        <h2 id="delete-title" className="text-lg font-semibold text-slate-900">
          Delete {label(user)}?
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          This permanently removes the account and all of its investments, deposits, withdrawals, earnings and
          transactions. It cannot be undone.
        </p>
      </div>

      <div>
        <label htmlFor="delete-confirm" className="mb-1 block text-sm font-medium text-slate-700">
          Type <span className="font-semibold text-slate-900">{user.email}</span> to confirm
        </label>
        <input
          id="delete-confirm"
          ref={ref}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="off"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
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