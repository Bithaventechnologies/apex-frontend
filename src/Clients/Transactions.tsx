/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import { money, shortDate } from "../lib/format";
import {
  getTransactions,
  type Transaction as ApiTransaction,
} from "../lib/transactions";
import { apiErrorMessage } from "../lib/api";
import {
  Card,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
} from "../Components/Ui";

type Kind = "deposit" | "withdrawal" | "investment" | "earning" | "other";

type Row = {
  id: string;
  date: string | number;
  kind: Kind;
  reference: string;
  description: string;
  amount: number;
  status: string;
};

const kinds: { id: "all" | Kind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "deposit", label: "Deposits" },
  { id: "withdrawal", label: "Withdrawals" },
  { id: "investment", label: "Investments" },
  { id: "earning", label: "Earnings" },
  { id: "other", label: "Others" },
];

const statuses = [
  "all",
  "pending",
  "completed",
  "active",
  "rejected",
] as const;

const PAGE = 15;

const credit = (kind: Kind) =>
  kind === "deposit" || kind === "earning";

function normalizeKind(type?: string): Kind {
  const value = (type ?? "").trim().toLowerCase().replace(/[\s_-]+/g, "");

  switch (value) {
    case "deposit":
    case "deposits":
      return "deposit";

    case "withdrawal":
    case "withdrawals":
    case "withdraw":
      return "withdrawal";

    case "investment":
    case "investments":
    case "invest":
      return "investment";

    case "earning":
    case "earnings":
    case "profit":
    case "profits":
      return "earning";

    default:
      return "other";
  }
}

function normalizeStatus(status?: string): string {
  const value = (status ?? "pending").trim().toLowerCase();

  if (
    [
      "success",
      "successful",
      "confirmed",
      "paid",
      "approved",
      "complete",
      "completed",
    ].includes(value)
  ) {
    return "completed";
  }

  if (
    [
      "failed",
      "declined",
      "rejected",
      "error",
      "cancelled",
      "canceled",
      "refunded",
      "reversed",
    ].includes(value)
  ) {
    return "rejected";
  }

  return value;
}

function formatReference(
  item: ApiTransaction
): string {
  return String(item.transaction_id || item.id);
}

function getDescription(item: ApiTransaction, kind: Kind): string {
  if (item.plan_name) {
    return `${item.plan_name} plan`;
  }

  if (item.method) {
    return item.method;
  }

  switch (kind) {
    case "deposit":
      return "Deposit";

    case "withdrawal":
      return item.to ? `Withdrawal to ${item.to}` : "Withdrawal";

    case "investment":
      return "Investment";

    case "earning":
      return "Investment earnings";

    default:
      return item.from && item.to
        ? `${item.from} → ${item.to}`
        : item.to
          ? `To ${item.to}`
          : item.from
            ? `From ${item.from}`
            : "Transaction";
  }
}

function toRow(item: ApiTransaction): Row {
  const kind = normalizeKind(item.type);

  return {
    id: String(item.id),
    date: item.createdAt,
    kind,
    reference: formatReference(item),
    description: getDescription(item, kind),
    amount: Number(item.amount) || 0,
    status: normalizeStatus(item.status),
  };
}

function toCsv(rows: Row[]): string {
  const escape = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const header = [
    "Date",
    "Reference",
    "Type",
    "Description",
    "Amount (USD)",
    "Status",
  ]
    .map(escape)
    .join(",");

  const lines = rows.map((row) =>
    [
      shortDate(String(row.date)),
      row.reference,
      row.kind,
      row.description,
      (credit(row.kind) ? row.amount : -row.amount).toFixed(2),
      row.status,
    ]
      .map(escape)
      .join(",")
  );

  return [header, ...lines].join("\n");
}

