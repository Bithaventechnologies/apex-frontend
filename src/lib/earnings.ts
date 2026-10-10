import { api, unwrapData } from "./api";
export type Earning = { id: string | number; uid?: string; amount: number; plan_name?: string; plan_id?: string | number; duration?: number; investment_id?: string | number; createdAt: string | number; updatedAt?: string | number };
type List = { data: Earning[] };
type One = { data: Earning };
export async function getEarnings(): Promise<Earning[]> { return unwrapData<List>((await api.get("/earnings/all")).data as List).data; }
export async function getEarning(id: string | number): Promise<Earning> { return unwrapData<One>((await api.get(`/earnings/${id}`)).data as One).data; }
