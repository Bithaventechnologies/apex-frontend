import { useEffect, useRef } from "react";

type Props = { fullName: string; plan: string; onContinue: () => void };

const planNames: Record<string, string> = { starter: "Starter", pro: "Pro", elite: "Elite" };

export default function WelcomeModal({ fullName, plan, onContinue }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  useEffect(() => {
    buttonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onContinue();
      if (e.key === "Tab") e.preventDefault(); // single focusable control: keep focus inside the dialog
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-apex-950/70 px-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        aria-describedby="welcome-body"
        className="animate-pop w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-apex-100 text-apex-600">
          <svg width="28" height="28" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 id="welcome-title" className="mt-5 text-2xl font-bold text-apex-950">
          Welcome to Apex Signal Trade, {firstName}
        </h2>
        <p id="welcome-body" className="mt-3 text-muted">
          Your {planNames[plan] ?? "Starter"} account is ready. Fund it when you're ready, and your first signals will appear on your
          dashboard each morning.
        </p>

        <ol className="mt-6 space-y-2 rounded-xl bg-apex-50 p-4 text-left text-sm text-ink">
          <li>1. Check your email and confirm your address.</li>
          <li>2. Add funds to your account.</li>
          <li>3. Read today's signals before you place a trade.</li>
        </ol>

        <button
          ref={buttonRef}
          type="button"
          onClick={onContinue}
          className="mt-7 w-full rounded-lg bg-gold-400 py-3 font-semibold text-apex-950 transition-colors hover:bg-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apex-900"
        >
          Go to my dashboard
        </button>
      </div>
    </div>
  );
}