export default function Transactions() {
  const [rows, setRows] = useState<Row[]>([]);
  const [kind, setKind] = useState<"all" | Kind>("all");
  const [status, setStatus] =
    useState<(typeof statuses)[number]>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const transactions = await getTransactions();

      const combined = transactions
        .map(toRow)
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        );

      setRows(combined);
    } catch (reason: unknown) {
      setError(apiErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return rows.filter(
      (row) =>
        (kind === "all" || row.kind === kind) &&
        (status === "all" || row.status === status) &&
        (!search ||
          row.reference.toLowerCase().includes(search) ||
          row.description.toLowerCase().includes(search) ||
          row.kind.toLowerCase().includes(search) ||
          row.status.toLowerCase().includes(search))
    );
  }, [rows, kind, status, query]);

  const sum = (selectedKind: Kind, selectedStatus?: string) =>
    rows
      .filter(
        (row) =>
          row.kind === selectedKind &&
          (!selectedStatus || row.status === selectedStatus)
      )
      .reduce((total, row) => total + row.amount, 0);

  const pendingTotal = rows
    .filter(
      (row) =>
        (row.kind === "deposit" || row.kind === "withdrawal") &&
        row.status === "pending"
    )
    .reduce((total, row) => total + row.amount, 0);

  function resetFilters(update: () => void) {
    update();
    setVisible(PAGE);
  }

  function exportCsv() {
    if (filtered.length === 0) return;

    const blob = new Blob(["\uFEFF", toCsv(filtered)], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `apex-transactions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Transaction history"
        description="Every deposit, withdrawal, investment and earning on your account."
        action={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void loadTransactions()}
              disabled={loading}
              className="rounded-lg border border-apex-200 bg-white px-4 py-2.5 text-sm font-semibold text-apex-900 hover:bg-apex-50 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={exportCsv}
              disabled={!filtered.length || loading}
              className="rounded-lg border border-apex-200 bg-white px-4 py-2.5 text-sm font-semibold text-apex-900 hover:bg-apex-50 disabled:opacity-50"
            >
              Download CSV
            </button>
          </div>
        }
      />

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadTransactions()}
            disabled={loading}
            className="mt-2 font-semibold underline disabled:opacity-50"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total deposited"
          value={money(sum("deposit", "completed"))}
          hint="Confirmed deposits"
        />

        <StatCard
          label="Total withdrawn"
          value={money(sum("withdrawal", "completed"))}
          hint="Completed withdrawals"
        />

        <StatCard
          label="Pending"
          value={money(pendingTotal)}
          hint="Deposits and withdrawals awaiting review"
        />
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            className="inline-flex flex-wrap rounded-lg border border-apex-200 p-1"
            role="group"
            aria-label="Filter by type"
          >
            {kinds.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={kind === item.id}
                onClick={() =>
                  resetFilters(() => setKind(item.id))
                }
                className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  kind === item.id
                    ? "bg-apex-900 text-white"
                    : "text-muted hover:text-apex-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) =>
                resetFilters(() =>
                  setStatus(
                    event.target.value as (typeof statuses)[number]
                  )
                )
              }
              className="rounded-lg border border-apex-200 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-apex-500 focus:ring-2 focus:ring-apex-500/30"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All statuses" : item}
                </option>
              ))}
            </select>

            <input
              type="search"
              aria-label="Search by reference or description"
              placeholder="Search transactions"
              value={query}
              onChange={(event) =>
                resetFilters(() => setQuery(event.target.value))
              }
              className="w-44 rounded-lg border border-apex-200 bg-white px-3 py-2 text-sm outline-none focus:border-apex-500 focus:ring-2 focus:ring-apex-500/30"
            />
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted">
              Loading transaction history...
            </p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No transactions found"
              body="Your transaction records will appear here when available. Try a different filter or search."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">
                        Reference
                      </th>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 pr-4 font-medium">Details</th>
                      <th className="py-2 pr-4 text-right font-medium">
                        Amount
                      </th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-apex-100">
                    {filtered.slice(0, visible).map((row) => (
                      <tr key={`${row.kind}-${row.id}`}>
                        <td className="whitespace-nowrap py-3 pr-4">
                          {shortDate(String(row.date))}
                        </td>

                        <td className="py-3 pr-4 font-mono text-xs">
                          {row.reference}
                        </td>

                        <td className="py-3 pr-4 capitalize">
                          {row.kind}
                        </td>

                        <td className="py-3 pr-4 text-muted">
                          {row.description}
                        </td>

                        <td
                          className={`whitespace-nowrap py-3 pr-4 text-right font-semibold tabular-nums ${
                            credit(row.kind)
                              ? "text-apex-700"
                              : "text-ink"
                          }`}
                        >
                          {credit(row.kind) ? "+" : "−"}
                          {money(row.amount)}
                        </td>

                        <td className="py-3">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <span>
                  Showing {Math.min(visible, filtered.length)} of{" "}
                  {filtered.length}
                </span>

                {visible < filtered.length && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisible((current) => current + PAGE)
                    }
                    className="rounded-lg border border-apex-200 px-4 py-2 font-semibold text-apex-900 hover:bg-apex-50"
                  >
                    Show more
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </>
  );
}