import { useMemo, useState } from "react";
import { Banner, Card, EmptyState, Modal, PageHeader, StatCard, StatusBadge } from "../Components/Ui";
import { dateOrDash, money } from "../lib/format";
import { adminApi, type AdminRequest} from "../config/AdminApi";
import LoadState from "../Components/loadState";
import { useFetch } from "../Hooks/usefetch";

type Kind = "deposit" | "withdrawal";
type Scope = "all" | "pending";
type Action = "processing" | "approve" | "decline";

const OPEN = ["pending", "processing"];
const PAGE = 25;

const copy = {
  deposit: {
    all: { title: "All deposits", description: "Every deposit request, newest first." },
    pending: { title: "Pending deposits", description: "Deposits waiting for your decision, oldest first." },
  },
  withdrawal: {
    all: { title: "All withdrawals", description: "Every withdrawal request, newest first." },
    pending: { title: "Pending withdrawals", description: "Withdrawals waiting for your decision, oldest first." },
  },
} as const;

const doneText: Record<Action, string> = { processing: "marked as processing", approve: "approved", decline: "declined" };

type Props = { kind: Kind; scope: Scope };

/** Shared table, search, filters and approve/decline flow behind the four deposit and withdrawal pages. */
export default function RequestsView({ kind, scope }: Props) {
  const { data, error, loading, reload } = useFetch(() => (kind === "deposit" ? adminApi.deposits() : adminApi.withdrawals()));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [visible, setVisible] = useState(PAGE);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ row: AdminRequest; action: "approve" | "decline" } | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const rows = useMemo(() => {
    let list = data ?? [];
    if (scope === "pending") list = list.filter((r) => OPEN.includes(r.status)).reverse(); // oldest first
    else if (status !== "all") list = list.filter((r) => r.status === status);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => [r.name, r.email, r.transactionId, r.details, String(r.id)].some((v) => v.toLowerCase().includes(q)));
    return list;
  }, [data, scope, status, query]);

  const all = data ?? [];
  const open = all.filter((r) => OPEN.includes(r.status));
  const sum = (list: AdminRequest[]) => list.reduce((s, r) => s + r.amount, 0);

  async function run(row: AdminRequest, action: Action) {
    setBusyId(row.id);
    setActionError("");
    setNotice("");
    try {
      if (kind === "deposit") await adminApi.depositAction(row.id, action);
      else if (action !== "processing") await adminApi.withdrawalAction(row.id, action);
      setNotice(`${kind === "deposit" ? "Deposit" : "Withdrawal"} #${row.id} ${doneText[action]}.`);
      reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "That action failed. Please try again.");
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  }

  const who = (r: AdminRequest) => r.name || r.email || r.uid || "this user";

  return (
    <>
      <PageHeader title={copy[kind][scope].title} description={copy[kind][scope].description} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {scope === "pending" ? (
          <>
            <StatCard accent label="Waiting for review" value={String(open.length)} />
            <StatCard label="Total waiting" value={money(sum(open))} />
            <StatCard label="Oldest request" value={open.length ? dateOrDash(open[open.length - 1].createdAt) : "—"} />
          </>
        ) : (
          <>
            <StatCard accent label="Requests" value={String(all.length)} />
            <StatCard label={kind === "deposit" ? "Approved total" : "Paid out total"} value={money(sum(all.filter((r) => r.status === "approved")))} />
            <StatCard label="Waiting for review" value={String(open.length)} hint={money(sum(open))} />
          </>
        )}
      </div>

      {notice && <Banner tone="success">{notice}</Banner>}
      {actionError && <Banner tone="error">{actionError}</Banner>}

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="search"
            aria-label="Search requests"
            placeholder="Search name, email, transaction ID"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisible(PAGE); }}
            className="w-full max-w-xs rounded-lg border border-apex-200 bg-white px-3 py-2 text-sm outline-none focus:border-apex-500 focus:ring-2 focus:ring-apex-500/30"
          />
          {scope === "all" && (
            <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setVisible(PAGE); }} className="rounded-lg border border-apex-200 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-apex-500 focus:ring-2 focus:ring-apex-500/30">
              {["all", "pending", "processing", "approved", "declined"].map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
            </select>
          )}
        </div>

        <LoadState loading={loading} error={error} hasData={data !== null} onRetry={reload}>
          {rows.length === 0 ? (
            <EmptyState title={scope === "pending" ? "Nothing waiting" : "No requests found"} body={scope === "pending" ? "New requests will show up here." : "Try a different search or filter."} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-205 text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">User</th>
                      <th className="py-2 pr-4 font-medium">Method</th>
                      <th className="py-2 pr-4 font-medium">{kind === "withdrawal" ? "Send to" : "Details"}</th>
                      <th className="py-2 pr-4 text-right font-medium">Amount</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-apex-100">
                    {rows.slice(0, visible).map((r) => {
                      const isOpen = OPEN.includes(r.status);
                      const busy = busyId === r.id;
                      return (
                        <tr key={r.id} className="align-top">
                          <td className="whitespace-nowrap py-3 pr-4">
                            {dateOrDash(r.createdAt)}
                            <p className="font-mono text-[11px] text-muted">#{r.id}{r.transactionId ? ` · TX ${r.transactionId}` : ""}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-apex-950">{r.name || "—"}</p>
                            <p className="text-xs text-muted">{r.email || r.uid}</p>
                          </td>
                          <td className="py-3 pr-4">{r.method}</td>
                          <td className="max-w-55 break-all py-3 pr-4 text-xs text-muted" title={r.details}>{r.details || "—"}</td>
                          <td className="whitespace-nowrap py-3 pr-4 text-right font-semibold tabular-nums">{money(r.amount)}</td>
                          <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                          <td className="py-3">
                            {isOpen ? (
                              <div className="flex justify-end gap-2">
                                {kind === "deposit" && r.status === "pending" && (
                                  <button type="button" disabled={busy} onClick={() => run(r, "processing")} className="rounded-md border border-apex-200 px-3 py-1.5 text-xs font-semibold text-apex-900 hover:bg-apex-50 disabled:opacity-50">Processing</button>
                                )}
                                <button type="button" disabled={busy} onClick={() => setConfirm({ row: r, action: "approve" })} className="rounded-md bg-apex-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-apex-700 disabled:opacity-50">Approve</button>
                                <button type="button" disabled={busy} onClick={() => setConfirm({ row: r, action: "decline" })} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Decline</button>
                              </div>
                            ) : (
                              <p className="text-right text-xs text-muted">Done</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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

      {confirm && (
        <Modal title={`${confirm.action === "approve" ? "Approve" : "Decline"} ${kind}`} onClose={() => setConfirm(null)}>
          <p className="text-sm text-ink">
            {confirm.action === "approve" && kind === "deposit" && `This adds ${money(confirm.row.amount)} to ${who(confirm.row)}'s balance and emails them.`}
            {confirm.action === "approve" && kind === "withdrawal" && `This reduces ${who(confirm.row)}'s balance and earnings by ${money(confirm.row.amount)} and emails them. Make sure you've sent the payment.`}
            {confirm.action === "decline" && `${who(confirm.row)} will be emailed that this ${kind} was declined.`}
          </p>
          <dl className="mt-4 space-y-1.5 rounded-lg bg-apex-50 p-4 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted">Amount</dt><dd className="font-semibold">{money(confirm.row.amount)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Method</dt><dd className="font-semibold">{confirm.row.method}</dd></div>
            {kind === "withdrawal" && <div className="flex justify-between gap-4"><dt className="text-muted">Send to</dt><dd className="break-all text-right font-semibold">{confirm.row.details || "—"}</dd></div>}
          </dl>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setConfirm(null)} className="flex-1 rounded-lg border border-apex-200 py-2.5 text-sm font-semibold text-apex-900 hover:bg-apex-50">Cancel</button>
            <button
              type="button"
              disabled={busyId === confirm.row.id}
              onClick={() => run(confirm.row, confirm.action)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${confirm.action === "approve" ? "bg-apex-600 hover:bg-apex-700" : "bg-red-700 hover:bg-red-800"}`}
            >
              {busyId === confirm.row.id ? "Working…" : confirm.action === "approve" ? "Yes, approve" : "Yes, decline"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}