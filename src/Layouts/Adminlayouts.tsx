import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../Admin/sidebar";
import { adminNav } from "../config/config";

/** Sidebar + <Outlet />. No header on desktop; phones get a small menu button to open the sidebar. */
export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-paper lg:pl-64">
      <DashboardSidebar open={menuOpen} onClose={closeMenu} items={adminNav} label="Admin" />

      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="sidebar"
        className="m-3 rounded-md p-2 text-apex-900 lg:hidden"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-2 sm:px-8 lg:pt-10">
        <Outlet />
      </main>
    </div>
  );
}