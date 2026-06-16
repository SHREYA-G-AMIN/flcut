"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DayClick = { day: string; clicks: number };

// Fill in missing days so the chart always shows 7 bars
function fillWeek(data: DayClick[]): DayClick[] {
  const result: DayClick[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const match = data.find((r) => r.day.startsWith(key));
    result.push({
      day: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      clicks: match?.clicks ?? 0,
    });
  }
  return result;
}

export function ClickSparkline({ data }: { data: DayClick[] }) {
  const filled = fillWeek(data);

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={filled} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="flGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-muted)",
            borderRadius: 6,
            color: "var(--text-primary)",
            fontSize: 12,
          }}
          cursor={{ stroke: "var(--brand)", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="var(--brand)"
          strokeWidth={2}
          fill="url(#flGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "var(--brand)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}