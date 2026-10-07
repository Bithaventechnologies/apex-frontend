import { Link } from "react-router-dom";

type Plan = { id: string; name: string; deposit: string; blurb: string; features: string[]; featured?: boolean };

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    deposit: "$250",
    blurb: "For your first months in the market.",
    features: ["Forex, stocks and crypto", "Daily signals by email", "Withdrawals in 1–2 business days", "Chat support"],
  },
  {
    id: "pro",
    name: "Pro",
    deposit: "$5,000",
    blurb: "For active traders who want faster ideas.",
    features: ["Everything in Starter", "Real-time signal alerts", "Lower spreads", "Weekly review with an analyst", "Priority withdrawals"],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite",
    deposit: "$25,000",
    blurb: "For larger portfolios that need a named contact.",
    features: ["Everything in Pro", "Dedicated account manager", "Custom risk limits", "Same-day withdrawals", "Private market briefings"],
  },
];

function Check({ light }: { light?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" className={`mt-0.5 shrink-0 ${light ? "text-apex-200" : "text-apex-500"}`} aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Plans() {
  return (
    <section id="plans" className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-apex-950 sm:text-4xl">Pick the account that fits your capital</h2>
        <p className="mt-3 text-lg text-muted">The minimum deposit sets your plan. You can move up whenever your balance does.</p>
      </div>

      <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const f = plan.featured;
          return (
            <article
              key={plan.id}
              className={`flex flex-col rounded-2xl p-7 ${f ? "bg-apex-900 text-white md:-my-4 md:py-11" : "border border-apex-100 bg-white"}`}
            >
              <h3 className={`text-xl font-bold ${f ? "text-white" : "text-apex-950"}`}>{plan.name}</h3>
              <p className={`mt-1 text-sm ${f ? "text-apex-200" : "text-muted"}`}>{plan.blurb}</p>
              <p className="mt-6 font-display text-4xl font-extrabold">{plan.deposit}</p>
              <p className={`text-sm ${f ? "text-apex-200" : "text-muted"}`}>minimum deposit</p>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex gap-3">
                    <Check light={f} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/register?plan=${plan.id}`}
                className={`mt-8 rounded-lg py-3 text-center font-semibold transition-colors ${
                  f ? "bg-white text-apex-900 hover:bg-apex-100" : "bg-apex-600 text-white hover:bg-apex-700"
                }`}
              >
                Choose {plan.name}
              </Link>
            </article>
          );
        })}
      </div>

      <p className="mt-10 max-w-3xl text-sm text-muted">
        Trading carries risk and you can lose some or all of your deposit. Signals are analyst opinions, not guarantees of profit.
      </p>
    </section>
  );
}