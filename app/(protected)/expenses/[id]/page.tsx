import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReviewForm from '@/components/ReviewForm';
import StatusBadge from '@/components/StatusBadge';

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: expense, error } = await supabase
    .from('expenses')
    .select('*, attachments(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !expense) {
    notFound();
  }

  const baseCurrency = process.env.BASE_CURRENCY || 'SGD';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/expenses"
            className="text-slate-600 hover:text-slate-900"
          >
            ← Back to expenses
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {expense.merchant_normalized || expense.merchant_raw || 'Expense'}
          </h1>
          <StatusBadge status={expense.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Details
          </h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">Date</dt>
              <dd>{expense.txn_date || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Amount (original)</dt>
              <dd>
                {expense.amount_original != null && expense.currency_original
                  ? `${expense.amount_original.toLocaleString()} ${expense.currency_original}`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Amount ({baseCurrency})</dt>
              <dd>
                {expense.amount_base != null
                  ? expense.amount_base.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd>{expense.category || '—'}</dd>
            </div>
            {expense.attachments && (expense.attachments as unknown[]).length > 0 && (
              <div>
                <dt className="text-slate-500">Attachments</dt>
                <dd>
                  {(expense.attachments as { file_name: string }[]).map(
                    (a) => a.file_name
                  ).join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ReviewForm expenseId={id} />
        </div>
      </div>
    </div>
  );
}
