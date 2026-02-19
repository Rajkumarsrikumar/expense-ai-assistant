import type { SupabaseClient } from '@supabase/supabase-js';

const BASE_CURRENCY = process.env.BASE_CURRENCY || 'SGD';

export function getBaseCurrency(): string {
  return BASE_CURRENCY;
}

/**
 * Look up FX rate for a given date. If no rate on txn_date, use latest prior date.
 */
export async function getFxRate(
  supabase: SupabaseClient,
  rateDate: Date,
  fromCurrency: string,
  toCurrency: string = BASE_CURRENCY
): Promise<{ rate: number; source: string; rateDate: string } | null> {
  const dateStr = rateDate.toISOString().split('T')[0];

  // Try exact date first
  const { data: exact } = await supabase
    .from('fx_rates')
    .select('rate, source, rate_date')
    .eq('rate_date', dateStr)
    .eq('base', fromCurrency)
    .eq('quote', toCurrency)
    .limit(1)
    .maybeSingle();

  if (exact) {
    return {
      rate: Number(exact.rate),
      source: exact.source,
      rateDate: exact.rate_date,
    };
  }

  // Fallback: latest prior date
  const { data: prior } = await supabase
    .from('fx_rates')
    .select('rate, source, rate_date')
    .eq('base', fromCurrency)
    .eq('quote', toCurrency)
    .lt('rate_date', dateStr)
    .order('rate_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (prior) {
    return {
      rate: Number(prior.rate),
      source: prior.source,
      rateDate: prior.rate_date,
    };
  }

  return null;
}

/**
 * Convert amount from original currency to base currency.
 */
export async function convertToBase(
  supabase: SupabaseClient,
  amount: number,
  fromCurrency: string,
  txnDate: Date
): Promise<{ amountBase: number; fxRate: number; fxSource: string; rateDate: string } | null> {
  if (fromCurrency.toUpperCase() === BASE_CURRENCY) {
    return {
      amountBase: amount,
      fxRate: 1,
      fxSource: 'identity',
      rateDate: txnDate.toISOString().split('T')[0],
    };
  }

  const fx = await getFxRate(supabase, txnDate, fromCurrency, BASE_CURRENCY);
  if (!fx) return null;

  return {
    amountBase: Math.round(amount * fx.rate * 100) / 100,
    fxRate: fx.rate,
    fxSource: fx.source,
    rateDate: fx.rateDate,
  };
}
