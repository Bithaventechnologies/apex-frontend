/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from "react";
import { Card, EmptyState, PageHeader, StatCard, StatusBadge } from "../Components/Ui";
import { dateOrDash, money } from "../lib/format";
import { adminApi, type AdminUser } from "../config/AdminApi";
import LoadState from "../Components/loadState";
import { useFetch } from "../Hooks/usefetch";

const PAGE = 25;

async function load() {
  const [inv, users] = await Promise.allSettled([adminApi.investments(), adminApi.users()]);
  if (inv.status === "rejected") throw inv.reason;
  const byUid = new Map<string, AdminUser>((users.status === "fulfilled" ? users.value : []).map((u) => [u.uid, u]));
  return inv.value.map((i) => ({ ...i, name: i.name || byUid.get(i.uid)?.name || "", email: i.email || byUid.get(i.uid)?.email || "" }));
}

export default function AdminInvestments() {
  const { data, error, loading, reload } = useFetch(load);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [visible, setVisible] = useState(PAGE);

  const all = data ?? [];
  const statuses = useMemo(() => ["all", ...Array.from(new Set(all.map((i) => i.status)))], [all]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((i) => (status === "all" || i.status === status) && (!q || [i.name, i.email, i.uid, i.planName].some((v) => v.toLowerCase().includes(q))));
  }, [all, status, query]);

  const active = all.filter((i) => i.status === "active");

  return (
    <>
      <PageHeader title="Investments" description="Every investment your users have made." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard accent label="Active investments" value={String(active.length)} />
        <StatCard label="Currently invested" value={money(active.reduce((s, i) => s + i.amount, 0))} />
        <StatCard label="Invested all time" value={money(all.reduce((s, i) => s + i.amount, 0))} />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input type="search" aria-label="Search investments" placeholder="Search user or plan" value={query} onChange={(e) => { setQuery(e.target.value); setVisible(PAGE); }} className="w-full max-w-xs rounded-lg border border-apex-200 bg-white px-3 py-2 text-sm outline-none focus:border-apex-500 focus:ring-2 focus:ring-apex-500/30" />
          <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setVisible(PAGE); }} className="rounded-lg border border-apex-200 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-apex-500 focus:ring-2 focus:ring-apex-500/30">
            {statuses.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
          </select>
        </div>

        <LoadState loading={loading} error={error} hasData={data !== null} onRetry={reload}>
          {rows.length === 0 ? (
            <EmptyState title="No investments found" body="Try a different search or filter." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Started</th>
                      <th className="py-2 pr-4 font-medium">User</th>
                      <th className="py-2 pr-4 font-medium">Plan</th>
                      <th className="py-2 pr-4 font-medium">Ends</th>
                      <th className="py-2 pr-4 text-right font-medium">Amount</th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-apex-100">
                    {rows.slice(0, visible).map((i) => (
                      <tr key={i.id}>
                        <td className="whitespace-nowrap py-3 pr-4">{dateOrDash(i.createdAt)}</td>
                        <td className="py-3 pr-4"><p className="font-medium text-apex-950">{i.name || "—"}</p><p className="text-xs text-muted">{i.email || i.uid}</p></td>
                        <td className="py-3 pr-4">{i.planName}</td>
                        <td className="whitespace-nowrap py-3 pr-4">{dateOrDash(i.endDate)}</td>
                        <td className="whitespace-nowrap py-3 pr-4 text-right font-semibold tabular-nums">{money(i.amount)}</td>
                        <td className="py-3"><StatusBadge status={i.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <span>Showing {Math.min(visible, rows.length)} of {rows.length}</span>
                {visible < rows.length && <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="rounded-lg border border-apex-200 px-4 py-2 font-semibold text-apex-900 hover:bg-apex-50">Show more</button>}
              </div>
            </>
          )}
        </LoadState>
      </Card>
    </>
  );
}