"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { UserStats } from "@/lib/types";
import { fillUploadHistory } from "@/lib/utils";

export interface UploadHistoryChartProps {
  data: UserStats["uploadHistory"];
}

export function UploadHistoryChart({ data }: UploadHistoryChartProps) {
  const chartData = fillUploadHistory(data);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold leading-7">Upload history</h2>
        <span className="text-[13px] leading-[18px] text-subtle">Last 30 days</span>
      </div>
      <div className="h-[220px] w-full" role="img" aria-label="Line chart of uploads over the last 30 days">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="myf-upload-history-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--subtle)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis hide domain={["dataMin", "dataMax"]} />
            <Tooltip
              contentStyle={{
                background: "var(--raised)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 13,
              }}
              labelStyle={{ color: "var(--muted)" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Uploads"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#myf-upload-history-fill)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
