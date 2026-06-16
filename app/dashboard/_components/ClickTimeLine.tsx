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
            <stop offset="5%"  stopColor="#7c6ff7" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#7c6ff7" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1a1a1e" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: "#444", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fill: "#444", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#111113",
            border: "1px solid #2a2a2e",
            borderRadius: 6,
            color: "#e8e8e8",
            fontSize: 12,
          }}
          cursor={{ stroke: "#7c6ff7", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="#7c6ff7"
          strokeWidth={2}
          fill="url(#tlGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#7c6ff7" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}