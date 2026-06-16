import { db } from "@/db";
import { links, analytics } from "@/db/schema";
import { count, sql, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ClickTimeline } from "../_components/ClickTimeLine";
import { ReferrerChart } from "../_components/ReferrerChart";
import { DeviceChart } from "../_components/DeviceChart";
import "../overview.css";
import "../links/[id]/detail.css";

// Prevent cached outputs so stats update live
export const dynamic = "force-dynamic";

async function getGlobalAnalytics() {
  const [totalResult] = await db
    .select({ count: count() })
    .from(analytics);

  const [uniqueResult] = await db
    .select({ count: sql<number>`count(distinct ${analytics.visitorHash})` })
    .from(analytics);

  // Timeline clicks — last 30 days
  const timeline = await db
    .select({
      day: sql<string>`date_trunc('day', ${analytics.createdAt})::date::text`,
      clicks: count(),
    })
    .from(analytics)
    .where(sql`${analytics.createdAt} > now() - interval '30 days'`)
    .groupBy(sql`date_trunc('day', ${analytics.createdAt})`)
    .orderBy(sql`date_trunc('day', ${analytics.createdAt})`);

  // Top referrers across all links
  const referrers = await db
    .select({
      referrer: analytics.referrer,
      clicks: count(),
    })
    .from(analytics)
    .groupBy(analytics.referrer)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  // Devices distribution
  const devices = await db
    .select({
      device: analytics.device,
      clicks: count(),
    })
    .from(analytics)
    .groupBy(analytics.device)
    .orderBy(sql`count(*) desc`);

  // Popular links sorted by click counts
  const topLinks = await db
    .select({
      id: links.id,
      slug: links.slug,
      longUrl: links.longUrl,
      isActive: links.isActive,
      clicksCount: count(analytics.id),
    })
    .from(links)
    .leftJoin(analytics, eq(links.id, analytics.linkId))
    .groupBy(links.id, links.slug, links.longUrl, links.isActive)
    .orderBy(sql`count(${analytics.id}) desc`)
    .limit(6);

  return {
    totalClicks: totalResult.count,
    uniqueClicks: uniqueResult.count,
    timeline,
    referrers,
    devices,
    topLinks,
  };
}

export default async function AnalyticsDashboardPage() {
  const stats = await getGlobalAnalytics();

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="overview-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
        <div>
          <h1 className="overview-title">Global Analytics</h1>
          <p className="overview-sub">Comprehensive overview of traffic and referral metrics</p>
        </div>
      </div>

      {/* Ribbon Stats */}
      <div className="detail-stat-strip">
        <div className="detail-stat">
          <span className="detail-stat-value">
            {stats.totalClicks.toLocaleString()}
          </span>
          <span className="detail-stat-label">Total clicks</span>
        </div>
        <div className="detail-stat-divider" />
        <div className="detail-stat">
          <span className="detail-stat-value">
            {stats.uniqueClicks.toLocaleString()}
          </span>
          <span className="detail-stat-label">Unique visitors</span>
        </div>
        <div className="detail-stat-divider" />
        <div className="detail-stat">
          <span className="detail-stat-value">
            {stats.totalClicks > 0
              ? Math.round((stats.uniqueClicks / stats.totalClicks) * 100) + "%"
              : "—"}
          </span>
          <span className="detail-stat-label">Unique rate</span>
        </div>
      </div>

      {/* Over-time timeline graph */}
      <div className="detail-chart-card">
        <span className="detail-section-label">System traffic — last 30 days</span>
        <ClickTimeline data={stats.timeline} days={30} />
      </div>

      {/* Referrers + Devices charts split grid */}
      <div className="detail-bottom-grid">
        <div className="detail-chart-card">
          <span className="detail-section-label">Top referrers</span>
          {stats.referrers.length === 0 ? (
            <p className="detail-empty">No referrer data yet.</p>
          ) : (
            <ReferrerChart data={stats.referrers} totalClicks={stats.totalClicks} />
          )}
        </div>

        <div className="detail-chart-card">
          <span className="detail-section-label">Devices</span>
          {stats.devices.length === 0 ? (
            <p className="detail-empty">No device data yet.</p>
          ) : (
            <DeviceChart data={stats.devices} />
          )}
        </div>
      </div>

      {/* High popularity links list */}
      <div className="recent-section">
        <div className="recent-header">
          <span className="section-label">Most popular links</span>
        </div>

        {stats.topLinks.length === 0 ? (
          <div className="empty-state">
            <p>No links created yet.</p>
            <Link href="/dashboard/links" className="btn-primary">
              Create your first link
            </Link>
          </div>
        ) : (
          <div className="links-table-wrapper">
            <table className="links-table">
              <thead>
                <tr>
                  <th>Slug</th>
                  <th>Destination URL</th>
                  <th>Status</th>
                  <th>Total Clicks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.topLinks.map((link) => (
                  <tr key={link.id}>
                    <td>
                      <span className="slug-chip">/{link.slug}</span>
                    </td>
                    <td>
                      <span className="dest-url" title={link.longUrl}>
                        {link.longUrl}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          link.isActive ? "status-active" : "status-inactive"
                        }`}
                      >
                        {link.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="date-cell" style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                      {link.clicksCount.toLocaleString()}
                    </td>
                    <td>
                      <Link href={`/dashboard/links/${link.id}`} className="row-action">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
