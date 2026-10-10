
import { useEffect, useMemo, useState } from "react";
import { money, shortDate } from "../lib/format";
import { getEarnings, type Earning } from "../lib/earnings";
import { apiErrorMessage } from "../lib/api";
import EarningsChart from "../types/earningchart";
import {
  Card,
  EmptyState,
  PageHeader,
  StatCard,
} from "../Components/Ui";

const PAGE = 15;

function getTimestamp(value: string | number): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getDateKey(value: string | number): string | null {
  const timestamp = getTimestamp(value);

  if (!timestamp) return null;

  const date = new Date(timestamp);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatEarningDate(value: string | number): string {
  const timestamp = getTimestamp(value);

  if (!timestamp) return "Date unavailable";

  return shortDate(new Date(timestamp).toISOString());
}

export default function Earnings() {
  const [visible, setVisible] = useState(PAGE);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEarnings() {
      setLoading(true);
      setError("");

      try {
        const items = await getEarnings();

        if (active) {
          setEarnings(items);
        }
      } catch (reason: unknown) {
        if (active) {
          setError(apiErrorMessage(reason));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadEarnings();

    return () => {
      active = false;
    };
  }, []);

  const total = useMemo(
    () =>
      earnings.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [earnings]
  );

  const series = useMemo(() => {
    const dailyTotals = new Map<string, number>();
    const today = new Date();

    for (const item of earnings) {
      const key = getDateKey(item.createdAt);

      if (!key) continue;

      dailyTotals.set(
        key,
        (dailyTotals.get(key) ?? 0) + Number(item.amount || 0)
      );
    }

    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - (29 - i)
      );

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: dailyTotals.get(key) ?? 0,
      };
    });
  }, [earnings]);

  const recentTotal = useMemo(
    () => series.reduce((sum, item) => sum + item.value, 0),
    [series]
  );

  const best = useMemo(
    () =>
      series.reduce(
        (a, b) => (b.value > a.value ? b : a),
        { label: "-", value: 0 }
      ),
    [series]
  );

  const sorted = useMemo(
    () =>
      [...earnings].sort(
        (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
      ),
    [earnings]
  );

  return (
    <>
      <PageHeader
        title="Earnings"
        description="Credits from your investments, newest first."
      />

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setError("");

              try {
                const items = await getEarnings();
                setEarnings(items);
              } catch (reason: unknown) {
                setError(apiErrorMessage(reason));
              } finally {
                setLoading(false);
              }
            }}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading && (
        <p className="mb-4 text-sm text-muted">
          Loading earnings...
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          accent
          label="Total earnings"
          value={loading ? "—" : money(total)}
          hint="All time"
        />

        <StatCard
          label="Last 30 days"
          value={loading ? "—" : money(recentTotal)}
        />

        <StatCard
          label="Best day (30 days)"
          value={loading ? "—" : money(best.value)}
          hint={best.value ? best.label : undefined}
        />
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-bold text-apex-950">
          Daily earnings, last 30 days
        </h2>

        <div className="mt-4">
          <EarningsChart data={series} height={220} />
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-apex-950">
          Earnings history
        </h2>

        {!loading && !error && sorted.length === 0 ? (
          <EmptyState
            title="No earnings yet"
            body="Credits appear here once an investment starts earning."
            to="/user/plans"
            cta="Browse plans"
          />
        ) : sorted.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-105 text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Source</th>
                    <th className="py-2 text-right font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-apex-100">
                  {sorted.slice(0, visible).map((item) => (
                    <tr key={String(item.id)}>
                      <td className="whitespace-nowrap py-3 pr-4">
                        {formatEarningDate(item.createdAt)}
                      </td>

                      <td className="py-3 pr-4">
                        {item.plan_name ||
                          (item.plan_id
                            ? `Plan ${item.plan_id}`
                            : "Investment")}{" "}
                        investment
                      </td>

                      <td className="py-3 text-right font-semibold tabular-nums text-apex-700">
                        +{money(Number(item.amount || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {visible < sorted.length && (
              <button
                type="button"
                onClick={() =>
                  setVisible((value) => value + PAGE)
                }
                className="mt-4 rounded-lg border border-apex-200 px-4 py-2 text-sm font-semibold text-apex-900 hover:bg-apex-50"
              >
                Show more
              </button>
            )}
          </>
        ) : loading ? (
          <p className="py-6 text-center text-sm text-muted">
            Loading earnings history...
          </p>
        ) : null}
      </Card>
    </>
  );
}
