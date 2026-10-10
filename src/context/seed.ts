// Demo data so the dashboard has something to show. Delete once the API is connected.
import { getPlan } from "../data/plans";
import { round2 } from "../lib/format";
import type { Earning, Investment, Transaction } from "../types/planType";

const DAY = 86_400_000;
const at = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();
const PATTERN = [0.7, 1.1, 0.9, 1.3, 0.8, 1.2, 1.0];

function earningsFor(inv: Investment): Earning[] {
  const plan = getPlan(inv.planId);
  const mid = (plan.targetLow + plan.targetHigh) / 2 / 100;
  const start = new Date(inv.startDate).getTime();
  const elapsed = Math.min(plan.termDays, Math.floor((Date.now() - start) / DAY));
  const list: Earning[] = [];
  for (let d = 1; d <= elapsed; d++) {
    list.push({
      id: `${inv.id}-d${d}`,
      date: new Date(start + d * DAY).toISOString(),
      amount: round2(inv.amount * (mid / plan.termDays) * PATTERN[d % PATTERN.length]),
      investmentId: inv.id,
      planId: inv.planId,
    });
  }
  return list;
}

export function buildSeed() {
  const base: Investment[] = [
    { id: "inv-1", planId: "starter", amount: 750, startDate: at(-9), endDate: at(21), status: "active", earned: 0 },
    { id: "inv-2", planId: "starter", amount: 400, startDate: at(-36), endDate: at(-6), status: "completed", earned: 0 },
  ];
  const earnings = base.flatMap(earningsFor);
  const investments = base.map((i) => ({
    ...i,
    earned: round2(earnings.filter((e) => e.investmentId === i.id).reduce((s, e) => s + e.amount, 0)),
  }));
  const totalEarned = earnings.reduce((s, e) => s + e.amount, 0);

  const transactions: Transaction[] = [
    { id: "t4", type: "withdrawal", amount: 100, method: "USDT (TRC20)", status: "pending", date: at(-2), reference: "WDR-30982" },
    { id: "t3", type: "withdrawal", amount: 150, method: "Bank transfer", status: "completed", date: at(-20), reference: "WDR-30417" },
    { id: "t2", type: "deposit", amount: 500, method: "USDT (TRC20)", status: "completed", date: at(-14), reference: "DEP-52077" },
    { id: "t1", type: "deposit", amount: 1000, method: "Bank transfer", status: "completed", date: at(-40), reference: "DEP-48213" },
  ];

  // deposits 1500 - invested 1150 + returned principal 400 - withdrawals 250 = 500, plus earnings
  return { balance: round2(500 + totalEarned), transactions, investments, earnings };
}