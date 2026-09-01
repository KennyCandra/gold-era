"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { UserStats } from "@/lib/types";
import { groupByFileType } from "@/lib/utils";

export interface FilesByTypeChartProps {
  data: UserStats["byType"];
}

const CATEGORY_ORDER = ["Images", "PDFs", "Documents", "Spreadsheets", "Text", "Archives"] as const;

const CATEGORY_COLOR: Record<(typeof CATEGORY_ORDER)[number], string> = {
  Images: "var(--c2)",
  PDFs: "var(--c4)",
  Documents: "var(--c3)",
  Spreadsheets: "var(--c1)",
  Text: "var(--c6)",
  Archives: "var(--c5)",
};

export function FilesByTypeChart({ data }: FilesByTypeChartProps) {
  const countByType = new Map(groupByFileType(data).map((g) => [g.label, g.count]));
  const chartData = CATEGORY_ORDER.map((type) => ({ type, count: countByType.get(type) ?? 0 }));

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-lg font-semibold leading-7">Files by type</h2>
      <div className="h-55 w-full" role="img" aria-label="Bar chart of files grouped by type">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="type"
              interval={0}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "var(--subtle)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "var(--bg)" }}
              contentStyle={{
                background: "var(--raised)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 13,
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={38}>
              {chartData.map((entry) => (
                <Cell key={entry.type} fill={CATEGORY_COLOR[entry.type]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
