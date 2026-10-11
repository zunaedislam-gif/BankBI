import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ForecastSummary, MonthlySalesPoint } from '../types/analytics';
import { formatCurrency } from '../utils/analyticsEngine';
import { TrendingUp, Sparkles, HelpCircle } from 'lucide-react';

interface SalesTrendChartProps {
  forecastSummary: ForecastSummary;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
    payload: MonthlySalesPoint;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload;
  const isForecastPoint = dataPoint?.isForecast;

  return (
    <div className="bg-white border border-slate-200 shadow-md rounded-lg p-3 text-xs min-w-[170px]">
      <div className="font-semibold text-slate-800 pb-1.5 mb-1.5 border-b border-slate-100 flex items-center justify-between">
        <span>{label}</span>
        {isForecastPoint && (
          <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">
            Projected
          </span>
        )}
      </div>

      <div className="space-y-1 font-mono">
        {payload.map((entry, index) => {
          if (entry.value === null || entry.value === undefined) return null;
          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 font-sans">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatCurrency(entry.value)}
              </span>
            </div>
          );
        })}

        {dataPoint?.profit !== null && dataPoint?.profit !== undefined && (
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <span className="text-slate-600 font-sans">Profit:</span>
            <span
              className={`font-semibold tabular-nums ${
                dataPoint.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(dataPoint.profit)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ forecastSummary }) => {
  const { points, growthRatePercent, projectedTotal3Months } = forecastSummary;

  if (!points || points.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-center h-80 text-slate-400 text-sm">
        No sales data available for the selected filters.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Monthly Sales Trend</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
              <Sparkles className="w-3 h-3 text-purple-600" />
              +3 Mo Statistical Forecast
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical revenue trajectory with Ordinary Least Squares (OLS) trend forecast
          </p>
        </div>

        {/* Growth & Forecast Stat Callouts */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-sans">Hist. Growth</span>
            <span
              className={`font-semibold tabular-nums inline-flex items-center gap-0.5 ${
                growthRatePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              {growthRatePercent > 0 ? '+' : ''}
              {growthRatePercent}%
            </span>
          </div>

          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[11px] text-slate-400 block font-sans">Est. Next 3 Mo</span>
            <span className="font-bold text-purple-700 tabular-nums">
              {formatCurrency(projectedTotal3Months, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 12, right: 12, left: -4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
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
            <Legend
              verticalAlign="top"
              align="right"
              iconType="plainline"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
            />
            {/* Historical Actual Sales Line */}
            <Line
              type="monotone"
              dataKey="sales"
              name="Actual Sales"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#4f46e5', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#4338ca' }}
              connectNulls={false}
            />
            {/* Next 3 Months Forecast Dotted Line */}
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast (Next 3 Mo)"
              stroke="#9333ea"
              strokeWidth={2.5}
              strokeDasharray="6 6"
              dot={{ r: 4, fill: '#9333ea', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#7e22ce' }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer explainer */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          Forecast calculated via JavaScript linear regression (slope: {forecastSummary.slope}/mo)
        </span>
        <span className="hidden sm:inline">Dotted purple line represents predictive baseline</span>
      </div>
    </div>
  );
};
