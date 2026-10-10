// PLACEHOLDER numbers: set these to your real product terms and have them reviewed for compliance.
export type PlanId = "starter" | "pro" | "elite";

export type PlanInfo = {
  id: PlanId;
  name: string;
  min: number;
  max: number | null;
  termDays: number;
  targetLow: number; // target return per term, in %. A target, never a guarantee.
  targetHigh: number;
  blurb: string;
  features: string[];
};

export const planList: PlanInfo[] = [
  {
    id: "starter", name: "Starter", min: 250, max: 4999, termDays: 30, targetLow: 3, targetHigh: 5,
    blurb: "For your first months in the market.",
    features: ["Forex, stocks and crypto", "Daily signals by email", "Withdrawals in 1–2 business days"],
  },
  {
    id: "pro", name: "Pro", min: 5000, max: 24999, termDays: 30, targetLow: 4, targetHigh: 6,
    blurb: "For active traders who want faster ideas.",
    features: ["Real-time signal alerts", "Lower spreads", "Weekly review with an analyst", "Priority withdrawals"],
  },
  {
    id: "elite", name: "Elite", min: 25000, max: null, termDays: 30, targetLow: 5, targetHigh: 7,
    blurb: "For larger portfolios that need a named contact.",
    features: ["Dedicated account manager", "Custom risk limits", "Same-day withdrawals", "Private market briefings"],
  },
];

export const getPlan = (id: PlanId) => planList.find((p) => p.id === id) ?? planList[0];