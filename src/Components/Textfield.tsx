import { useId, useState, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export default function TextField({ label, error, id, type = "text", className = "", ...rest }: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={fieldId}
          type={isPassword && show ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={`w-full rounded-lg border bg-white px-4 py-3 text-ink outline-none transition-colors focus:ring-2 ${
            error ? "border-red-600 focus:ring-red-600/25" : "border-apex-200 focus:border-apex-500 focus:ring-apex-500/30"
          } ${isPassword ? "pr-16" : ""} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-pressed={show}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-apex-700 hover:text-apex-900"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} role="alert" className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}