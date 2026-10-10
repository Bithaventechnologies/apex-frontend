
import { api, unwrapData } from "./api";

export type Deposit = {
  id: string | number;
  uid?: string;
  amount: number;
  method: string;
  from?: string;
  status: string;
  createdAt: string | number;
  updatedAt?: string | number;
};

type List<T> = {
  message?: string;
  count?: number;
  data: T[];
};

type One<T> = {
  message?: string;
  data: T;
};

// GET ALL DEPOSITS
export async function getDeposits(): Promise<Deposit[]> {
  const response = await api.get("/deposits");

  return unwrapData<List<Deposit>>(
    response.data as List<Deposit>
  ).data;
}

// GET DEPOSIT BY ID
export async function getDeposit(
  id: string | number
): Promise<Deposit> {
  const response = await api.get(`/deposits/${id}`);

  return unwrapData<One<Deposit>>(
    response.data as One<Deposit>
  ).data;
}

// CREATE DEPOSIT
export async function createDeposit(input: {
  amount: number;
  method: "BTC" | "SOL" | "ETH";
  from: string;
}): Promise<Deposit> {
  const response = await api.post("/deposits", input);

  return unwrapData<One<Deposit>>(
    response.data as One<Deposit>
  ).data;
}
