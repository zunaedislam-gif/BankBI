import React, { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { AIInsightResponse } from '../types/analytics';

interface AIInsightsPanelProps {
  insights: AIInsightResponse | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  hasData: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  isLoading,
  error,
  onGenerate,
  hasData,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!insights) return;
    const textToCopy = `BIZINSIGHT EXECUTIVE REPORT
${insights.summary}

KEY BUSINESS INSIGHTS:
${insights.insights.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}

STRATEGIC RECOMMENDATIONS:
${insights.recommendations.map((rec, i) => `Option ${i + 1}: ${rec}`).join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Executive AI Insights</h3>
              <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated executive intelligence and actionable business strategy
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {insights && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Copy insights to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || !hasData}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>{insights ? 'Regenerate Insights' : 'Generate Insights'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-5">
        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to generate AI insights</p>
              <p className="mt-1 text-rose-700 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={onGenerate}
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-rose-900 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              Analyzing Filtered Sales Performance...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Evaluating monthly trend vectors, margin health, top product contributors, and regional velocity.
            </p>
            <div className="w-64 h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* Empty State before generation */}
        {!insights && !isLoading && !error && (
          <div className="py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              No Insights Generated Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Click &quot;Generate Insights&quot; to have Gemini analyze your current filtered KPIs, monthly sales trends, category distribution, and baseline forecast.
            </p>
            <button
              type="button"
              onClick={onGenerate}
              disabled={!hasData}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Generate Business Insights</span>
            </button>
          </div>
        )}

        {/* Populated Insights View */}
        {insights && !isLoading && (
          <div className="space-y-5">
            {/* Executive Summary Box */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                Executive Summary
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {insights.summary}
              </p>
            </div>

            {/* 4-5 Bullet Insights */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Key Financial &amp; Operational Takeaways ({insights.insights.length})
                </h4>
              </div>
              <ul className="space-y-2.5">
                {insights.insights.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exactly 2 Strategic Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Strategic Recommendations
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 text-xs"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[11px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded">
                        Action 0{idx + 1}
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
