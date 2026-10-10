import type { NavItem } from "../Admin/sidebar";

// The value your backend stores in user.type for admins. This only controls what the UI shows;
// your server's checkAdmin middleware is what actually protects the data.
export const ADMIN_TYPE = "admin";

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", end: true, icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { to: "/admin/deposits", label: "All deposits", end: true, group: "Deposits", icon: "M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" },
  { to: "/admin/deposits/pending", label: "Pending deposits", group: "Deposits", icon: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { to: "/admin/withdrawals", label: "All withdrawals", end: true, group: "Withdrawals", icon: "M12 20V8m0 0l-4 4m4-4l4 4M5 4h14" },
  { to: "/admin/withdrawals/pending", label: "Pending withdrawals", group: "Withdrawals", icon: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { to: "/admin/investments", label: "Investments", group: "Platform", icon: "M4 18l5-6 4 3 7-9M15 6h5v5" },
  { to: "/admin/earnings", label: "Earnings", group: "Platform", icon: "M12 5v14M9 8.5h4.5a2 2 0 010 4H10a2 2 0 000 4h5" },
  { to: "/admin/plans", label: "Plans", group: "Platform", icon: "M4 6h16M4 12h16M4 18h10" },
];