import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMonthlyTotals } from '@/lib/analytics';
import { computeForecast } from '@/lib/analytics';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const monthly = await getMonthlyTotals(supabase, user.id, 12);
    const forecast = computeForecast(monthly);

    return NextResponse.json({
      data: {
        historical: monthly,
        forecast,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
