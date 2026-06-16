import { db } from "@/db";
import { links, analytics } from "@/db/schema";
import { desc, count, sql } from "drizzle-orm";
import Link from "next/link";
import { ClickSparkline } from "./_components/ClickSparkline";
import "./overview.css";

// ── Data fetching (all server-side, no API routes needed) ──────────────────

async function getStats() {
  const [totalLinks] = await db
    .select({ count: count() })
    .from(links);

  const [totalClicks] = await db
    .select({ count: count() })
    .from(analytics);

  const [uniqueClicks] = await db
    .select({ count: sql<number>`count(distinct ${analytics.visitorHash})` })
    .from(analytics);

  // Clicks in the last 7 days grouped by day
  const clicksByDay = await db
    .select({
      day: sql<string>`date_trunc('day', ${analytics.createdAt})::date::text`,
      clicks: count(),
    })
    .from(analytics)
    .where(sql`${analytics.createdAt} > now() - interval '7 days'`)
    .groupBy(sql`date_trunc('day', ${analytics.createdAt})`)
    .orderBy(sql`date_trunc('day', ${analytics.createdAt})`);

  return {
    totalLinks: totalLinks.count,
    totalClicks: totalClicks.count,
    uniqueClicks: uniqueClicks.count,
    clicksByDay,
  };
}

async function getRecentLinks() {
  return db
    .select()
    .from(links)
    .orderBy(desc(links.createdAt))
    .limit(8);
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [stats, recentLinks] = await Promise.all([getStats(), getRecentLinks()]);

  const now = new Date();

  return (
    <div className="overview">
      {/* Header */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Overview</h1>
          <p className="overview-sub">Your links at a glance</p>
        </div>
        <Link href="/dashboard/links" className="btn-primary">
          + New link
        </Link>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard label="Total links" value={stats.totalLinks} />
        <StatCard label="Total clicks" value={stats.totalClicks} />
        <StatCard
          label="Unique visitors"
          value={stats.uniqueClicks}
          note="by hashed fingerprint"
        />
      </div>

      {/* 7-day sparkline */}
      <div className="chart-card">
        <div className="chart-card-header">
          <span className="chart-title">Clicks — last 7 days</span>
        </div>
        <ClickSparkline data={stats.clicksByDay} />
      </div>

      {/* Recent links table */}
      <div className="recent-section">
        <div className="recent-header">
          <span className="section-label">Recent links</span>
          <Link href="/dashboard/links" className="see-all">
            See all →
          </Link>
        </div>

        {recentLinks.length === 0 ? (
          <div className="empty-state">
            <p>No links yet.</p>
            <Link href="/dashboard/links" className="btn-primary">
              Create your first link
            </Link>
          </div>
        ) : (
          <table className="links-table">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentLinks.map((link) => {
                const status = getLinkStatus(link, now);
                return (
                  <tr key={link.id}>
                    <td>
                      <span className="slug-chip">/{link.slug}</span>
                    </td>
                    <td>
                      <span className="dest-url" title={link.longUrl}>
                        {truncate(link.longUrl, 48)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${status.type}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatDate(link.createdAt)}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/links/${link.id}`}
                        className="row-action"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value.toLocaleString()}</span>
      {note && <span className="stat-note">{note}</span>}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getLinkStatus(
  link: { isActive: boolean; goLiveAt: Date | null; expiresAt: Date | null },
  now: Date
): { type: "active" | "scheduled" | "expired" | "inactive"; label: string } {
  if (!link.isActive) return { type: "inactive", label: "Inactive" };
  if (link.expiresAt && link.expiresAt < now) return { type: "expired", label: "Expired" };
  if (link.goLiveAt && link.goLiveAt > now) return { type: "scheduled", label: "Scheduled" };
  return { type: "active", label: "Active" };
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(d));
}