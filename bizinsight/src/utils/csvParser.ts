import Papa from 'papaparse';
import { SalesRecord, CSVParseResult } from '../types/analytics';

// Header aliases for fuzzy matching
const HEADER_ALIASES: Record<string, string[]> = {
  orderDate: ['order date', 'orderdate', 'order_date', 'date', 'transaction date', 'sale date', 'invoice date'],
  region: ['region', 'territory', 'area', 'zone', 'market', 'location'],
  category: ['category', 'product category', 'department', 'segment', 'item category', 'type'],
  product: ['product', 'product name', 'product_name', 'item', 'item name', 'sku', 'description'],
  sales: ['sales', 'revenue', 'total sales', 'total revenue', 'sale amount', 'amount', 'gross sales', 'price'],
  quantity: ['quantity', 'qty', 'units', 'volume', 'count', 'quantity sold', 'units sold'],
  profit: ['profit', 'net profit', 'total profit', 'net income', 'income', 'margin', 'gross profit'],
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

function findHeaderKey(actualHeaders: string[], targetAliases: string[]): string | null {
  for (const actual of actualHeaders) {
    const norm = normalizeHeader(actual);
    if (targetAliases.includes(norm)) {
      return actual;
    }
  }
  // Fallback substring check
  for (const actual of actualHeaders) {
    const norm = normalizeHeader(actual);
    for (const alias of targetAliases) {
      if (norm.includes(alias) || alias.includes(norm)) {
        return actual;
      }
    }
  }
  return null;
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function normalizeDate(rawDate: string): string {
  if (!rawDate) return new Date().toISOString().split('T')[0];

  const trimmed = rawDate.trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle MM/DD/YYYY or M/D/YYYY
  const usMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (usMatch) {
    const m = usMatch[1].padStart(2, '0');
    const d = usMatch[2].padStart(2, '0');
    const y = usMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Try standard Date parse
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return trimmed;
}

export function parseSalesCSV(csvString: string, fileName: string = 'uploaded.csv'): CSVParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!csvString || !csvString.trim()) {
    return {
      records: [],
      errors: ['The selected file is empty. Please upload a valid CSV file with sales data.'],
      warnings: [],
      fileName,
      rowCount: 0,
    };
  }

  const parsed = Papa.parse<Record<string, unknown>>(csvString, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  if (parsed.errors && parsed.errors.length > 0) {
    const criticalError = parsed.errors.find((e) => e.type !== 'FieldMismatch');
    if (criticalError) {
      errors.push(`CSV Syntax Error: ${criticalError.message} at row ${criticalError.row || 0}`);
    }
  }

  const dataRows = parsed.data;
  if (!dataRows || dataRows.length === 0) {
    return {
      records: [],
      errors: ['No data rows found in the CSV file.'],
      warnings: [],
      fileName,
      rowCount: 0,
    };
  }

  const headers = parsed.meta.fields || (dataRows[0] ? Object.keys(dataRows[0]) : []);
  if (headers.length === 0) {
    return {
      records: [],
      errors: ['Could not detect column headers in the CSV file.'],
      warnings: [],
      fileName,
      rowCount: 0,
    };
  }

  // Map required columns
  const dateKey = findHeaderKey(headers, HEADER_ALIASES.orderDate);
  const regionKey = findHeaderKey(headers, HEADER_ALIASES.region);
  const categoryKey = findHeaderKey(headers, HEADER_ALIASES.category);
  const productKey = findHeaderKey(headers, HEADER_ALIASES.product);
  const salesKey = findHeaderKey(headers, HEADER_ALIASES.sales);
  const quantityKey = findHeaderKey(headers, HEADER_ALIASES.quantity);
  const profitKey = findHeaderKey(headers, HEADER_ALIASES.profit);

  const missingColumns: string[] = [];
  if (!dateKey) missingColumns.push('Order Date');
  if (!regionKey) missingColumns.push('Region');
  if (!categoryKey) missingColumns.push('Category');
  if (!productKey) missingColumns.push('Product');
  if (!salesKey) missingColumns.push('Sales');
  if (!quantityKey) missingColumns.push('Quantity');
  if (!profitKey) missingColumns.push('Profit');

  if (missingColumns.length > 0) {
    return {
      records: [],
      errors: [
        `Missing required columns: [${missingColumns.join(', ')}].`,
        `Detected headers in file: [${headers.join(', ')}].`,
        'Expected columns: Order Date, Region, Category, Product, Sales, Quantity, Profit.',
      ],
      warnings,
      fileName,
      rowCount: 0,
    };
  }

  const records: SalesRecord[] = [];
  let invalidRowsCount = 0;

  dataRows.forEach((row, index) => {
    const rawSales = salesKey ? row[salesKey] : 0;
    const rawProfit = profitKey ? row[profitKey] : 0;
    const rawQty = quantityKey ? row[quantityKey] : 1;
    const rawDate = dateKey ? String(row[dateKey] ?? '') : '';
    const rawRegion = regionKey ? String(row[regionKey] ?? '').trim() : 'Unknown';
    const rawCategory = categoryKey ? String(row[categoryKey] ?? '').trim() : 'General';
    const rawProduct = productKey ? String(row[productKey] ?? '').trim() : 'Item';

    const sales = parseNumber(rawSales);
    const profit = parseNumber(rawProfit);
    const quantity = Math.max(1, Math.round(parseNumber(rawQty)));

    // Skip row if it lacks basic substance
    if (!rawDate && sales === 0 && !rawProduct) {
      invalidRowsCount++;
      return;
    }

    records.push({
      id: `rec-${index + 1}`,
      orderDate: normalizeDate(rawDate),
      region: rawRegion || 'Unspecified',
      category: rawCategory || 'General',
      product: rawProduct || `Product #${index + 1}`,
      sales,
      quantity,
      profit,
    });
  });

  if (records.length === 0) {
    return {
      records: [],
      errors: ['No valid sales records could be parsed from the provided file.'],
      warnings,
      fileName,
      rowCount: 0,
    };
  }

  if (invalidRowsCount > 0) {
    warnings.push(`Ignored ${invalidRowsCount} empty or incomplete rows.`);
  }

  return {
    records,
    errors,
    warnings,
    fileName,
    rowCount: records.length,
  };
}
