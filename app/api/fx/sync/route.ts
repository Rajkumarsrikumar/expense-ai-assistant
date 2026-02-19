import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const BASE_CURRENCY = process.env.BASE_CURRENCY || 'SGD';

/**
 * Stub FX rate provider - seeds sample rates for recent days.
 * Replace with real provider (e.g. exchangerate-api, openexchangerates) later.
 */
function getStubRates(): { date: string; base: string; quote: string; rate: number }[] {
  const rates: { date: string; base: string; quote: string; rate: number }[] = [];
  const pairs: [string, number][] = [
    ['USD', 1.35],
    ['EUR', 1.46],
    ['GBP', 1.69],
    ['JPY', 0.0091],
    ['AUD', 0.88],
  ];

  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    for (const [quote, baseRate] of pairs) {
      rates.push({
        date: dateStr,
        base: BASE_CURRENCY,
        quote,
        rate: baseRate * (0.998 + Math.random() * 0.004),
      });
    }
  }

  return rates;
}

export async function POST() {
  let supabase;
  try {
    supabase = await createServiceClient();
  } catch {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY required' },
      { status: 500 }
    );
  }
  const rates = getStubRates();

  const rows = rates.map((r) => ({
    rate_date: r.date,
    base: r.base,
    quote: r.quote,
    rate: r.rate,
    source: 'stub',
  }));

  const { error } = await supabase.from('fx_rates').upsert(rows, {
    onConflict: 'rate_date,base,quote,source',
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `Synced ${rows.length} FX rates`,
    base: BASE_CURRENCY,
  });
}
