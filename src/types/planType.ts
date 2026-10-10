
import type { PlanId } from "../data/plans";

export type TxType = "deposit" | "withdrawal";
export type TxStatus = "pending" | "completed" | "rejected";

export type Transaction = { id: string; type: TxType; amount: number; method: string; status: TxStatus; date: string; reference: string };
export type Investment = { id: string; planId: PlanId; amount: number; startDate: string; endDate: string; status: "active" | "completed"; earned: number };
export type Earning = { id: string; date: string; amount: number; investmentId: string; planId: PlanId };