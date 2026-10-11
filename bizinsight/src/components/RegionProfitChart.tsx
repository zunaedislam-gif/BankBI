import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { RegionProfitPoint } from '../types/analytics';
import { formatCurrency } from '../utils/analyticsEngine';

interface RegionProfitChartProps {
  data: RegionProfitPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: RegionProfitPoint;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="bg-white border border-slate-200 shadow-md rounded-lg p-3 text-xs min-w-[170px]">
      <div className="font-semibold text-slate-800 pb-1 mb-1.5 border-b border-slate-100">
        Region: {label}
      </div>
      <div className="space-y-1 font-mono">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500 font-sans">Net Profit:</span>
          <span
            className={`font-bold tabular-nums ${
              item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(item.profit)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500 font-sans">Gross Sales:</span>
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCurrency(item.sales)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <span className="text-slate-500 font-sans">Margin:</span>
          <span className="font-bold text-emerald-700 tabular-nums">{item.margin}%</span>
        </div>
      </div>
    </div>
  );
};

export const RegionProfitChart: React.FC<RegionProfitChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-center h-72 text-slate-400 text-sm">
        No regional data available.
      </div>
    );
  }

  const yTickFormatter = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    return `$${val}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Profit by Region</h3>
          <p className="text-xs text-slate-500 mt-0.5">Operating profit and return by geographic territory</p>
        </div>
      </div>

      <div className="mt-4 h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, left: -6, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="region"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={yTickFormatter}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profit >= 0 ? '#059669' : '#e11d48'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
