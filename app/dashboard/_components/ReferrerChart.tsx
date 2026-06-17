"use client";

type Row = { referrer: string | null; clicks: number };

export function ReferrerChart({ data, totalClicks }: { data: Row[]; totalClicks?: number }) {
  const total = totalClicks && totalClicks > 0 ? totalClicks : data.reduce((s, r) => s + r.clicks, 0);
  const max   = data[0]?.clicks ?? 1;

  return (
    <div className="bar-list">
      {data.map((row, i) => {
        const label = row.referrer || "Direct / unknown";
        const pct   = total > 0 ? Math.round((row.clicks / total) * 100) : 0;
        const width = max > 0 ? Math.round((row.clicks / max) * 100) : 0;

        return (
          <div key={i} className="bar-row">
            <span className="bar-label" title={label}>
              {label.length > 36 ? label.slice(0, 36) + "…" : label}
            </span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${width}%` }} />
            </div>
            <span className="bar-pct">{pct}%</span>
            <span className="bar-count">{row.clicks.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}