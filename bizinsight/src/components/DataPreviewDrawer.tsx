import React, { useState } from 'react';
import { SalesRecord } from '../types/analytics';
import { formatCurrency, formatNumber } from '../utils/analyticsEngine';
import { X, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface DataPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: SalesRecord[];
  fileName: string;
}

export const DataPreviewDrawer: React.FC<DataPreviewDrawerProps> = ({
  isOpen,
  onClose,
  records,
  fileName,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  if (!isOpen) return null;

  const filtered = records.filter(
    (r) =>
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.region.toLowerCase().includes(search.toLowerCase()) ||
      r.orderDate.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Data Inspector: {fileName}
              </h3>
              <p className="text-xs text-slate-500 font-mono tabular-nums">
                {records.length} total rows parsed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product, category, region, date..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Showing {currentRows.length} of {filtered.length} matches
          </span>
        </div>

        {/* Table content */}
        <div className="flex-1 overflow-auto p-6 pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500 bg-slate-50 sticky top-0">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Region</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Product</th>
                <th className="py-2 px-3 text-right">Qty</th>
                <th className="py-2 px-3 text-right">Sales</th>
                <th className="py-2 px-3 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {currentRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 text-slate-600 tabular-nums">{row.orderDate}</td>
                  <td className="py-2 px-3 font-sans text-slate-700">{row.region}</td>
                  <td className="py-2 px-3 font-sans text-slate-600">{row.category}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-900">{row.product}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-700">
                    {formatNumber(row.quantity)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums font-semibold text-slate-900">
                    {formatCurrency(row.sales)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right tabular-nums font-semibold ${
                      row.profit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(row.profit)}
                  </td>
                </tr>
              ))}
              {currentRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-sans text-xs">
                    No rows match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Page <strong className="font-mono tabular-nums">{currentPage}</strong> of{' '}
            <strong className="font-mono tabular-nums">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
