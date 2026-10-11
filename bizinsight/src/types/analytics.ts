export interface SalesRecord {
  id: string;
  orderDate: string; // YYYY-MM-DD
  region: string;
  category: string;
  product: string;
  sales: number;
  quantity: number;
  profit: number;
}

export interface KPIMetrics {
  totalSales: number;
  totalProfit: number;
  profitMargin: number; // e.g. 23.5 for 23.5%
  totalOrders: number;
  avgOrderValue: number;
}

export interface MonthlySalesPoint {
  month: string; // "2024-01"
  label: string; // "Jan 2024"
  sales: number | null;
  profit: number | null;
  forecast: number | null;
  isForecast?: boolean;
}

export interface CategorySalesPoint {
  category: string;
  sales: number;
  profit: number;
  margin: number;
  quantity: number;
}

export interface RegionProfitPoint {
  region: string;
  profit: number;
  sales: number;
  margin: number;
  quantity: number;
}

export interface ProductPerformance {
  product: string;
  category: string;
  sales: number;
  quantity: number;
  profit: number;
  margin: number;
}

export interface ForecastSummary {
  method: 'Linear Regression (OLS)' | '3-Month Moving Average';
  slope: number;
  growthRatePercent: number;
  projectedTotal3Months: number;
  points: MonthlySalesPoint[];
}

export interface AIInsightResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
}

export interface FilterState {
  region: string;
  category: string;
  searchQuery?: string;
}

export interface CSVParseResult {
  records: SalesRecord[];
  errors: string[];
  warnings: string[];
  fileName: string;
  rowCount: number;
}
