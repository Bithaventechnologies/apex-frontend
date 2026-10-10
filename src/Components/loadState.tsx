import type { ReactNode } from "react";
import { Banner } from "./Ui";

type Props = { loading: boolean; error: string; hasData: boolean; onRetry: () => void; children: ReactNode };

export default function LoadState({ loading, error, hasData, onRetry, children }: Props) {
  if (error) {
    return (
      <div>
        <Banner tone="error">{error}</Banner>
        <button type="button" onClick={onRetry} className="rounded-lg border border-apex-200 bg-white px-4 py-2 text-sm font-semibold text-apex-900 hover:bg-apex-50">Try again</button>
      </div>
    );
  }
  if (loading && !hasData) {
    return (
      <div role="status" aria-busy="true" className="space-y-3">
        <span className="sr-only">Loading</span>
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-apex-100/70" />)}
      </div>
    );
  }
  return <>{children}</>;
}