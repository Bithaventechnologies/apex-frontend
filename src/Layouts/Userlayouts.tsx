import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../Clients/DashboardHeader";
import DashboardSidebar from "../Clients/DashboardSidebar";

/**
 * Sidebar + Header + <Outlet />.
 * Each dashboard page (Overview, Deposit, ...) is a child route that renders inside the Outlet.
 */
export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-paper lg:pl-64">
      <DashboardSidebar open={menuOpen} onClose={closeMenu} />

      <div className="flex min-h-screen flex-col">
        <DashboardHeader menuOpen={menuOpen} onMenuClick={() => setMenuOpen(true)} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}