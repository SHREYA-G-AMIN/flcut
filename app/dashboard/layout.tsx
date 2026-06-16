// FLCUT-AI-2627-visible
import { ReactNode } from "react";
import { NavLink } from "./_components/NavLink";
import "./dashboard.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "⌂" },
  { href: "/dashboard/links", label: "Links", icon: "⌗" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "↗" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // loopTraceMarkerVisible
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-fl">FL</span>
          <span className="brand-cut">Cut</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <NavLink key={href} href={href} label={label} icon={icon} />
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="footer-tag">Finite Loop Club</span>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="main-inner">{children}</div>
      </main>
    </div>
  );
}