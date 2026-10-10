import { api, unwrapData } from "./api";

export type Transaction = {
  id: string | number;
  uid?: string;
  amount: number;
  from?: string;
  to?: string;
  method?: string;
  type?: string;
  status: string;
  transaction_id?: string;
  investment_id?: string;
  plan_id?: string;
  plan_name?: string;
  createdAt: string | number;
  updatedAt?: string | number;
};

type TransactionListResponse = {
  data: Transaction[];
};

type TransactionResponse = {
  data: Transaction;
};

export async function getTransactions(): Promise<Transaction[]> {
  const response = await api.get("/transactions");

  return unwrapData<TransactionListResponse>(
    response.data as TransactionListResponse
  ).data;
}

export async function getTransaction(
  id: string | number
): Promise<Transaction> {
  const response = await api.get(`/transactions/${id}`);

  return unwrapData<TransactionResponse>(
    response.data as TransactionResponse
  ).data;
}