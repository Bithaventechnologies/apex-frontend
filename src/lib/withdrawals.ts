import { api, unwrapData } from "./api";
export type Withdrawal = { id: string | number; amount: number; to?: string; method: string; status: string; createdAt: string | number; updatedAt?: string | number };
type List<T> = { data: T[] };
type One<T> = { data: T };
export type CreateWithdrawal = { amount: number; to?: string; method: string; emailAddress?: string; walletAddress?: string; bankName?: string; bankAccount?: string; accountName?: string; routingNumber?: string };
export async function getWithdrawals(): Promise<Withdrawal[]> { return unwrapData<List<Withdrawal>>((await api.get("/withdrawals/all")).data as List<Withdrawal>).data; }
export async function getWithdrawal(id: string | number): Promise<Withdrawal> { return unwrapData<One<Withdrawal>>((await api.get(`/withdrawals/${id}`)).data as One<Withdrawal>).data; }
export async function createWithdrawal(input: CreateWithdrawal): Promise<Withdrawal> { return unwrapData<One<Withdrawal>>((await api.post("/withdrawals", input)).data as One<Withdrawal>).data; }
