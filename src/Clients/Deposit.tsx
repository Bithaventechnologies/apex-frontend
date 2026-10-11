/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type FormEvent } from "react";
import TextField from "../Components/Textfield";
import SubmitButton from "../Components/SubmitButton";
import { money } from "../lib/format";
import { getProfile } from "../lib/auth";
import type { Transaction } from "../types/planType";
import {
  Banner,
  Card,
  CopyButton,
  PageHeader,
  TransactionTable,
} from "../Components/Ui";
import {
  getDeposits,
  createDeposit,
  type Deposit as DepositType,
} from "../lib/deposits";
import { getActiveGateways, type Gateway } from "../lib/gateways";

const MIN_DEPOSIT = 250;

// The deposits API currently accepts these currencies only.
const SUPPORTED_CURRENCIES = ["BTC", "SOL", "ETH"] as const;
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const isSupported = (currency: string): currency is SupportedCurrency =>
  (SUPPORTED_CURRENCIES as readonly string[]).includes(currency);

type DepositHistoryItem = {
  id: string;
  reference: string;
  amount: number;
  type: "deposit";
  method: string;
  status: Transaction["status"];
  date: string;
};

type Profile = {
  id?: string | number;
  uid?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

function formatDepositDate(value: string | number): string {
  const date =
    typeof value === "number"
      ? new Date(value < 1_000_000_000_000 ? value * 1000 : value)
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeStatus(status: string): Transaction["status"] {
  const value = status.toLowerCase();

  if (
    ["completed", "success", "successful", "confirmed"].includes(value)
  ) {
    return "completed";
  }

  return "pending";
}

function toHistoryItem(deposit: DepositType): DepositHistoryItem {
  return {
    id: String(deposit.id),
    reference: String(deposit.id),
    amount: Number(deposit.amount),
    type: "deposit",
    method: deposit.method,
    status: normalizeStatus(deposit.status),
    date: formatDepositDate(deposit.createdAt),
  };
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      }
    ).response;

    return (
      response?.data?.message ||
      response?.data?.error ||
      "Something went wrong. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function Deposit() {
  // Payment gateways (wallets the admin has made active)
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [gatewayId, setGatewayId] = useState("");
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [gatewayError, setGatewayError] = useState("");

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [deposits, setDeposits] = useState<DepositType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const gateway = gateways.find((g) => String(g.id) === gatewayId) ?? null;

  async function loadGateways() {
    setLoadingGateways(true);
    setGatewayError("");

    try {
      const list = await getActiveGateways();
      setGateways(list);
      setGatewayId((current) =>
        list.some((g) => String(g.id) === current)
          ? current
          : String(list[0]?.id ?? "")
      );
    } catch (err) {
      console.error("Failed to fetch gateways:", err);
      setGatewayError(getErrorMessage(err));
    } finally {
      setLoadingGateways(false);
    }
  }

  async function loadDeposits() {
    setLoadingHistory(true);
    setHistoryError("");

    try {
      const result = await getDeposits();
      setDeposits(result);
    } catch (err) {
      console.error("Failed to fetch deposits:", err);
      setHistoryError(getErrorMessage(err));
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    void loadGateways();
    void loadDeposits();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!gateway) {
      setError("Choose a payment method first.");
      return;
    }

    const n = Number(amount);

    if (!amount.trim() || !Number.isFinite(n) || n < MIN_DEPOSIT) {
      setError(`The minimum deposit is ${money(MIN_DEPOSIT)}.`);
      return;
    }

    // The deposit API takes the currency (BTC / SOL / ETH), not the gateway id.
    if (!isSupported(gateway.currency)) {
      setError(
        `${gateway.currency} deposits aren't available yet. Choose BTC, ETH or SOL.`
      );
      return;
    }

    setError("");
    setDone(false);
    setSubmitting(true);

    try {
      // Get the currently authenticated user's profile.
      const profile = (await getProfile()) as Profile;

      // Use the user's identity, not their crypto wallet address.
      const from =
        profile.email?.trim() ||
        [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
        profile.name?.trim();

      if (!from) {
        throw new Error(
          "Your account information could not be retrieved. Please log in again."
        );
      }

      await createDeposit({
        amount: n,
        method: gateway.currency,
        from,
      });

      setDone(true);
      setAmount("");

      await loadDeposits();
    } catch (err) {
      console.error("Failed to create deposit:", err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const depositHistory: DepositHistoryItem[] = deposits.map(toHistoryItem);

  return (
    <>
      <PageHeader
        title="Deposit"
        description="Send money using one of the methods below, then submit your deposit details so we can match your payment."
      />

      {done && (
        <Banner tone="success">
          Your deposit request has been submitted successfully. Your balance
          will update once the payment is confirmed.
        </Banner>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* DEPOSIT FORM */}
        <Card>
          {loadingGateways ? (
            <p className="py-6 text-center text-sm text-muted">
              Loading payment methods...
            </p>
          ) : gatewayError ? (
            <div className="space-y-2 py-4">
              <p className="text-sm text-red-600">{gatewayError}</p>
              <button
                type="button"
                onClick={() => void loadGateways()}
                className="text-sm font-medium text-apex-700 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : gateways.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No payment methods are available right now. Please check back
              soon or contact support.
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              <fieldset>
                <legend className="text-sm font-medium text-ink">
                  Payment method
                </legend>

                <div className="mt-2 grid gap-2">
                  {gateways.map((item) => (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-apex-500/40 ${
                        String(item.id) === gatewayId
                          ? "border-apex-500 bg-apex-50"
                          : "border-apex-200 hover:bg-apex-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={item.id}
                        checked={String(item.id) === gatewayId}
                        onChange={() => {
                          setGatewayId(String(item.id));
                          setError("");
                          setDone(false);
                        }}
                        className="accent-apex-600"
                      />
                      <span>
                        {item.name}
                        <span className="ml-2 font-normal text-muted">
                          {item.currency} · {item.network}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <TextField
                label={`Amount (USD, minimum ${money(MIN_DEPOSIT)})`}
                name="amount"
                inputMode="decimal"
                placeholder="500"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                  setDone(false);
                }}
                error={error}
              />

              <div className="rounded-lg border border-apex-200 bg-apex-50 px-4 py-3">
                <p className="text-sm font-medium text-apex-950">
                  Sender information
                </p>
                <p className="mt-1 text-sm text-muted">
                  Your account email will automatically be attached to this
                  deposit request.
                </p>
              </div>

              <SubmitButton
                loading={submitting}
                loadingText="Submitting deposit..."
              >
                I've made this payment
              </SubmitButton>
            </form>
          )}
        </Card>

        {/* PAYMENT INSTRUCTIONS (from the selected gateway) */}
        <Card>
          {gateway ? (
            <>
              <h2 className="text-lg font-bold text-apex-950">
                How to pay with {gateway.name}
              </h2>

              <p className="mt-1 text-sm text-muted">
                {gateway.instructions ||
                  `Send only ${gateway.currency} on the ${gateway.network} network. Other coins or networks will be lost.`}
              </p>

              <dl className="mt-5 space-y-4">
                <div className="rounded-lg bg-apex-50 px-4 py-3">
                  <dt className="text-xs text-muted">Currency and network</dt>
                  <dd className="mt-0.5 font-semibold text-apex-950">
                    {gateway.currency} · {gateway.network}
                  </dd>
                </div>

                <div className="rounded-lg bg-apex-50 px-4 py-3">
                  <dt className="text-xs text-muted">Wallet address</dt>
                  <dd className="mt-0.5 flex items-center justify-between gap-3">
                    <span className="break-all font-semibold text-apex-950">
                      {gateway.address}
                    </span>
                    <CopyButton value={gateway.address} />
                  </dd>
                </div>
              </dl>

              {gateway.qrCode && (
                <img
                  src={gateway.qrCode}
                  alt={`${gateway.currency} wallet QR code`}
                  className="mx-auto mt-5 h-44 w-44 rounded-lg border border-apex-100 object-contain"
                />
              )}
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted">
              Payment instructions will appear here once a method is available.
            </p>
          )}
        </Card>
      </div>

      {/* DEPOSIT HISTORY */}
      <Card className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-apex-950">
            Deposit history
          </h2>

          <button
            type="button"
            onClick={() => void loadDeposits()}
            disabled={loadingHistory}
            className="text-sm font-medium text-apex-700 hover:underline disabled:opacity-50"
          >
            {loadingHistory ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {historyError && (
          <div className="mb-3 space-y-2">
            <p className="text-sm text-red-600">{historyError}</p>

            <button
              type="button"
              onClick={() => void loadDeposits()}
              className="text-sm font-medium text-apex-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {loadingHistory ? (
          <p className="py-6 text-center text-sm text-muted">
            Loading deposit history...
          </p>
        ) : depositHistory.length > 0 ? (
          <TransactionTable items={depositHistory} />
        ) : (
          <p className="py-6 text-center text-sm text-muted">
            No deposits found.
          </p>
        )}
      </Card>
    </>
  );
}