import React from 'react';
import { BarChart3, UploadCloud, Database, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  fileName: string;
  totalRecords: number;
  filteredRecords: number;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  onGenerateInsights: () => void;
  isGeneratingInsights: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  fileName,
  totalRecords,
  filteredRecords,
  onOpenUpload,
  onLoadSample,
  onGenerateInsights,
  isGeneratingInsights,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                BizInsight
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
                AI Sales Intelligence
              </span>
            </div>
          </div>

          {/* Zone 2: Dataset status info */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-sans text-slate-700 font-medium truncate max-w-[180px]">
              {fileName}
            </span>
            <span>·</span>
            <span className="tabular-nums">
              {filteredRecords === totalRecords
                ? `${totalRecords} records`
                : `${filteredRecords} / ${totalRecords} filtered`}
            </span>
          </div>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              title="Reload the built-in sample sales dataset"
            >
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Load Sample Data</span>
              <span className="sm:hidden">Sample</span>
            </button>

            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>Upload CSV</span>
            </button>

            <button
              type="button"
              onClick={onGenerateInsights}
              disabled={isGeneratingInsights || filteredRecords === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-md transition-all shadow-xs"
            >
              {isGeneratingInsights ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              )}
              <span>{isGeneratingInsights ? 'Analyzing...' : 'Generate Insights'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
