/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { money, shortDate } from "../lib/format";
import {
  Card,
  EmptyState,
  PageHeader,
  Progress,
  StatCard,
  StatusBadge,
} from "../Components/Ui";
import {
  getInvestments,
  type Investment,
} from "../lib/investments";

type Filter = "all" | "active" | "completed";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

function normalizeStatus(status: string): string {
  const value = status.toLowerCase();

  if (["complete", "completed", "finished"].includes(value)) {
    return "completed";
  }

  if (["active", "approved", "running", "in_progress"].includes(value)) {
    return "active";
  }

  return value;
}

function getPlanName(investment: Investment): string {
  if (investment.plan_name?.trim()) {
    return investment.plan_name;
  }

  const planId = String(investment.plan_id).toLowerCase();

  if (planId === "basic") return "Starter";
  if (planId === "pro") return "Pro";

  return `Plan ${planId}`;
}

function getStartDate(investment: Investment): string | number {
  return investment.createdAt;
}

function getEndDate(investment: Investment): Date | null {
  const start = new Date(investment.createdAt);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  if (
    typeof investment.duration !== "number" ||
    !Number.isFinite(investment.duration) ||
    investment.duration <= 0
  ) {
    return null;
  }

  const end = new Date(start);
  end.setDate(end.getDate() + investment.duration);

  return end;
}

function getEarnedAmount(investment: Investment): number {
  const amount = Number(
    investment.creditedAmount ?? investment.returns ?? 0
  );

  return Number.isFinite(amount) ? amount : 0;
}

function getInvestmentAmount(investment: Investment): number {
  const amount = Number(investment.amount ?? 0);

  return Number.isFinite(amount) ? amount : 0;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      }
    ).response;

    return (
      response?.data?.message ||
      response?.data?.error ||
      "We couldn't load your investments. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "We couldn't load your investments. Please try again.";
}

export default function Investments() {
  const [filter, setFilter] = useState<Filter>("all");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInvestments() {
    setLoading(true);
    setError("");

    try {
      const result = await getInvestments();
      setInvestments(result);
    } catch (err) {
      console.error("Failed to load investments:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInvestments();
  }, []);

  const shown = useMemo(
    () =>
      investments.filter((investment) => {
        const status = normalizeStatus(investment.status);

        if (filter === "all") return true;
        if (filter === "active") return status === "active";
        if (filter === "completed") return status === "completed";

        return false;
      }),
    [investments, filter]
  );

  const totalInvested = useMemo(
    () =>
      investments.reduce(
        (sum, investment) => sum + getInvestmentAmount(investment),
        0
      ),
    [investments]
  );

  const earnedTotal = useMemo(
    () =>
      investments.reduce(
        (sum, investment) => sum + getEarnedAmount(investment),
        0
      ),
    [investments]
  );

  const activeInvestments = useMemo(
    () =>
      investments.filter(
        (investment) => normalizeStatus(investment.status) === "active"
      ).length,
    [investments]
  );

  return (
    <>
      <PageHeader
        title="Investments"
        description="Everything you've put into a plan, with how far along it is."
        action={
          <Link
            to="/user/plans"
            className="rounded-lg bg-apex-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-apex-700"
          >
            New investment
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active investments"
          value={loading ? "—" : String(activeInvestments)}
        />

        <StatCard
          label="Currently invested"
          value={loading ? "—" : money(totalInvested)}
        />

        <StatCard
          label="Earned across all plans"
          value={loading ? "—" : money(earnedTotal)}
        />
      </div>

      <div
        className="mb-5 mt-8 inline-flex rounded-lg border border-apex-200 bg-white p-1"
        role="group"
        aria-label="Filter investments"
      >
        {filters.map((filterOption) => (
          <button
            key={filterOption.id}
            type="button"
            aria-pressed={filter === filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === filterOption.id
                ? "bg-apex-900 text-white"
                : "text-muted hover:text-apex-900"
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card>
          <p className="py-8 text-center text-sm text-muted">
            Loading your investments...
          </p>
        </Card>
      ) : error ? (
        <Card>
          <div className="py-6 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => void loadInvestments()}
              className="mt-3 text-sm font-semibold text-apex-700 hover:underline"
            >
              Try again
            </button>
          </div>
        </Card>
      ) : shown.length === 0 ? (
        <EmptyState
          title={
            investments.length === 0
              ? "No investments yet"
              : "No investments here"
          }
          body={
            investments.length === 0
              ? "When you invest in a plan, your investment details and progress will appear here."
              : "There are no investments matching this filter."
          }
          to="/user/plans"
          cta="Browse plans"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((investment) => {
            const planName = getPlanName(investment);
            const status = normalizeStatus(investment.status);
            const isActive = status === "active";
            const startDate = getStartDate(investment);
            const endDate = getEndDate(investment);
            const earned = getEarnedAmount(investment);
            const amount = getInvestmentAmount(investment);

            const now = Date.now();
            const start = new Date(startDate).getTime();
            const end = endDate?.getTime() ?? 0;

            const hasValidDuration =
              endDate !== null &&
              Number.isFinite(start) &&
              end > start;

            const progress = isActive
              ? hasValidDuration
                ? Math.min(1, Math.max(0, (now - start) / (end - start)))
                : 0
              : status === "completed"
                ? 1
                : 0;

            const daysLeft =
              isActive && hasValidDuration
                ? Math.max(
                    0,
                    Math.ceil((end - now) / (1000 * 60 * 60 * 24))
                  )
                : null;

            return (
              <Card key={String(investment.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-apex-950">
                      {planName} plan
                    </h2>

                    <p className="text-sm text-muted">
                      Started {shortDate(String(startDate))}
                    </p>
                  </div>

                  <StatusBadge status={status} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted">Amount</p>

                    <p className="font-display text-xl font-bold tabular-nums">
                      {money(amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Earned so far</p>

                    <p className="font-display text-xl font-bold tabular-nums text-apex-700">
                      {money(earned)}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <Progress
                    value={progress}
                    label={`${planName} progress`}
                  />

                  <p className="mt-1.5 text-xs text-muted">
                    {status === "completed" ? (
                      "Investment completed"
                    ) : isActive && endDate && daysLeft !== null ? (
                      daysLeft > 0 ? (
                        `${daysLeft} days left · ends ${shortDate(endDate.toISOString())}`
                      ) : (
                        `Investment period ends ${shortDate(endDate.toISOString())}`
                      )
                    ) : isActive ? (
                      "Investment duration unavailable"
                    ) : (
                      `Status: ${status}`
                    )}
                  </p>
                </div>

                {investment.transaction_id != null && (
                  <p className="mt-4 break-all border-t border-apex-100 pt-3 text-xs text-muted">
                    Transaction reference: {investment.transaction_id}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}