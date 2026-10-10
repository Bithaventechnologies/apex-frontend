/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/purity */
import { useMemo, useState } from "react";
import { Card, EmptyState, PageHeader, StatCard } from "../Components/Ui";
import { dateOrDash, money } from "../lib/format";
import { adminApi, type AdminUser } from "../config/AdminApi";
import LoadState from "../Components/loadState";
import { useFetch } from "../Hooks/usefetch";

const PAGE = 25;
const DAY = 86_400_000;

async function load() {
  const [earn, users] = await Promise.allSettled([adminApi.earnings(), adminApi.users()]);
  if (earn.status === "rejected") throw earn.reason;
  const byUid = new Map<string, AdminUser>((users.status === "fulfilled" ? users.value : []).map((u) => [u.uid, u]));
  return earn.value.map((e) => ({ ...e, name: e.name || byUid.get(e.uid)?.name || "", email: e.email || byUid.get(e.uid)?.email || "" }));
}

export default function AdminEarnings() {
  const { data, error, loading, reload } = useFetch(load);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE);

  const all = data ?? [];
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? all.filter((e) => [e.name, e.email, e.uid, e.source].some((v) => v.toLowerCase().includes(q))) : all;
  }, [all, query]);

  const total = all.reduce((s, e) => s + e.amount, 0);
  const last30 = all.filter((e) => e.createdAt && Date.now() - new Date(e.createdAt).getTime() <= 30 * DAY).reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <PageHeader title="Earnings" description="Earnings credited to your users." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard accent label="Total credited" value={money(total)} />
        <StatCard label="Last 30 days" value={money(last30)} />
        <StatCard label="Credits" value={String(all.length)} />
      </div>

      <Card>
        <div className="mb-4">
          <input type="search" aria-label="Search earnings" placeholder="Search user or source" value={query} onChange={(e) => { setQuery(e.target.value); setVisible(PAGE); }} className="w-full max-w-xs rounded-lg border border-apex-200 bg-white px-3 py-2 text-sm outline-none focus:border-apex-500 focus:ring-2 focus:ring-apex-500/30" />
        </div>

        <LoadState loading={loading} error={error} hasData={data !== null} onRetry={reload}>
          {rows.length === 0 ? (
            <EmptyState title="No earnings found" body="Try a different search." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-130 text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">User</th>
                      <th className="py-2 pr-4 font-medium">Source</th>
                      <th className="py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-apex-100">
                    {rows.slice(0, visible).map((e) => (
                      <tr key={e.id}>
                        <td className="whitespace-nowrap py-3 pr-4">{dateOrDash(e.createdAt)}</td>
                        <td className="py-3 pr-4"><p className="font-medium text-apex-950">{e.name || "—"}</p><p className="text-xs text-muted">{e.email || e.uid}</p></td>
                        <td className="py-3 pr-4">{e.source}</td>
                        <td className="whitespace-nowrap py-3 text-right font-semibold tabular-nums text-apex-700">+{money(e.amount)}</td>
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