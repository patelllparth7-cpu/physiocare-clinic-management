"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type RevenuePoint = {
  month: string;
  revenue: number;
};

export default function RevenueChart({
  data = [],
}: {
  data?: RevenuePoint[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Revenue Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Revenue generated from patient payments
          </p>
        </div>

        <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          Monthly
        </span>
      </div>

      <div className="h-[300px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm font-medium text-slate-500">
            No revenue data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "#334155" }} />
              <YAxis tick={{ fill: "#334155" }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}