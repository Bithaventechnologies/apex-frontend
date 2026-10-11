import { api, unwrapData } from "./api";

export type Gateway = {
  id: number;
  name: string;
  currency: "BTC" | "ETH" | "SOL" | "USDT";
  network: string;
  address: string;
  qrCode: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt?: string | number;
};

type List<T> = {
  message?: string;
  data: T[];
};

// GET /api/gateway  (active gateways only, for signed-in users)
export async function getActiveGateways(): Promise<Gateway[]> {
  const response = await api.get("/gateway");

  return unwrapData<List<Gateway>>(
    response.data as List<Gateway>
  ).data;
}