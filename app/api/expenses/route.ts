import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createExpenseSchema, expenseFilterSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = expenseFilterSchema.safeParse({
    date_from: searchParams.get('date_from') || undefined,
    date_to: searchParams.get('date_to') || undefined,
    category: searchParams.get('category') || undefined,
    merchant: searchParams.get('merchant') || undefined,
    status: searchParams.get('status') || undefined,
    limit: searchParams.get('limit') || undefined,
    offset: searchParams.get('offset') || undefined,
    sort_by: searchParams.get('sort_by') || undefined,
    sort_order: searchParams.get('sort_order') || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { date_from, date_to, category, merchant, status, limit, offset, sort_by, sort_order } =
    parsed.data;

  let query = supabase
    .from('expenses')
    .select('*, attachments(id, file_name, path)', { count: 'exact' })
    .eq('user_id', user.id)
    .range(offset, offset + limit - 1)
    .order(sort_by, { ascending: sort_order === 'asc' });

  if (date_from) query = query.gte('txn_date', date_from);
  if (date_to) query = query.lte('txn_date', date_to);
  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (merchant)
    query = query.or(
      `merchant_raw.ilike.%${merchant}%,merchant_normalized.ilike.%${merchant}%`
    );

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const baseCurrency = process.env.BASE_CURRENCY || 'SGD';

  const insert = {
    user_id: user.id,
    txn_date: parsed.data.txn_date || null,
    merchant_raw: parsed.data.merchant_raw || null,
    merchant_normalized: parsed.data.merchant_normalized || null,
    amount_original: parsed.data.amount_original ?? null,
    currency_original: parsed.data.currency_original || null,
    category: parsed.data.category || null,
    notes: parsed.data.notes || null,
    status: parsed.data.status || 'extracted',
    currency_base: baseCurrency,
  };

  const { data, error } = await supabase.from('expenses').insert(insert).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
