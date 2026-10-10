
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import TextField from "../Components/Textfield";
import SubmitButton from "../Components/SubmitButton";
import { withdrawalMethods } from "../data/paymentmethod";
import { money } from "../lib/format";
import type { Transaction } from "../types/planType";
import {
  Banner,
  Card,
  PageHeader,
  StatCard,
  TransactionTable,
} from "../Components/Ui";

import {
  getWithdrawals,
  createWithdrawal,
  type Withdrawal as WithdrawalType,
} from "../lib/withdrawals";

import { getProfile } from "../lib/auth";

const MIN_WITHDRAWAL = 50;

type Errors = {
  amount?: string;
  bankName?: string;
  accountName?: string;
  bankAccount?: string;
  walletAddress?: string;
};

type ProfileBalance = {
  balance?: number | string;
  balances?: {
    balance?: number | string;
  };
};

type WithdrawalHistoryItem = {
  id: string;
  reference: string;
  amount: number;
  type: "withdrawal";
  method: string;
  status: Transaction["status"];
  date: string;
};

function formatDate(value: string | number): string {
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

function normalizeStatus(
  status: string
): Transaction["status"] {
  const value = status.toLowerCase();

  if (
    ["completed", "success", "successful", "confirmed"].includes(value)
  ) {
    return "completed";
  }

  if (value === "failed" || value === "error") {
    // Use a status supported by your existing Transaction type.
    return "pending";
  }

  if (value === "reversed" || value === "refunded") {
    return "pending";
  }

  return "pending";
}

function toHistoryItem(
  withdrawal: WithdrawalType
): WithdrawalHistoryItem {
  return {
    id: String(withdrawal.id),
    reference: String(withdrawal.id),
    amount: Number(withdrawal.amount),
    type: "withdrawal",
    method: withdrawal.method,
    status: normalizeStatus(withdrawal.status),
    date: formatDate(withdrawal.createdAt),
  };
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
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

function getAvailableBalance(profile: unknown): number {
  if (!profile || typeof profile !== "object") {
    return 0;
  }

  const data = profile as ProfileBalance;
  const value = data.balance ?? data.balances?.balance ?? 0;
  const balance = Number(value);

  return Number.isFinite(balance) && balance >= 0 ? balance : 0;
}

export default function Withdrawal() {
  const [methodId, setMethodId] = useState(withdrawalMethods[0].id);

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<WithdrawalType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const method =
    withdrawalMethods.find((item) => item.id === methodId) ??
    withdrawalMethods[0];

  const isBank = method.id.toLowerCase() === "bank";

  const loadWithdrawalData = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError("");

    try {
      const [profile, withdrawalData] = await Promise.all([
        getProfile(),
        getWithdrawals(),
      ]);

      setBalance(getAvailableBalance(profile));
      setWithdrawals(withdrawalData);
    } catch (error) {
      console.error("Failed to load withdrawal data:", error);
      setHistoryError(getErrorMessage(error));
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadWithdrawalData();
  }, [loadWithdrawalData]);

  const withdrawalHistory: WithdrawalHistoryItem[] = withdrawals.map(
    toHistoryItem
  );

  const pendingWithdrawals = withdrawals
    .filter((item) => normalizeStatus(item.status) === "pending")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitted(false);
    setFormError("");

    const n = Number(amount);
    const found: Errors = {};

    if (!amount.trim() || !Number.isFinite(n) || n < MIN_WITHDRAWAL) {
      found.amount = `The minimum withdrawal is ${money(MIN_WITHDRAWAL)}.`;
    } else if (n > balance) {
      found.amount = `You only have ${money(balance)} available.`;
    }

    if (isBank) {
      if (!bankName.trim()) {
        found.bankName = "Enter your bank name.";
      }

      if (!accountName.trim()) {
        found.accountName = "Enter the account holder's name.";
      }

      if (!bankAccount.trim()) {
        found.bankAccount = "Enter your bank account number.";
      }
    } else if (walletAddress.trim().length < 8) {
      found.walletAddress = "Enter a valid wallet address.";
    }

    setErrors(found);

    if (Object.keys(found).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const selectedMethod = isBank
        ? "BANK"
        : method.id.toUpperCase();

      await createWithdrawal({
        amount: n,
        method: selectedMethod,
        to: isBank
          ? `${bankName.trim()} - ${accountName.trim()} - ${bankAccount.trim()}`
          : walletAddress.trim(),

        ...(isBank
          ? {
              bankName: bankName.trim(),
              accountName: accountName.trim(),
              bankAccount: bankAccount.trim(),
              ...(routingNumber.trim()
                ? { routingNumber: routingNumber.trim() }
                : {}),
              ...(emailAddress.trim()
                ? { emailAddress: emailAddress.trim() }
                : {}),
            }
          : {
              walletAddress: walletAddress.trim(),
            }),
      });

      setSubmitted(true);
      setAmount("");
      setBankName("");
      setAccountName("");
      setBankAccount("");
      setRoutingNumber("");
      setEmailAddress("");
      setWalletAddress("");
      setErrors({});

      await loadWithdrawalData();
    } catch (error) {
      console.error("Failed to create withdrawal:", error);
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Withdrawal"
        description="Request a payout to your bank account or crypto wallet. Requests are reviewed before they're sent."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          accent
          label="Available to withdraw"
          value={money(balance)}
        />

        <StatCard
          label="Pending withdrawals"
          value={money(pendingWithdrawals)}
          hint="Based on your withdrawal history"
        />
      </div>

      {submitted && (
        <Banner tone="success">
          Your withdrawal request has been submitted successfully.
          We'll email you when there's an update.
        </Banner>
      )}

      {formError && <Banner tone="error">{formError}</Banner>}

      <Card>
        {balance < MIN_WITHDRAWAL && !loadingHistory ? (
          <p className="text-muted">
            You need at least {money(MIN_WITHDRAWAL)} available to withdraw.{" "}
            <Link
              to="/dashboard/deposit"
              className="font-semibold text-apex-700 underline underline-offset-4"
            >
              Make a deposit
            </Link>
            .
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            className="mx-auto max-w-lg space-y-6"
          >
            <fieldset>
              <legend className="text-sm font-medium text-ink">
                Send to
              </legend>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {withdrawalMethods.map((item) => (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium has-focus-visible:ring-2 has-focus-visible:ring-apex-500/40 ${
                      item.id === methodId
                        ? "border-apex-500 bg-apex-50"
                        : "border-apex-200 hover:bg-apex-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={item.id}
                      checked={item.id === methodId}
                      onChange={() => {
                        setMethodId(item.id);
                        setErrors({});
                        setFormError("");
                        setSubmitted(false);
                      }}
                      className="accent-apex-600"
                    />

                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <TextField
                label={`Amount (USD, minimum ${money(MIN_WITHDRAWAL)})`}
                name="amount"
                inputMode="decimal"
                placeholder="50"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((previous) => ({
                    ...previous,
                    amount: undefined,
                  }));
                  setSubmitted(false);
                }}
                error={errors.amount}
              />

              <button
                type="button"
                onClick={() => {
                  setAmount(String(balance));
                  setErrors((previous) => ({
                    ...previous,
                    amount: undefined,
                  }));
                }}
                disabled={balance < MIN_WITHDRAWAL}
                className="mt-1.5 text-sm font-semibold text-apex-700 underline underline-offset-4 disabled:opacity-50"
              >
                Withdraw everything ({money(balance)})
              </button>
            </div>

            {isBank ? (
              <>
                <TextField
                  label="Bank name"
                  name="bankName"
                  placeholder="Enter your bank name"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      bankName: undefined,
                    }));
                  }}
                  error={errors.bankName}
                />

                <TextField
                  label="Account holder name"
                  name="accountName"
                  placeholder="Name registered to the account"
                  value={accountName}
                  onChange={(e) => {
                    setAccountName(e.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      accountName: undefined,
                    }));
                  }}
                  error={errors.accountName}
                />

                <TextField
                  label="Bank account number"
                  name="bankAccount"
                  placeholder="Enter your account number"
                  value={bankAccount}
                  onChange={(e) => {
                    setBankAccount(e.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      bankAccount: undefined,
                    }));
                  }}
                  error={errors.bankAccount}
                />

                <TextField
                  label="Routing number (optional)"
                  name="routingNumber"
                  placeholder="Enter routing number if required"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                />

                <TextField
                  label="Email address (optional)"
                  name="emailAddress"
                  placeholder="Enter your email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </>
            ) : (
              <TextField
                label={method.destinationLabel}
                name="walletAddress"
                placeholder={method.destinationHint}
                value={walletAddress}
                onChange={(e) => {
                  setWalletAddress(e.target.value);
                  setErrors((previous) => ({
                    ...previous,
                    walletAddress: undefined,
                  }));
                }}
                error={errors.walletAddress}
              />
            )}

            <SubmitButton loading={loading} loadingText="Submitting...">
              Request withdrawal
            </SubmitButton>
          </form>
        )}
      </Card>

      <Card className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-apex-950">
            Withdrawal history
          </h2>

          <button
            type="button"
            onClick={() => void loadWithdrawalData()}
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
              onClick={() => void loadWithdrawalData()}
              className="text-sm font-medium text-apex-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {loadingHistory ? (
          <p className="py-6 text-center text-sm text-muted">
            Loading withdrawal history...
          </p>
        ) : withdrawalHistory.length > 0 ? (
          <TransactionTable items={withdrawalHistory} />
        ) : (
          <p className="py-6 text-center text-sm text-muted">
            No withdrawals found.
          </p>
        )}
      </Card>
    </>
  );
}
