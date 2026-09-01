"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { getFileKind } from "@/lib/utils";

export interface FileTypeBarChartProps {
  data: { type: string; count: number }[];
  className?: string;
}

export function FileTypeBarChart({ data, className }: FileTypeBarChartProps) {
  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .map((d) => {
      const kind = getFileKind(d.type);
      return { name: kind.group, count: d.count, colorVar: kind.colorVar };
    });

  const height = Math.max(160, chartData.length * 38);

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 36, bottom: 4, left: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted)", fontSize: 13, fontFamily: "Inter" }}
          />
          <Bar dataKey="count" radius={4} barSize={22}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={`var(${entry.colorVar})`} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fill: "var(--text)", fontSize: 13, fontWeight: 500, fontFamily: "Inter" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
