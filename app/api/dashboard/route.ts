import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getMonthlyTotals,
  getCategoryTotals,
  getCurrencyTotals,
  getTopMerchants,
} from '@/lib/analytics';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get('date_from') || undefined;
  const dateTo = searchParams.get('date_to') || undefined;

  try {
    const [monthly, byCategory, byCurrency, topMerchants] = await Promise.all([
      getMonthlyTotals(supabase, user.id, 12),
      getCategoryTotals(supabase, user.id, dateFrom, dateTo),
      getCurrencyTotals(supabase, user.id, dateFrom, dateTo),
      getTopMerchants(supabase, user.id, 10, dateFrom, dateTo),
    ]);

    return NextResponse.json({
      data: {
        monthly,
        byCategory,
        byCurrency,
        topMerchants,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
