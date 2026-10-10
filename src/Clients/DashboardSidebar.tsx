import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "../Components/logo";

import { initials } from "../lib/format";

const nav = [
  { to: "/user/dashboard", label: "Overview", end: true, icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { to: "/user/deposit", label: "Deposit", icon: "M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" },
  { to: "/user/withdrawal", label: "Withdrawal", icon: "M12 20V8m0 0l-4 4m4-4l4 4M5 4h14" },
  { to: "/user/plans", label: "Plans", icon: "M4 6h16M4 12h16M4 18h10" },
  { to: "/user/transaction", label: "Transactions", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { to: "/user/investments", label: "Investments", icon: "M4 18l5-6 4 3 7-9M15 6h5v5" },
  { to: "/user/earnings", label: "Earnings", icon: "M12 5v14M9 8.5h4.5a2 2 0 010 4H10a2 2 0 000 4h5" },
  { to: "/user/settings", label: "Settings", icon: "M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" },
];

type Props = { open: boolean; onClose: () => void };

export default function DashboardSidebar({ open, onClose }: Props) {
  // const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const name =  "Account";

  // Close the mobile drawer after navigating
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-apex-950/50 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-apex-900 text-apex-200 transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-5 pb-6 pt-6">
          <Link to="/" aria-label="Trust Signal Trade home"><Logo variant="light" /></Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Dashboard">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-2 left-0 w-1 rounded-r bg-gold-400" aria-hidden="true" />}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.icon} /></svg>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-apex-950" aria-hidden="true">{initials(name)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{"Your account"}</p>
              <p className="truncate text-xs">test@example.com</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { navigate("/auth/login", { replace: true }); }}
            className="mt-3 w-full rounded-lg border border-white/15 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}