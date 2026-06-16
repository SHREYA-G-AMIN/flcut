"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Row = { device: string | null; clicks: number };

const COLORS = ["#7c6ff7", "#3ddc84", "#f5c400", "#dc3d3d", "#4db8ff"];

export function DeviceChart({ data }: { data: Row[] }) {
  const cleaned = data.map((r) => ({
    name: r.device || "Unknown",
    value: r.clicks,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={cleaned}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {cleaned.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#111113",
            border: "1px solid #2a2a2e",
            borderRadius: 6,
            color: "#e8e8e8",
            fontSize: 12,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          // Added explicit string typing here to appease the compiler
          formatter={(v: string) => (
            <span style={{ color: "#888", fontSize: 12 }}>{v}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}