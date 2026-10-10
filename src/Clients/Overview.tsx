
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { money, } from "../lib/format";
import { getProfile } from "../lib/auth";
import { getTransactions, type Transaction } from "../lib/transactions";
import { apiErrorMessage } from "../lib/api";

import {
  Card,
  PageHeader,
  StatCard,
} from "../Components/Ui";
import { shortDate } from "../lib/format";

type Profile = {
  id: string | number;
  name?: string;
  username?: string;
  email?: string;
  balance?: number | string;
  btcBal?: number | string;
  usdtBal?: number | string;
  ethBal?: number | string;
  solBal?: number | string;
  verified?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  type?: string;
};

function numeric(value?: number | string): number {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
}

function cryptoAmount(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 8,
  });
}

export default function Overview() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionError, setTransactionError] = useState("");
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoadingProfile(true);
        setProfileError("");

        const response = await getProfile();

        if (isMounted) {
          setProfile(response);
        }
      } catch (error) {
        if (isMounted) {
          setProfileError(
            error instanceof Error
              ? error.message
              : "Unable to load your profile."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getTransactions().then((items) => {
      if (active) setTransactions([...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
    }).catch((error: unknown) => {
      if (active) setTransactionError(apiErrorMessage(error));
    }).finally(() => { if (active) setLoadingTransactions(false); });
    return () => { active = false; };
  }, []);

  const firstName =
    profile?.name?.trim().split(/\s+/)[0] ||
    profile?.username ||
    "";

  const balance = numeric(profile?.balance);
  const btcBalance = numeric(profile?.btcBal);
  const usdtBalance = numeric(profile?.usdtBal);
  const ethBalance = numeric(profile?.ethBal);
  const solBalance = numeric(profile?.solBal);

  const emailVerified =
    profile?.emailVerified ?? profile?.verified ?? false;

  return (
    <>
      <PageHeader
        title={
          loadingProfile
            ? "Welcome back"
            : firstName
              ? `Welcome back, ${firstName}`
              : "Welcome back"
        }
        description="Here's an overview of your account and portfolio."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/user/deposit"
              className="rounded-lg bg-apex-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-apex-700"
            >
              Deposit
            </Link>

            <Link
              to="/user/withdrawal"
              className="rounded-lg border border-apex-200 bg-white px-4 py-2.5 text-sm font-semibold text-apex-900 hover:bg-apex-50"
            >
              Withdraw
            </Link>
          </div>
        }
      />

      {profileError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {profileError}
        </div>
      )}

      {/* Main account summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          accent
          label="Available balance"
          value={loadingProfile ? "Loading..." : money(balance)}
          hint="Your main account balance"
        />

        <StatCard
          label="Account status"
          value={
            loadingProfile
              ? "Loading..."
              : emailVerified
                ? "Verified"
                : "Unverified"
          }
          hint="Email verification status"
        />

        <StatCard
          label="Account type"
          value={
            loadingProfile
              ? "Loading..."
              : profile?.type === "admin"
                ? "Admin"
                : "Personal"
          }
          hint="Your account category"
        />
      </div>

      {/* Crypto portfolio */}
      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-apex-950">
              Crypto balances
            </h2>
            <p className="mt-1 text-sm text-muted">
              Your current cryptocurrency holdings.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              name: "Bitcoin",
              symbol: "BTC",
              amount: btcBalance,
              color: "bg-orange-50 text-orange-700",
            },
            {
              name: "Tether",
              symbol: "USDT",
              amount: usdtBalance,
              color: "bg-emerald-50 text-emerald-700",
            },
            {
              name: "Ethereum",
              symbol: "ETH",
              amount: ethBalance,
              color: "bg-indigo-50 text-indigo-700",
            },
            {
              name: "Solana",
              symbol: "SOL",
              amount: solBalance,
              color: "bg-purple-50 text-purple-700",
            },
          ].map((coin) => (
            <div
              key={coin.symbol}
              className="rounded-xl border border-apex-100 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted">
                  {coin.name}
                </span>

                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${coin.color}`}
                >
                  {coin.symbol}
                </span>
              </div>

              <p className="mt-3 break-all text-xl font-bold text-apex-950">
                {loadingProfile
                  ? "Loading..."
                  : cryptoAmount(coin.amount)}
              </p>

              <p className="mt-1 text-xs text-muted">
                {coin.symbol} balance
              </p>
            </div>
          ))}
        </div>
      </Card>

<Card className="mt-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-bold text-apex-950">
        Recent Transactions
      </h2>
      <p className="mt-1 text-sm text-muted">
        A quick look at your latest account activity.
      </p>
    </div>

    <Link
      to="/user/transactions"
      className="text-sm font-semibold text-apex-700 underline underline-offset-4 hover:text-apex-900"
    >
      View more
    </Link>
  </div>

  <div className="mt-5">
      {loadingTransactions ? <p className="py-8 text-center text-sm text-muted">Loading recent transactions…</p> : transactionError ? <p role="alert" className="py-8 text-center text-sm text-red-700">{transactionError}</p> : transactions.length === 0 && (
      <div className="py-8 text-center">
        <p className="font-semibold text-apex-950">
          No transactions yet
        </p>
        <p className="mt-1 text-sm text-muted">
          Your deposits, withdrawals and other transactions
          will appear here.
        </p>
        <Link
          to="/user/deposit"
          className="mt-4 inline-block text-sm font-semibold text-apex-700 underline underline-offset-4"
        >
          Make your first deposit
        </Link>
      </div>
    )}
    {!loadingTransactions && !transactionError && transactions.length > 0 && <div className="divide-y divide-apex-100">{transactions.map((tx) => <div key={tx.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="font-semibold capitalize text-apex-950">{tx.type || tx.method || "Transaction"}{tx.plan_name ? ` · ${tx.plan_name}` : ""}</p><p className="text-xs text-muted">{Number.isNaN(new Date(tx.createdAt).getTime()) ? "Date unavailable" : shortDate(new Date(tx.createdAt).toISOString())}</p></div><div className="text-right"><p className="font-semibold">{money(Number(tx.amount))}</p><p className="text-xs capitalize text-muted">{tx.status}</p></div></div>)}</div>}
  </div>
</Card>


    
    </>
  );
}

