import React from 'react';
import { DollarSign, TrendingUp, Percent, ShoppingBag } from 'lucide-react';
import { KPIMetrics } from '../types/analytics';
import { formatCurrency, formatNumber } from '../utils/analyticsEngine';

interface KPIGridProps {
  metrics: KPIMetrics;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ metrics }) => {
  const isProfitPositive = metrics.totalProfit >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Sales */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Sales
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
            {formatCurrency(metrics.totalSales)}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span>Gross revenue recorded</span>
          </div>
        </div>
      </div>

      {/* 2. Total Profit */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Profit
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isProfitPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums ${
              isProfitPositive ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {formatCurrency(metrics.totalProfit)}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span>Net bottom-line earnings</span>
          </div>
        </div>
      </div>

      {/* 3. Profit Margin % */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Profit Margin %
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
            {metrics.profitMargin.toFixed(1)}%
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span className="font-mono tabular-nums">
              {metrics.profitMargin >= 20
                ? 'Strong margin health (>20%)'
                : metrics.profitMargin >= 10
                ? 'Moderate margin (10-20%)'
                : 'Thin margin (<10%)'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Total Orders */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Orders
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
            {formatNumber(metrics.totalOrders)}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500 font-mono tabular-nums">
            <span>AOV: {formatCurrency(metrics.avgOrderValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
