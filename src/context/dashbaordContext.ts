/**
 * Dashboard state. Everything here is MOCK: each action just updates local state after a short delay.
 * To go live, replace the bodies of deposit / withdraw / invest with API calls
 * (POST /deposits, POST /withdrawals, POST /investments) and load the initial data from GET /dashboard.
 * Deposits stay "pending" until an admin confirms them on your backend.
 */
import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { getPlan, type PlanId } from "../data/plans";
import { round2 } from "../lib/format";
import { buildSeed } from "../context/seed";
import type { Earning, Investment, Transaction } from "../types/planType";

const DAY = 86_400_000;
const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));
const ref = (prefix: string) => `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

type Value = {
  balance: number;
  transactions: Transaction[];
  investments: Investment[];
  earnings: Earning[];
  totalInvested: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  deposit: (amount: number, method: string) => Promise<Transaction>;
  withdraw: (amount: number, method: string) => Promise<Transaction>;
  invest: (planId: PlanId, amount: number) => Promise<Investment>;
};

const Ctx = createContext<Value | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [seed] = useState(buildSeed);
  const [balance, setBalance] = useState(seed.balance);
  const [transactions, setTransactions] = useState(seed.transactions);
  const [investments, setInvestments] = useState(seed.investments);
  const [earnings] = useState(seed.earnings);

  const deposit = useCallback(async (amount: number, method: string) => {
    await wait();
    const tx: Transaction = { id: `t-${Date.now()}`, type: "deposit", amount, method, status: "pending", date: new Date().toISOString(), reference: ref("DEP") };
    setTransactions((t) => [tx, ...t]);
    return tx;
  }, []);

  const withdraw = useCallback(async (amount: number, method: string) => {
    await wait();
    if (amount > balance) throw new Error("That's more than your available balance.");
    const tx: Transaction = { id: `t-${Date.now()}`, type: "withdrawal", amount, method, status: "pending", date: new Date().toISOString(), reference: ref("WDR") };
    setBalance((b) => round2(b - amount)); // held while the request is reviewed
    setTransactions((t) => [tx, ...t]);
    return tx;
  }, [balance]);

  const invest = useCallback(async (planId: PlanId, amount: number) => {
    await wait();
    const plan = getPlan(planId);
    if (amount > balance) throw new Error("That's more than your available balance.");
    if (amount < plan.min) throw new Error(`The minimum for ${plan.name} is $${plan.min.toLocaleString()}.`);
    if (plan.max !== null && amount > plan.max) throw new Error(`The maximum for ${plan.name} is $${plan.max.toLocaleString()}.`);
    const now = Date.now();
    const inv: Investment = {
      id: `inv-${now}`, planId, amount, startDate: new Date(now).toISOString(),
      endDate: new Date(now + plan.termDays * DAY).toISOString(), status: "active", earned: 0,
    };
    setBalance((b) => round2(b - amount));
    setInvestments((list) => [inv, ...list]);
    return inv;
  }, [balance]);

  const value = useMemo<Value>(() => ({
    balance, transactions, investments, earnings, deposit, withdraw, invest,
    totalInvested: investments.filter((i) => i.status === "active").reduce((s, i) => s + i.amount, 0),
    totalEarnings: round2(earnings.reduce((s, e) => s + e.amount, 0)),
    pendingWithdrawals: transactions.filter((t) => t.type === "withdrawal" && t.status === "pending").reduce((s, t) => s + t.amount, 0),
  }), [balance, transactions, investments, earnings, deposit, withdraw, invest]);

  return createElement(Ctx.Provider, { value }, children);
}

export function useDashboard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}