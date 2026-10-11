/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPlans, type Plan } from "../lib/plans";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const days = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

function PlanSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-apex-100 bg-white p-7" aria-hidden="true">
      <div className="h-5 w-32 rounded bg-apex-100" />
      <div className="mt-8 h-12 w-24 rounded bg-apex-100" />
      <div className="mt-3 h-4 w-40 rounded bg-apex-100" />
      <div className="mt-8 space-y-3">
        <div className="h-4 rounded bg-apex-100" />
        <div className="h-4 rounded bg-apex-100" />
        <div className="h-4 rounded bg-apex-100" />
      </div>
      <div className="mt-8 h-11 rounded-lg bg-apex-100" />
    </div>
  );
}

function PlanCard({ plan, top }: { plan: Plan; top: boolean }) {
  const muted = top ? "text-apex-200" : "text-muted";
  const rowLine = top ? "border-white/10" : "border-apex-100";

  return (
    <article
      className={`flex flex-col rounded-2xl p-7 ${
        top ? "bg-apex-900 text-white" : "border border-apex-100 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className={`text-lg font-bold ${top ? "text-white" : "text-apex-950"}`}>{plan.name}</h3>
        <span className="shrink-0 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-bold text-apex-950">
          {days(plan.duration)}
        </span>
      </div>

      <p className="mt-6 font-display text-5xl font-extrabold tracking-tight">{plan.returns}%</p>
      <p className={`mt-1 text-sm ${muted}`}>target return in {days(plan.duration)}</p>

      <dl className="mt-7 flex-1 text-sm">
        <div className={`flex justify-between border-t py-3 ${rowLine}`}>
          <dt className={muted}>Minimum</dt>
          <dd className="font-semibold tabular-nums">{money.format(plan.minAmount)}</dd>
        </div>
        <div className={`flex justify-between border-t py-3 ${rowLine}`}>
          <dt className={muted}>Maximum</dt>
          <dd className="font-semibold tabular-nums">{plan.maxAmount === null ? "—" : money.format(plan.maxAmount)}</dd>
        </div>
        <div className={`flex justify-between border-t border-b py-3 ${rowLine}`}>
          <dt className={muted}>Term</dt>
          <dd className="font-semibold">{days(plan.duration)}</dd>
        </div>
      </dl>

      <Link
        to={`/auth/register?plan=${plan.id}`}
        className={`mt-7 rounded-lg py-3 text-center font-semibold transition-colors ${
          top ? "bg-gold-400 text-apex-950 hover:bg-gold-500" : "bg-apex-600 text-white hover:bg-apex-700"
        }`}
      >
        Choose {plan.name}
      </Link>
    </article>
  );
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    getPlans(controller.signal)
      .then((list) => {
        if (!controller.signal.aborted) setPlans(list);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to load plans. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  const columns = plans.length === 3 ? "lg:grid-cols-3" : plans.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-4";

  return (
    <section id="plans" className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-apex-950 sm:text-4xl">Pick the plan that fits your capital</h2>
        <p className="mt-3 text-lg text-muted">
          Every plan has its own amount range, term and target return. Start where you're comfortable and move up when you're ready.
        </p>
      </div>

      <div className={`mt-12 grid gap-6 sm:grid-cols-2 ${columns}`} aria-busy={loading}>
        {loading && [0, 1, 2, 3].map((i) => <PlanSkeleton key={i} />)}

        {!loading &&
          !error &&
          plans.map((plan, i) => <PlanCard key={plan.id} plan={plan} top={plans.length > 1 && i === plans.length - 1} />)}
      </div>

      {!loading && error && (
        <div role="alert" className="mt-12 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="font-semibold text-red-800">{error}</p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-apex-200 px-6 py-12 text-center">
          <p className="font-semibold text-apex-950">Plans are coming soon</p>
          <p className="mt-1 text-sm text-muted">Check back shortly, or contact us to learn more.</p>
        </div>
      )}

      <p className="mt-10 max-w-3xl text-sm text-muted">
        Trading carries risk and you can lose some or all of your deposit. Target returns are estimates, not guarantees of profit.
      </p>
    </section>
  );
}