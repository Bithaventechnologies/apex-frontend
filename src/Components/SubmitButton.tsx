import type { ReactNode } from "react";

type Props = { loading: boolean; loadingText: string; children: ReactNode };

export default function SubmitButton({ loading, loadingText, children }: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-apex-600 py-3 font-semibold text-white transition-colors hover:bg-apex-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apex-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? loadingText : children}
    </button>
  );
}