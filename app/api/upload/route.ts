import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'receipts';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const txn_date = formData.get('txn_date') as string | null;
  const merchant_raw = formData.get('merchant_raw') as string | null;
  const amount_original = formData.get('amount_original') as string | null;
  const currency_original = formData.get('currency_original') as string | null;
  const category = formData.get('category') as string | null;
  const notes = formData.get('notes') as string | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const baseCurrency = process.env.BASE_CURRENCY || 'SGD';

  // Create expense first (placeholder - extraction will fill in)
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      txn_date: txn_date || null,
      merchant_raw: merchant_raw || null,
      amount_original: amount_original ? parseFloat(amount_original) : null,
      currency_original: currency_original || null,
      category: category || null,
      notes: notes || null,
      status: 'extracted',
      currency_base: baseCurrency,
    })
    .select()
    .single();

  if (expenseError || !expense) {
    return NextResponse.json(
      { error: expenseError?.message || 'Failed to create expense' },
      { status: 500 }
    );
  }

  const ext = file.name.split('.').pop() || 'bin';
  const path = `${user.id}/${expense.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    await supabase.from('expenses').delete().eq('id', expense.id);
    return NextResponse.json(
      { error: uploadError.message || 'Upload failed' },
      { status: 500 }
    );
  }

  const { data: attachment, error: attachError } = await supabase
    .from('attachments')
    .insert({
      expense_id: expense.id,
      user_id: user.id,
      bucket: BUCKET,
      path,
      file_name: file.name,
      mime_type: file.type || null,
    })
    .select()
    .single();

  if (attachError) {
    await supabase.storage.from(BUCKET).remove([path]);
    await supabase.from('expenses').delete().eq('id', expense.id);
    return NextResponse.json(
      { error: attachError.message || 'Failed to create attachment' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: { expense, attachment },
    message: 'Upload successful. Run extract pipeline to populate fields.',
  });
}
