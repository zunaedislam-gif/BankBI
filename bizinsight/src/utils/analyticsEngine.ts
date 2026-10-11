import {
  SalesRecord,
  KPIMetrics,
  MonthlySalesPoint,
  CategorySalesPoint,
  RegionProfitPoint,
  ProductPerformance,
  ForecastSummary,
} from '../types/analytics';

export function calculateKPIs(records: SalesRecord[]): KPIMetrics {
  if (!records || records.length === 0) {
    return {
      totalSales: 0,
      totalProfit: 0,
      profitMargin: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };
  }

  let totalSales = 0;
  let totalProfit = 0;

  for (const record of records) {
    totalSales += record.sales;
    totalProfit += record.profit;
  }

  const totalOrders = records.length;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return {
    totalSales,
    totalProfit,
    profitMargin: Number(profitMargin.toFixed(1)),
    totalOrders,
    avgOrderValue: Number(avgOrderValue.toFixed(2)),
  };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthLabel(yearMonthStr: string): string {
  const [yearStr, monthStr] = yearMonthStr.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const shortYear = yearStr ? yearStr.slice(-2) : '';
  const monthName = MONTH_NAMES[monthIdx] || monthStr;
  return `${monthName} '${shortYear}`;
}

function getNextYearMonth(yearMonthStr: string, incrementMonths: number): string {
  const [yearStr, monthStr] = yearMonthStr.split('-');
  let y = parseInt(yearStr, 10) || new Date().getFullYear();
  let m = parseInt(monthStr, 10) || 1;

  m += incrementMonths;
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function calculateMonthlyTrendWithForecast(records: SalesRecord[]): ForecastSummary {
  if (!records || records.length === 0) {
    return {
      method: 'Linear Regression (OLS)',
      slope: 0,
      growthRatePercent: 0,
      projectedTotal3Months: 0,
      points: [],
    };
  }

  // Group by year-month
  const monthlyMap = new Map<string, { sales: number; profit: number; count: number }>();

  for (const r of records) {
    let ym = '2024-01';
    if (r.orderDate && r.orderDate.length >= 7) {
      ym = r.orderDate.slice(0, 7);
    }
    const current = monthlyMap.get(ym) || { sales: 0, profit: 0, count: 0 };
    current.sales += r.sales;
    current.profit += r.profit;
    current.count += 1;
    monthlyMap.set(ym, current);
  }

  // Sort months chronologically
  const sortedMonths = Array.from(monthlyMap.keys()).sort();

  if (sortedMonths.length === 0) {
    return {
      method: 'Linear Regression (OLS)',
      slope: 0,
      growthRatePercent: 0,
      projectedTotal3Months: 0,
      points: [],
    };
  }

  // Map to points
  const points: MonthlySalesPoint[] = sortedMonths.map((ym) => {
    const data = monthlyMap.get(ym)!;
    return {
      month: ym,
      label: formatMonthLabel(ym),
      sales: Math.round(data.sales * 100) / 100,
      profit: Math.round(data.profit * 100) / 100,
      forecast: null,
      isForecast: false,
    };
  });

  const n = points.length;

  // Calculate Ordinary Least Squares linear regression: y = m*x + b
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = points[i].sales || 0;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  let slope = 0;
  let intercept = points[0].sales || 0;

  if (n > 1) {
    const denom = n * sumX2 - sumX * sumX;
    if (denom !== 0) {
      slope = (n * sumXY - sumX * sumY) / denom;
      intercept = (sumY - slope * sumX) / n;
    }
  }

  // Anchor the forecast on the last historical point so the Recharts line is unbroken
  const lastIndex = n - 1;
  const lastMonthKey = sortedMonths[lastIndex];
  points[lastIndex].forecast = points[lastIndex].sales;

  // Calculate 3-month moving average as fallback/baseline if linear slope is too erratic
  const recent3Points = points.slice(Math.max(0, n - 3));
  const recent3Avg =
    recent3Points.reduce((acc, p) => acc + (p.sales || 0), 0) / Math.max(1, recent3Points.length);

  let projectedTotal3Months = 0;
  const forecastMethod: 'Linear Regression (OLS)' | '3-Month Moving Average' = 'Linear Regression (OLS)';

  for (let step = 1; step <= 3; step++) {
    const futureX = lastIndex + step;
    let rawEstimate = slope * futureX + intercept;

    // Safety guardrails: avoid negative or absurd sales spikes
    if (rawEstimate < 0 || isNaN(rawEstimate)) {
      rawEstimate = Math.max(0, recent3Avg * (1 + 0.02 * step));
    }

    const estimate = Math.round(rawEstimate * 100) / 100;
    projectedTotal3Months += estimate;

    const futureYM = getNextYearMonth(lastMonthKey, step);
    const label = `${formatMonthLabel(futureYM)} (Est)`;

    points.push({
      month: futureYM,
      label,
      sales: null, // Historical sales is null for forecast points
      profit: null,
      forecast: estimate,
      isForecast: true,
    });
  }

  // Calculate monthly growth rate
  const firstSales = points[0].sales || 1;
  const lastSales = points[lastIndex].sales || 1;
  const growthRatePercent = n > 1 ? ((lastSales - firstSales) / firstSales) * 100 : 0;

  return {
    method: forecastMethod,
    slope: Number(slope.toFixed(2)),
    growthRatePercent: Number(growthRatePercent.toFixed(1)),
    projectedTotal3Months: Math.round(projectedTotal3Months * 100) / 100,
    points,
  };
}

export function calculateCategorySales(records: SalesRecord[]): CategorySalesPoint[] {
  const catMap = new Map<string, { sales: number; profit: number; quantity: number }>();

  for (const r of records) {
    const cat = r.category || 'General';
    const curr = catMap.get(cat) || { sales: 0, profit: 0, quantity: 0 };
    curr.sales += r.sales;
    curr.profit += r.profit;
    curr.quantity += r.quantity;
    catMap.set(cat, curr);
  }

  return Array.from(catMap.entries())
    .map(([category, val]) => {
      const margin = val.sales > 0 ? (val.profit / val.sales) * 100 : 0;
      return {
        category,
        sales: Math.round(val.sales * 100) / 100,
        profit: Math.round(val.profit * 100) / 100,
        quantity: val.quantity,
        margin: Number(margin.toFixed(1)),
      };
    })
    .sort((a, b) => b.sales - a.sales);
}

export function calculateRegionProfit(records: SalesRecord[]): RegionProfitPoint[] {
  const regMap = new Map<string, { sales: number; profit: number; quantity: number }>();

  for (const r of records) {
    const reg = r.region || 'Unspecified';
    const curr = regMap.get(reg) || { sales: 0, profit: 0, quantity: 0 };
    curr.sales += r.sales;
    curr.profit += r.profit;
    curr.quantity += r.quantity;
    regMap.set(reg, curr);
  }

  return Array.from(regMap.entries())
    .map(([region, val]) => {
      const margin = val.sales > 0 ? (val.profit / val.sales) * 100 : 0;
      return {
        region,
        profit: Math.round(val.profit * 100) / 100,
        sales: Math.round(val.sales * 100) / 100,
        quantity: val.quantity,
        margin: Number(margin.toFixed(1)),
      };
    })
    .sort((a, b) => b.profit - a.profit);
}

export function calculateTopProducts(records: SalesRecord[], limit: number = 5): ProductPerformance[] {
  const prodMap = new Map<string, { category: string; sales: number; quantity: number; profit: number }>();

  for (const r of records) {
    const prod = r.product || 'Unknown Product';
    const curr = prodMap.get(prod) || { category: r.category, sales: 0, quantity: 0, profit: 0 };
    curr.sales += r.sales;
    curr.quantity += r.quantity;
    curr.profit += r.profit;
    if (r.category) curr.category = r.category;
    prodMap.set(prod, curr);
  }

  return Array.from(prodMap.entries())
    .map(([product, val]) => {
      const margin = val.sales > 0 ? (val.profit / val.sales) * 100 : 0;
      return {
        product,
        category: val.category,
        sales: Math.round(val.sales * 100) / 100,
        quantity: val.quantity,
        profit: Math.round(val.profit * 100) / 100,
        margin: Number(margin.toFixed(1)),
      };
    })
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

export function formatCurrency(amount: number, compact: boolean = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
