import React from 'react';
import { ProductPerformance } from '../types/analytics';
import { formatCurrency, formatNumber } from '../utils/analyticsEngine';
import { Award } from 'lucide-react';

interface TopProductsTableProps {
  products: ProductPerformance[];
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-center h-48 text-slate-400 text-sm">
        No product sales recorded for this view.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">Top 5 Products by Sales</h3>
        </div>
        <span className="text-xs text-slate-500">Ranked by gross revenue</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4 w-12 text-center">Rank</th>
              <th className="py-2.5 px-4">Product Name</th>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4 text-right">Units Sold</th>
              <th className="py-2.5 px-4 text-right">Total Sales</th>
              <th className="py-2.5 px-4 text-right">Total Profit</th>
              <th className="py-2.5 px-4 text-right">Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {products.map((item, index) => {
              const rank = index + 1;
              const isProfitPositive = item.profit >= 0;

              return (
                <tr
                  key={item.product}
                  className="hover:bg-slate-50/80 transition-colors h-11"
                >
                  <td className="py-2 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-mono text-[11px] font-bold ${
                        rank === 1
                          ? 'bg-amber-100 text-amber-800'
                          : rank === 2
                          ? 'bg-slate-200 text-slate-700'
                          : rank === 3
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rank}
                    </span>
                  </td>
                  <td className="py-2 px-4 font-medium text-slate-900">
                    {item.product}
                  </td>
                  <td className="py-2 px-4 text-slate-600">
                    <span className="text-xs text-slate-500">{item.category}</span>
                  </td>
                  <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-700">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {formatCurrency(item.sales)}
                  </td>
                  <td
                    className={`py-2 px-4 text-right font-mono font-semibold tabular-nums ${
                      isProfitPositive ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(item.profit)}
                  </td>
                  <td className="py-2 px-4 text-right font-mono tabular-nums">
                    <span
                      className={`font-semibold ${
                        item.margin >= 20
                          ? 'text-emerald-700'
                          : item.margin >= 10
                          ? 'text-indigo-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {item.margin}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
