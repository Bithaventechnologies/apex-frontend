import { api, unwrapData } from "./api";
export type Investment = { id: string | number; uid?: string; name?: string; email?: string; plan_id: string | number; plan_name?: string; method: string; duration?: number; amount: number; returns?: number; status: string; active?: boolean; creditedAmount?: number; lastCreditedAt?: string; transaction_id?: string | number; balance?: number; createdAt: string | number; updatedAt?: string | number };
type List = { data: Investment[] };
type One = { data: Investment };
export async function getInvestments(): Promise<Investment[]> { return unwrapData<List>((await api.get("/investments/all")).data as List).data; }
export async function getInvestment(id: string | number): Promise<Investment> { return unwrapData<One>((await api.get(`/investments/${id}`)).data as One).data; }
export async function createInvestment(input: { plan_id: string | number; amount: number; method: "BTC" | "ETH" | "SOL" | "USDT" }): Promise<Investment> { return unwrapData<One>((await api.post("/investments", input)).data as One).data; }
