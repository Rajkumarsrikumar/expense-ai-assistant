'use client';

import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ForecastPoint {
  month: string;
  amount: number;
  lower: number;
  upper: number;
}

interface HistoricalPoint {
  month: string;
  total: number;
}

interface ForecastData {
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
}

export default function ForecastChart() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forecast')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-500">
        Failed to load forecast data.
      </div>
    );
  }

  const chartData = [
    ...data.historical.map((h) => ({
      month: h.month,
      historical: h.total,
      forecast: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    })),
    ...data.forecast.map((f) => ({
      month: f.month,
      historical: null as number | null,
      forecast: f.amount,
      lower: f.lower,
      upper: f.upper,
    })),
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        Next 3 months forecast (with confidence band)
      </h3>
      <p className="mb-4 text-sm text-slate-500">
        Based on moving average of last 3 months. Band shows ±20% or std dev.
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" />
          <YAxis
            stroke="#64748b"
            tickFormatter={(v) => (v != null ? `$${v}` : '')}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value != null
                ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : '—',
              name === 'historical' ? 'Historical' : name === 'forecast' ? 'Forecast' : name,
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="historical"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls
            name="Historical"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            connectNulls
            name="Forecast"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
