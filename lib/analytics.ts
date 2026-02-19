import type { SupabaseClient } from '@supabase/supabase-js';

export interface MonthlyTotal {
  month: string;
  total: number;
}

export interface CategoryTotal {
  category: string | null;
  total: number;
}

export interface CurrencyTotal {
  currency_original: string | null;
  total: number;
}

export interface MerchantTotal {
  merchant_normalized: string | null;
  total: number;
}

/**
 * Aggregate approved expenses to monthly totals in base currency.
 */
export async function getMonthlyTotals(
  supabase: SupabaseClient,
  userId: string,
  monthsBack: number = 12
): Promise<MonthlyTotal[]> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  const startStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('expenses')
    .select('txn_date, amount_base')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .not('amount_base', 'is', null)
    .gte('txn_date', startStr);

  if (error) throw error;

  const byMonth: Record<string, number> = {};
  for (const row of data || []) {
    if (!row.txn_date) continue;
    const month = row.txn_date.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + Number(row.amount_base);
  }

  return Object.entries(byMonth)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Aggregate by category.
 */
export async function getCategoryTotals(
  supabase: SupabaseClient,
  userId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<CategoryTotal[]> {
  let q = supabase
    .from('expenses')
    .select('category, amount_base')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .not('amount_base', 'is', null);

  if (dateFrom) q = q.gte('txn_date', dateFrom);
  if (dateTo) q = q.lte('txn_date', dateTo);

  const { data, error } = await q;
  if (error) throw error;

  const byCat: Record<string, number> = {};
  for (const row of data || []) {
    const cat = row.category || 'Uncategorized';
    byCat[cat] = (byCat[cat] || 0) + Number(row.amount_base);
  }

  return Object.entries(byCat)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Aggregate by currency.
 */
export async function getCurrencyTotals(
  supabase: SupabaseClient,
  userId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<CurrencyTotal[]> {
  let q = supabase
    .from('expenses')
    .select('currency_original, amount_base')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .not('amount_base', 'is', null);

  if (dateFrom) q = q.gte('txn_date', dateFrom);
  if (dateTo) q = q.lte('txn_date', dateTo);

  const { data, error } = await q;
  if (error) throw error;

  const byCurr: Record<string, number> = {};
  for (const row of data || []) {
    const curr = row.currency_original || 'Unknown';
    byCurr[curr] = (byCurr[curr] || 0) + Number(row.amount_base);
  }

  return Object.entries(byCurr)
    .map(([currency_original, total]) => ({ currency_original, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Top merchants by spend.
 */
export async function getTopMerchants(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10,
  dateFrom?: string,
  dateTo?: string
): Promise<MerchantTotal[]> {
  let q = supabase
    .from('expenses')
    .select('merchant_normalized, amount_base')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .not('amount_base', 'is', null);

  if (dateFrom) q = q.gte('txn_date', dateFrom);
  if (dateTo) q = q.lte('txn_date', dateTo);

  const { data, error } = await q;
  if (error) throw error;

  const byMerchant: Record<string, number> = {};
  for (const row of data || []) {
    const m = row.merchant_normalized || 'Unknown';
    byMerchant[m] = (byMerchant[m] || 0) + Number(row.amount_base);
  }

  return Object.entries(byMerchant)
    .map(([merchant_normalized, total]) => ({ merchant_normalized, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Compute forecast for next 3 months using moving average.
 */
export function computeForecast(monthlyTotals: MonthlyTotal[]): {
  month: string;
  amount: number;
  lower: number;
  upper: number;
}[] {
  const sorted = [...monthlyTotals].sort((a, b) => a.month.localeCompare(b.month));
  const values = sorted.map((m) => m.total);

  let avg: number;
  let std: number;
  if (values.length >= 3) {
    const last3 = values.slice(-3);
    avg = last3.reduce((a, b) => a + b, 0) / 3;
    const variance =
      last3.reduce((s, v) => s + (v - avg) ** 2, 0) / 3;
    std = Math.sqrt(variance) || avg * 0.2;
  } else if (values.length > 0) {
    avg = values.reduce((a, b) => a + b, 0) / values.length;
    std = avg * 0.2;
  } else {
    avg = 0;
    std = 0;
  }

  const results: { month: string; amount: number; lower: number; upper: number }[] = [];
  let d = new Date();
  for (let i = 1; i <= 3; i++) {
    d.setMonth(d.getMonth() + 1);
    const month = d.toISOString().slice(0, 7);
    const band = Math.max(avg * 0.2, std);
    results.push({
      month,
      amount: Math.round(avg * 100) / 100,
      lower: Math.round((avg - band) * 100) / 100,
      upper: Math.round((avg + band) * 100) / 100,
    });
  }
  return results;
}
