import { round2 } from "../lib/format";
import type { Point } from "../types/earningchart";
import type { Earning, Investment } from "../types/planType";

export function dailySeries(earnings: Earning[], days: number): Point[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  const out: Point[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toDateString();
    const value = earnings.filter((e) => new Date(e.date).toDateString() === key).reduce((s, e) => s + e.amount, 0);
    out.push({ label: fmt.format(d), value: round2(value) });
  }
  return out;
}

export function investmentProgress(inv: Investment): number {
  const start = new Date(inv.startDate).getTime();
  const end = new Date(inv.endDate).getTime();
  return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
}

export function daysLeft(inv: Investment): number {
  return Math.max(0, Math.ceil((new Date(inv.endDate).getTime() - Date.now()) / 86_400_000));
}