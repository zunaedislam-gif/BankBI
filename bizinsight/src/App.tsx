import React, { useState, useMemo, useCallback } from 'react';
import { SalesRecord, FilterState, AIInsightResponse, CSVParseResult } from './types/analytics';
import { getSampleSalesRecords } from './data/sampleSalesData';
import {
  calculateKPIs,
  calculateMonthlyTrendWithForecast,
  calculateCategorySales,
  calculateRegionProfit,
  calculateTopProducts,
} from './utils/analyticsEngine';

import { Header } from './components/Header';
import { DataUploadZone } from './components/DataUploadZone';
import { FilterBar } from './components/FilterBar';
import { KPIGrid } from './components/KPIGrid';
import { SalesTrendChart } from './components/SalesTrendChart';
import { CategorySalesChart } from './components/CategorySalesChart';
import { RegionProfitChart } from './components/RegionProfitChart';
import { TopProductsTable } from './components/TopProductsTable';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { UploadModal } from './components/UploadModal';
import { DataPreviewDrawer } from './components/DataPreviewDrawer';

export default function App() {
  // Primary Dataset State
  const [records, setRecords] = useState<SalesRecord[]>(() => getSampleSalesRecords());
  const [fileName, setFileName] = useState<string>('sample_sales_data.csv');

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    region: 'All',
    category: 'All',
  });

  // UI Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<AIInsightResponse | null>({
    summary:
      'Overall sales demonstrate strong upward momentum across 2024, closing with a healthy 25.1% net profit margin driven predominantly by high-performing Technology and Furniture categories.',
    insights: [
      'Technology generates 48.2% of total business revenue with strong margin health (26.8%), anchored by enterprise demand for the UltraBook Pro 15 and 4K Quantum Monitors.',
      'The West region is the top profit driver, generating exceptional operating returns with minimal overhead, while the East leads in gross revenue volume.',
      'Q4 witnessed a sharp revenue acceleration (+45% compared to Q1), illustrating seasonal year-end enterprise budget allocation in Technology and Modular Workstations.',
      'Office Supplies maintains steady cash-flow consistency with high order frequency, though average transaction size is lower ($185 vs $2,100 in Technology).',
      'The 3-month linear regression baseline projects continued growth into early 2025, with estimated monthly revenues averaging above $30,000.',
    ],
    recommendations: [
      'Capitalize on Technology margin strength by introducing bundled enterprise workstation packages (UltraBook Pro + 4K Monitor) to increase Average Order Value.',
      'Scale inventory distribution and regional sales teams in the West and East territories ahead of anticipated Q1 demand spikes identified in the trend forecast.',
    ],
  });
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Available Filter Options
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.region) set.add(r.region);
    });
    return Array.from(set).sort();
  }, [records]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set).sort();
  }, [records]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filters.region !== 'All' && r.region !== filters.region) {
        return false;
      }
      if (filters.category !== 'All' && r.category !== filters.category) {
        return false;
      }
      return true;
    });
  }, [records, filters]);

  // Derived Analytics (all computed in JavaScript)
  const kpiMetrics = useMemo(() => calculateKPIs(filteredRecords), [filteredRecords]);
  const forecastSummary = useMemo(
    () => calculateMonthlyTrendWithForecast(filteredRecords),
    [filteredRecords]
  );
  const categorySales = useMemo(() => calculateCategorySales(filteredRecords), [filteredRecords]);
  const regionProfits = useMemo(() => calculateRegionProfit(filteredRecords), [filteredRecords]);
  const topProducts = useMemo(() => calculateTopProducts(filteredRecords, 5), [filteredRecords]);

  // Load sample dataset
  const handleLoadSample = useCallback(() => {
    const sample = getSampleSalesRecords();
    setRecords(sample);
    setFileName('sample_sales_data.csv');
    setFilters({ region: 'All', category: 'All' });
  }, []);

  // Handle uploaded data
  const handleDataLoaded = useCallback((result: CSVParseResult) => {
    setRecords(result.records);
    setFileName(result.fileName);
    setFilters({ region: 'All', category: 'All' });
    setAiInsights(null); // Reset insights to encourage fresh generation on the new dataset
  }, []);

  // Generate Gemini Insights
  const handleGenerateInsights = async () => {
    if (filteredRecords.length === 0) return;

    setIsGeneratingInsights(true);
    setAiError(null);

    const summaryPayload = {
      kpis: kpiMetrics,
      activeFilters: filters,
      monthlySales: forecastSummary.points
        .filter((p) => !p.isForecast)
        .map((p) => ({
          month: p.label,
          sales: p.sales,
          profit: p.profit,
        })),
      topCategories: categorySales.slice(0, 5),
      topRegions: regionProfits.slice(0, 5),
      topProducts: topProducts.slice(0, 5),
      forecast: forecastSummary.points
        .filter((p) => p.isForecast)
        .map((p) => ({
          month: p.label,
          forecastSales: p.forecast,
        })),
    };

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summaryPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.error || `Server responded with error status ${res.status}: ${res.statusText}`
        );
      }

      const data: AIInsightResponse = await res.json();
      setAiInsights(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate AI insights';
      setAiError(msg);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        fileName={fileName}
        totalRecords={records.length}
        filteredRecords={filteredRecords.length}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onLoadSample={handleLoadSample}
        onGenerateInsights={handleGenerateInsights}
        isGeneratingInsights={isGeneratingInsights}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Upload Zone & Quick Sample Access */}
        <DataUploadZone
          onDataLoaded={handleDataLoaded}
          onLoadSample={handleLoadSample}
          currentFileName={fileName}
          totalRecords={records.length}
        />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          availableRegions={availableRegions}
          availableCategories={availableCategories}
          totalCount={records.length}
          filteredCount={filteredRecords.length}
        />

        {/* 1. Top KPI Cards */}
        <KPIGrid metrics={kpiMetrics} />

        {/* 2. Executive AI Insights Panel */}
        <AIInsightsPanel
          insights={aiInsights}
          isLoading={isGeneratingInsights}
          error={aiError}
          onGenerate={handleGenerateInsights}
          hasData={filteredRecords.length > 0}
        />

        {/* 3. Monthly Sales Trend Chart with 3-Month Linear Regression Forecast */}
        <SalesTrendChart forecastSummary={forecastSummary} />

        {/* 4. Category & Regional Breakdown Charts (2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategorySalesChart data={categorySales} />
          <RegionProfitChart data={regionProfits} />
        </div>

        {/* 5. Top 5 Products Table */}
        <TopProductsTable products={topProducts} />

        {/* Footer info bar */}
        <div className="pt-6 pb-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>BizInsight Analytics Engine</span>
            <span className="mx-2">·</span>
            <span>Mathematical calculations in JavaScript</span>
            <span className="mx-2">·</span>
            <span>AI powered by Gemini</span>
          </div>
          <button
            type="button"
            onClick={() => setIsPreviewDrawerOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            Inspect Raw Records ({records.length}) →
          </button>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
        onLoadSample={handleLoadSample}
      />

      {/* Raw Data Preview Drawer */}
      <DataPreviewDrawer
        isOpen={isPreviewDrawerOpen}
        onClose={() => setIsPreviewDrawerOpen(false)}
        records={filteredRecords}
        fileName={fileName}
      />
    </div>
  );
}
