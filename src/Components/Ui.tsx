/* eslint-disable react-hooks/refs */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { money, shortDate } from "../lib/format";
import type { Transaction } from "../types/planType";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-apex-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-apex-100 bg-white p-5 sm:p-6 ${className}`}>{children}</section>;
}

export function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-apex-900 bg-apex-900 text-white" : "border-apex-100 bg-white"}`}>
      <p className={`text-sm ${accent ? "text-apex-200" : "text-muted"}`}>{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
      {hint && <p className={`mt-1 text-xs ${accent ? "text-apex-200" : "text-muted"}`}>{hint}</p>}
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  pending: "bg-gold-100 text-apex-950",
  completed: "bg-apex-100 text-apex-700",
  active: "bg-apex-100 text-apex-700",
  rejected: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badgeStyles[status] ?? "bg-apex-50 text-muted"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "pending" ? "bg-gold-500" : status === "rejected" ? "bg-red-600" : "bg-apex-500"}`} aria-hidden="true" />
      {status}
    </span>
  );
}

export function EmptyState({ title, body, to, cta }: { title: string; body: string; to?: string; cta?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-apex-200 px-6 py-10 text-center">
      <p className="font-semibold text-apex-950">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      {to && cta && (
        <Link to={to} className="mt-5 inline-block rounded-lg bg-apex-600 px-4 py-2 text-sm font-semibold text-white hover:bg-apex-700">{cta}</Link>
      )}
    </div>
  );
}

export function TransactionTable({ items, showType }: { items: Transaction[]; showType?: boolean }) {
  if (!items.length) return <EmptyState title="Nothing here yet" body="Your requests will show up here with their status." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-140 text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Reference</th>
            {showType && <th className="py-2 pr-4 font-medium">Type</th>}
            <th className="py-2 pr-4 font-medium">Method</th>
            <th className="py-2 pr-4 text-right font-medium">Amount</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-apex-100">
          {items.map((t) => (
            <tr key={t.id}>
              <td className="whitespace-nowrap py-3 pr-4">{shortDate(t.date)}</td>
              <td className="py-3 pr-4 font-mono text-xs">{t.reference}</td>
              {showType && <td className="py-3 pr-4 capitalize">{t.type}</td>}
              <td className="py-3 pr-4">{t.method}</td>
              <td className={`whitespace-nowrap py-3 pr-4 text-right font-semibold tabular-nums ${t.type === "deposit" ? "text-apex-700" : "text-ink"}`}>
                {t.type === "deposit" ? "+" : "−"}{money(t.amount)}
              </td>
              <td className="py-3"><StatusBadge status={t.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("input, select, textarea")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select, textarea");
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-apex-950/60 px-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} className="animate-pop w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold text-apex-950">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-m-1 rounded-md p-1 text-muted hover:text-apex-950">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function Banner({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`mb-5 rounded-lg border px-4 py-3 text-sm ${tone === "success" ? "border-apex-200 bg-apex-50 text-apex-900" : "border-red-200 bg-red-50 text-red-800"}`}>
      {children}
    </div>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="h-2 w-full overflow-hidden rounded-full bg-apex-100">
      <div className="h-full rounded-full bg-apex-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked: user can select the text instead */ }
  }
  return (
    <button type="button" onClick={copy} className="shrink-0 rounded-md border border-apex-200 px-2.5 py-1 text-xs font-semibold text-apex-700 hover:bg-apex-50">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}