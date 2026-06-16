import { db } from "@/db";
import { links, analytics } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClickTimeline } from "@/app/dashboard/_components/ClickTimeLine";
import { ReferrerChart } from "@/app/dashboard/_components/ReferrerChart";
import { DeviceChart } from "@/app/dashboard/_components/DeviceChart";
import { CopySlug } from "@/app/dashboard/_components/CopySlug";
import "../links.css";
import "./detail.css";

// ── Data fetching ──────────────────────────────────────────────────────────

async function getLinkWithStats(id: string) {
  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.id, id))
    .limit(1);

  if (!link) return null;

  const [totals] = await db
    .select({
      total: count(),
      unique: sql<number>`count(distinct ${analytics.visitorHash})`,
    })
    .from(analytics)
    .where(eq(analytics.linkId, id));

  // Clicks per day — last 14 days
  const timeline = await db
    .select({
      day: sql<string>`date_trunc('day', ${analytics.createdAt})::date::text`,
      clicks: count(),
    })
    .from(analytics)
    .where(
      sql`${analytics.linkId} = ${id}
      AND ${analytics.createdAt} > now() - interval '14 days'`
    )
    .groupBy(sql`date_trunc('day', ${analytics.createdAt})`)
    .orderBy(sql`date_trunc('day', ${analytics.createdAt})`);

  // Top referrers
  const referrers = await db
    .select({
      referrer: analytics.referrer,
      clicks: count(),
    })
    .from(analytics)
    .where(eq(analytics.linkId, id))
    .groupBy(analytics.referrer)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  // Device breakdown
  const devices = await db
    .select({
      device: analytics.device,
      clicks: count(),
    })
    .from(analytics)
    .where(eq(analytics.linkId, id))
    .groupBy(analytics.device)
    .orderBy(sql`count(*) desc`);

  return { link, totals, timeline, referrers, devices };
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLinkWithStats(id);

  if (!data) notFound();

  const { link, totals, timeline, referrers, devices } = data;
  const now = new Date();

  const status = getLinkStatus(link, now);
  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://flcut.finiteloop.club"}/${link.slug}`;

  return (
    <div className="detail-page">
      {/* Back */}
      <Link href="/dashboard/links" className="back-link">
        ← All links
      </Link>

      {/* Hero header */}
      <div className="detail-hero">
        <div className="detail-hero-left">
          <div className="detail-slug-row">
            <span className="detail-slug">/{link.slug}</span>
            <span className={`status-badge status-${status.type}`}>
              {status.label}
            </span>
          </div>
          <p className="detail-dest" title={link.longUrl}>
            {link.longUrl.length > 72
              ? link.longUrl.slice(0, 72) + "…"
              : link.longUrl}
          </p>
        </div>
        <CopySlug url={shortUrl} />
      </div>

      {/* Stat strip */}
      <div className="detail-stat-strip">
        <div className="detail-stat">
          <span className="detail-stat-value">
            {totals.total.toLocaleString()}
          </span>
          <span className="detail-stat-label">Total clicks</span>
        </div>
        <div className="detail-stat-divider" />
        <div className="detail-stat">
          <span className="detail-stat-value">
            {totals.unique.toLocaleString()}
          </span>
          <span className="detail-stat-label">Unique visitors</span>
        </div>
        <div className="detail-stat-divider" />
        <div className="detail-stat">
          <span className="detail-stat-value">
            {totals.total > 0
              ? Math.round((totals.unique / totals.total) * 100) + "%"
              : "—"}
          </span>
          <span className="detail-stat-label">Unique rate</span>
        </div>
        <div className="detail-stat-divider" />
        <div className="detail-stat">
          <span className="detail-stat-value">
            {link.expiresAt
              ? new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(link.expiresAt))
              : "Never"}
          </span>
          <span className="detail-stat-label">Expires</span>
        </div>
      </div>

      {/* Timeline chart */}
      <div className="detail-chart-card">
        <span className="detail-section-label">Clicks over time — last 14 days</span>
        <ClickTimeline data={timeline} days={14} />
      </div>

      {/* Bottom grid: referrers + devices */}
      <div className="detail-bottom-grid">
        <div className="detail-chart-card">
          <span className="detail-section-label">Top referrers</span>
          {referrers.length === 0 ? (
            <p className="detail-empty">No referrer data yet.</p>
          ) : (
            <ReferrerChart data={referrers} totalClicks={totals.total} />
          )}
        </div>

        <div className="detail-chart-card">
          <span className="detail-section-label">Devices</span>
          {devices.length === 0 ? (
            <p className="detail-empty">No device data yet.</p>
          ) : (
            <DeviceChart data={devices} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getLinkStatus(
  link: { isActive: boolean; goLiveAt: Date | null; expiresAt: Date | null },
  now: Date
) {
  if (!link.isActive) return { type: "inactive", label: "Inactive" };
  if (link.expiresAt && new Date(link.expiresAt) < now)
    return { type: "expired", label: "Expired" };
  if (link.goLiveAt && new Date(link.goLiveAt) > now)
    return { type: "scheduled", label: "Scheduled" };
  return { type: "active", label: "Active" };
}
