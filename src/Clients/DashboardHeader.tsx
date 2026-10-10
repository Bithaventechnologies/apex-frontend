import { Link } from "react-router-dom";
import { money } from "../lib/format";
// import { useDashboard } from "../context/dashbaordContext";

type Props = { menuOpen: boolean; onMenuClick: () => void };

export default function DashboardHeader({ menuOpen, onMenuClick }: Props) {
  // const { balance } = useDashboard();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-apex-100 bg-paper/90 px-4 backdrop-blur sm:px-8">
      <button type="button" className="rounded-md p-2 text-apex-900 lg:hidden" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="sidebar" onClick={onMenuClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>

      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-muted">Available balance</p>
          <p className="font-display text-lg font-bold tabular-nums text-apex-950">
            {money(0)}
          </p>
        </div>
        <Link to="/user/deposit" className="hidden rounded-lg bg-apex-600 px-4 py-2 text-sm font-semibold text-white hover:bg-apex-700 sm:block">Deposit</Link>
      </div>
    </header>
  );
}