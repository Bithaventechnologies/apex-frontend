import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import TextField from "../Components/Textfield";
import SubmitButton from "../Components/SubmitButton";
import { planList, type PlanInfo } from "../data/plans";
import { money, shortDate } from "../lib/format";
import { Banner, Modal, PageHeader } from "../Components/Ui";

const AVAILABLE_BALANCE = 2500;

function InvestDialog({
  plan,
  onClose,
}: {
  plan: PlanInfo;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(String(plan.min));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const balance = AVAILABLE_BALANCE;
  const n = Number(amount);

  const endsOn = new Date(
    Date.now() + plan.termDays * 86_400_000
  ).toISOString();

  const cannotAfford = balance < plan.min;

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    setSubmitted(false);

    if (Number.isNaN(n) || n < plan.min) {
      setError(
        `The minimum for ${plan.name} is ${money(plan.min)}.`
      );
      return;
    }

    if (plan.max !== null && n > plan.max) {
      setError(
        `The maximum for ${plan.name} is ${money(plan.max)}.`
      );
      return;
    }

    if (n > balance) {
      setError(
        `You only have ${money(balance)} available.`
      );
      return;
    }

    setError("");
    setLoading(true);

    // UI-only submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <Modal
      title={`Invest in ${plan.name}`}
      onClose={onClose}
    >
      {cannotAfford ? (
        <div>
          <Banner tone="error">
            Your balance ({money(balance)}) is below the{" "}
            {money(plan.min)} minimum for this plan.
          </Banner>

          <Link
            to="/dashboard/deposit"
            className="block rounded-lg bg-apex-600 py-3 text-center font-semibold text-white hover:bg-apex-700"
          >
            Make a deposit
          </Link>
        </div>
      ) : submitted ? (
        <div className="space-y-4">
          <Banner tone="success">
            Your investment request has been submitted successfully.
          </Banner>

          <div className="rounded-lg bg-apex-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Plan</span>
              <span className="font-semibold">
                {plan.name}
              </span>
            </div>

            <div className="mt-2 flex justify-between">
              <span className="text-muted">Amount</span>
              <span className="font-semibold">
                {money(n)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-apex-600 py-3 font-semibold text-white hover:bg-apex-700"
          >
            Done
          </button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-5"
        >
          <TextField
            label={`Amount (USD). You have ${money(
              balance
            )} available`}
            name="amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            error={error}
          />

          <dl className="space-y-1.5 rounded-lg bg-apex-50 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Term</dt>
              <dd className="font-semibold">
                {plan.termDays} days
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-muted">Ends on</dt>
              <dd className="font-semibold">
                {shortDate(endsOn)}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-muted">Target return</dt>
              <dd className="font-semibold">
                {plan.targetLow}–{plan.targetHigh}% per term
              </dd>
            </div>
          </dl>

          <p className="text-xs text-muted">
            Targets are not guaranteed. Your capital is at risk
            and you can lose some or all of it.
          </p>

          <SubmitButton
            loading={loading}
            loadingText="Starting…"
          >
            Confirm investment
          </SubmitButton>
        </form>
      )}
    </Modal>
  );
}

export default function Plans() {
  const [selected, setSelected] =
    useState<PlanInfo | null>(null);

  const balance = AVAILABLE_BALANCE;

  return (
    <>
      <PageHeader
        title="Plans"
        description={`Choose a plan and the amount to put in. You have ${money(
          balance
        )} available.`}
      />

      <div className="grid items-stretch gap-6 md:grid-cols-3">
        {planList.map((plan) => {
          const featured = plan.id === "pro";

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-6 ${
                featured
                  ? "bg-apex-900 text-white"
                  : "border border-apex-100 bg-white"
              }`}
            >
              {featured && (
                <span className="absolute right-5 top-5 rounded-full bg-gold-400 px-3 py-1 text-xs font-semibold text-apex-950">
                  Most chosen
                </span>
              )}

              <h2 className="text-xl font-bold">
                {plan.name}
              </h2>

              <p
                className={`mt-1 text-sm ${
                  featured
                    ? "text-apex-200"
                    : "text-muted"
                }`}
              >
                {plan.blurb}
              </p>

              <p className="mt-6 font-display text-3xl font-extrabold tabular-nums">
                {plan.targetLow}–{plan.targetHigh}%
              </p>

              <p
                className={`text-sm ${
                  featured
                    ? "text-apex-200"
                    : "text-muted"
                }`}
              >
                target per {plan.termDays} days, not guaranteed
              </p>

              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt
                    className={
                      featured
                        ? "text-apex-200"
                        : "text-muted"
                    }
                  >
                    Amount
                  </dt>

                  <dd className="font-semibold">
                    {money(plan.min)}
                    {plan.max
                      ? ` – ${money(plan.max)}`
                      : "+"}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt
                    className={
                      featured
                        ? "text-apex-200"
                        : "text-muted"
                    }
                  >
                    Term
                  </dt>

                  <dd className="font-semibold">
                    {plan.termDays} days
                  </dd>
                </div>
              </dl>

              <ul
                className={`mt-5 flex-1 space-y-2 text-sm ${
                  featured
                    ? "text-apex-100"
                    : "text-ink"
                }`}
              >
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2.5"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      className={`mt-0.5 shrink-0 ${
                        featured
                          ? "text-gold-400"
                          : "text-apex-500"
                      }`}
                      aria-hidden="true"
                    >
                      <path
                        d="M4 10.5l4 4 8-9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setSelected(plan)}
                className={`mt-7 rounded-lg py-3 font-semibold transition-colors ${
                  featured
                    ? "bg-gold-400 text-apex-950 hover:bg-gold-500"
                    : "bg-apex-600 text-white hover:bg-apex-700"
                }`}
              >
                Invest in {plan.name}
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-8 max-w-3xl text-sm text-muted">
        Trading carries risk. Target returns are estimates,
        not promises, and past results don't predict future
        ones.
      </p>

      {selected && (
        <InvestDialog
          plan={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}