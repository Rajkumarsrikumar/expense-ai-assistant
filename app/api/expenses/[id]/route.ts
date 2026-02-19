import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateExpenseSchema } from '@/lib/validation';
import { convertToBase } from '@/lib/fx';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from('expenses')
    .select('*, attachments(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const update: Record<string, unknown> = { ...parsed.data };

  // Recompute amount_base if amount_original or currency or txn_date changed
  const amt = update.amount_original ?? existing.amount_original;
  const curr = (update.currency_original as string) ?? existing.currency_original;
  const txnDateStr = (update.txn_date as string) ?? existing.txn_date;

  if (
    amt != null &&
    curr &&
    txnDateStr &&
    (update.amount_original !== undefined ||
      update.currency_original !== undefined ||
      update.txn_date !== undefined)
  ) {
    const txnDate = new Date(txnDateStr);
    const converted = await convertToBase(supabase, Number(amt), curr, txnDate);
    if (converted) {
      update.amount_base = converted.amountBase;
      update.fx_rate_used = converted.fxRate;
      update.fx_source = converted.fxSource;
    }
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
