import { api, unwrapData } from "./api";
export type Plan = { id: string | number; name: string; returns: number; minAmount: number; maxAmount: number | null; duration: number; uid?: string; user?: unknown; createdAt?: string; updatedAt?: string };
type List = { data: Plan[] };
type One = { data: Plan };
export async function getPlans(): Promise<Plan[]> { return unwrapData<List>((await api.get("/plans/all")).data as List).data; }
export async function getPlanById(id: string | number): Promise<Plan> { return unwrapData<One>((await api.get(`/plans/${id}`)).data as One).data; }
