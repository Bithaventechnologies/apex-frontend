import { Link } from "react-router-dom";
import { Card, EmptyState, PageHeader, StatCard } from "../Components/Ui";
import { dateOrDash, money } from "../lib/format";
import { adminApi, type AdminRequest} from "../config/AdminApi";
import LoadState from "../Components/loadState";
import { useFetch } from "../Hooks/usefetch";

const OPEN = ["pending", "processing"];

function ok<T>(r: PromiseSettledResult<T>): T | null {
  return r.status === "fulfilled" ? r.value : null;
}

async function load() {
  const [d, w, u, i, e] = await Promise.allSettled([
    adminApi.deposits(), adminApi.withdrawals(), adminApi.users(), adminApi.investments(), adminApi.earnings(),
  ]);
  const results = [d, w, u, i, e];
  const failed = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
  if (failed && results.every((r) => r.status === "rejected")) throw failed.reason;
  return { deposits: ok(d), withdrawals: ok(w), users: ok(u), investments: ok(i), earnings: ok(e), partial: results.some((r) => r.status === "rejected") };
}

const sum = (list: { amount: number }[]) => list.reduce((s, r) => s + r.amount, 0);
const show = (n: number | null) => (n === null ? "—" : money(n));

function PendingList({ title, to, items }: { title: string; to: string; items: AdminRequest[] | null }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-apex-950">{title}</h2>
        <Link to={to} className="text-sm font-semibold text-apex-700 underline underline-offset-4">Review all</Link>
      </div>
      <div className="mt-4">
        {items === null ? <p className="text-sm text-muted">Couldn't load this list.</p> : items.length === 0 ? (
          <EmptyState title="All caught up" body="Nothing is waiting for review." />
        ) : (
          <ul className="divide-y divide-apex-100">
            {items.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-apex-950">{r.name || r.email || r.uid}</p>
                  <p className="text-xs text-muted">{r.method} · {dateOrDash(r.createdAt)}</p>
                </div>
                <p className="font-semibold tabular-nums">{money(r.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}


function UsersTable({ users }: { users: { id: number; uid: string; name: string; email: string; balance: number }[] | null }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-apex-950">All users</h2>
          <p className="mt-1 text-sm text-muted">
            {users === null ? "Unable to load users" : `${users.length} registered users`}
          </p>
        </div>
      </div>

      {users === null ? (
        <p className="mt-4 text-sm text-muted">
          Couldn't load users. Please refresh the dashboard.
        </p>
      ) : users.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No users found"
            body="Registered users will appear here."
          />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-162.5 text-left text-sm">
            <thead>
              <tr className="border-b border-apex-100 text-muted">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 text-right font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">UID</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-apex-100">
              {users.map((user) => (
                <tr key={user.uid || user.id} className="transition-colors hover:bg-apex-50">
                  <td className="px-4 py-3">{user.id}</td>
                  <td className="px-4 py-3 font-medium text-apex-950">
                    {user.name || "—"}
                  </td>
                  <td className="px-4 py-3">{user.email || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {money(user.balance)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {user.uid || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function AdminOverview() {
  const { data, error, loading, reload } = useFetch(load);

  const pendingDeposits = data?.deposits?.filter((r) => OPEN.includes(r.status)) ?? null;
  const pendingWithdrawals = data?.withdrawals?.filter((r) => OPEN.includes(r.status)) ?? null;
  const approvedDeposits = data?.deposits ? sum(data.deposits.filter((r) => r.status === "approved")) : null;
  const approvedWithdrawals = data?.withdrawals ? sum(data.withdrawals.filter((r) => r.status === "approved")) : null;
  const activeInvested = data?.investments ? sum(data.investments.filter((i) => i.status === "active")) : null;
  const earningsTotal = data?.earnings ? sum(data.earnings) : null;
  const balances = data?.users ? data.users.reduce((s, u) => s + u.balance, 0) : null;

  return (
    <>
      <PageHeader title="Admin overview" description="What needs your attention and how the platform is doing." />

      <LoadState loading={loading} error={error} hasData={data !== null} onRetry={reload}>
        {data?.partial && <p className="mb-4 rounded-lg bg-gold-100 px-4 py-2.5 text-sm text-apex-950">Some figures couldn't be loaded and show as “—”.</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/admin/deposits/pending" className="group rounded-2xl bg-apex-900 p-6 text-white transition-colors hover:bg-apex-950">
            <p className="text-sm text-apex-200">Pending deposits</p>
            <p className="mt-2 font-display text-4xl font-extrabold tabular-nums">{pendingDeposits ? pendingDeposits.length : "—"}</p>
            <p className="mt-1 text-sm text-apex-200">{pendingDeposits ? `${money(sum(pendingDeposits))} waiting` : "Couldn't load"} · <span className="font-semibold text-gold-400 group-hover:underline">Review</span></p>
          </Link>
          <Link to="/admin/withdrawals/pending" className="group rounded-2xl bg-apex-900 p-6 text-white transition-colors hover:bg-apex-950">
            <p className="text-sm text-apex-200">Pending withdrawals</p>
            <p className="mt-2 font-display text-4xl font-extrabold tabular-nums">{pendingWithdrawals ? pendingWithdrawals.length : "—"}</p>
            <p className="mt-1 text-sm text-apex-200">{pendingWithdrawals ? `${money(sum(pendingWithdrawals))} waiting` : "Couldn't load"} · <span className="font-semibold text-gold-400 group-hover:underline">Review</span></p>
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Users" value={data?.users ? String(data.users.length) : "—"} />
          <StatCard label="Total user balances" value={show(balances)} />
          <StatCard label="Approved deposits" value={show(approvedDeposits)} />
          <StatCard label="Approved withdrawals" value={show(approvedWithdrawals)} />
          <StatCard label="Active investments" value={show(activeInvested)} />
          <StatCard label="Earnings credited" value={show(earningsTotal)} />
        </div>

        <div className="mt-6">
  <UsersTable users={data?.users ?? null} />
</div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <PendingList title="Latest pending deposits" to="/admin/deposits/pending" items={pendingDeposits} />
          <PendingList title="Latest pending withdrawals" to="/admin/withdrawals/pending" items={pendingWithdrawals} />
        </div>
      </LoadState>
    </>
  );
}