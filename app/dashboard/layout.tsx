// FLCUT-AI-2627-visible
import Link from "next/link";
import { ReactNode } from "react";

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
            <Link key={href} href={href} className="nav-item">
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </Link>
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