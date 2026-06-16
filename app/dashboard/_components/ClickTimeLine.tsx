"use client";

import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

type Props = { data: { day: string; clicks: number }[]; days: number };

function fillDays(data: Props["data"], days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const match = data.find((r) => r.day.startsWith(key));
    return {
      day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      clicks: match?.clicks ?? 0,
    };
  });
}

export function ClickTimeline({ data, days }: Props) {
  const filled = fillDays(data, days);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={filled} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="tlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--brand)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border-muted)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={1}
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
          fill="url(#tlGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "var(--brand)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}