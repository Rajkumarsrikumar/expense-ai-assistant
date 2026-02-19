'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';

interface Expense {
  id: string;
  txn_date: string | null;
  merchant_raw: string | null;
  merchant_normalized: string | null;
  amount_original: number | null;
  currency_original: string | null;
  amount_base: number | null;
  category: string | null;
  notes: string | null;
  status: 'extracted' | 'needs_review' | 'approved';
}

const baseCurrency = process.env.NEXT_PUBLIC_BASE_CURRENCY || 'SGD';

export default function ReviewForm({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Expense>>({});

  useEffect(() => {
    fetch(`/api/expenses/${expenseId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setExpense(res.data);
          setForm({
            txn_date: res.data.txn_date || '',
            merchant_raw: res.data.merchant_raw || '',
            merchant_normalized: res.data.merchant_normalized || '',
            amount_original: res.data.amount_original,
            currency_original: res.data.currency_original || 'SGD',
            category: res.data.category || '',
            notes: res.data.notes || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [expenseId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txn_date: form.txn_date || null,
          merchant_raw: form.merchant_raw || null,
          merchant_normalized: form.merchant_normalized || null,
          amount_original: form.amount_original ?? null,
          currency_original: form.currency_original || null,
          category: form.category || null,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setExpense(json.data);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: 'approved',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setExpense(json.data);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !expense) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Review & Edit</h2>
        <StatusBadge status={expense.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Transaction date
          </label>
          <input
            type="date"
            value={form.txn_date || ''}
            onChange={(e) => setForm((f) => ({ ...f, txn_date: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Merchant
          </label>
          <input
            type="text"
            value={form.merchant_raw || ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, merchant_raw: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Amount (original)
          </label>
          <input
            type="number"
            step="0.01"
            value={form.amount_original ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                amount_original: e.target.value
                  ? parseFloat(e.target.value)
                  : null,
              }))
            }
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Currency
          </label>
          <select
            value={form.currency_original || 'SGD'}
            onChange={(e) =>
              setForm((f) => ({ ...f, currency_original: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
          >
            <option value="SGD">SGD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Amount ({baseCurrency})
        </label>
        <p className="mt-1 text-slate-600">
          {expense.amount_base != null
            ? expense.amount_base.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })
            : '—'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          value={form.category || ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, category: e.target.value || null }))
          }
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
        >
          <option value="">Select...</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Utilities">Utilities</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Entertainment">Entertainment</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          value={form.notes || ''}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-slate-600 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        {expense.status !== 'approved' && (
          <button
            onClick={handleApprove}
            disabled={saving}
            className="rounded-md bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
