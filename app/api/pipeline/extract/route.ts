import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runStubExtractor } from '@/lib/pipeline';
import { convertToBase } from '@/lib/fx';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const expenseId = body.expense_id as string | undefined;

  if (!expenseId) {
    return NextResponse.json(
      { error: 'expense_id is required' },
      { status: 400 }
    );
  }

  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', expenseId)
    .eq('user_id', user.id)
    .single();

  if (expenseError || !expense) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
  }

  const { data: attachments } = await supabase
    .from('attachments')
    .select('*')
    .eq('expense_id', expenseId)
    .eq('user_id', user.id);

  const attachment = attachments?.[0];
  const filename = attachment?.file_name || 'unknown';
  const textInput = body.text_input as string | null | undefined;

  const extracted = runStubExtractor(filename, textInput);

  const txnDate = extracted.txn_date
    ? new Date(extracted.txn_date)
    : new Date();

  let amountBase: number | null = null;
  let fxRateUsed: number | null = null;
  let fxSource: string | null = null;

  if (extracted.amount_original != null && extracted.currency_original) {
    const converted = await convertToBase(
      supabase,
      extracted.amount_original,
      extracted.currency_original,
      txnDate
    );
    if (converted) {
      amountBase = converted.amountBase;
      fxRateUsed = converted.fxRate;
      fxSource = converted.fxSource;
    }
  }

  const baseCurrency = process.env.BASE_CURRENCY || 'SGD';

  const update = {
    txn_date: extracted.txn_date,
    merchant_raw: extracted.merchant_raw ?? expense.merchant_raw,
    merchant_normalized: extracted.merchant_normalized ?? expense.merchant_normalized,
    amount_original: extracted.amount_original ?? expense.amount_original,
    currency_original: extracted.currency_original ?? expense.currency_original,
    amount_base: amountBase ?? expense.amount_base,
    fx_rate_used: fxRateUsed ?? expense.fx_rate_used,
    fx_source: fxSource ?? expense.fx_source,
    category: extracted.category ?? expense.category,
    confidence: extracted.confidence,
    status: extracted.needs_review ? 'needs_review' : 'extracted',
    currency_base: baseCurrency,
  };

  const { data: updated, error: updateError } = await supabase
    .from('expenses')
    .update(update)
    .eq('id', expenseId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: updated,
    extraction: {
      confidence: extracted.confidence,
      needs_review: extracted.needs_review,
    },
  });
}
