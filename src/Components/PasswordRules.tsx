import { passwordRules } from "../lib/validation";

export default function PasswordRules({ value }: { value: string }) {
  return (
    <ul className="mt-2 space-y-1 text-sm" aria-label="Password requirements">
      {passwordRules.map((r) => {
        const ok = r.test(value);
        return (
          <li key={r.id} className={`flex items-center gap-2 ${ok ? "text-apex-700" : "text-muted"}`}>
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
              {ok ? (
                <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <circle cx="10" cy="10" r="3" fill="currentColor" />
              )}
            </svg>
            <span>
              {r.label}
              <span className="sr-only">{ok ? " (done)" : " (not yet)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}