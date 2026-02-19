'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  status: 'extracted' | 'needs_review' | 'approved';
}

interface ExpenseTableProps {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  merchant?: string;
  status?: string;
}

const baseCurrency = process.env.NEXT_PUBLIC_BASE_CURRENCY || 'SGD';

export default function ExpenseTable({
  dateFrom,
  dateTo,
  category,
  merchant,
  status,
}: ExpenseTableProps) {
  const [data, setData] = useState<Expense[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('txn_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (category) params.set('category', category);
    if (merchant) params.set('merchant', merchant);
    if (status) params.set('status', status);
    params.set('sort_by', sortBy);
    params.set('sort_order', sortOrder);
    params.set('limit', '50');

    setLoading(true);
    fetch(`/api/expenses?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setData(res.data);
          setCount(res.count ?? res.data.length);
        }
      })
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, category, merchant, status, sortBy, sortOrder]);

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const Th = ({
    col,
    label,
    sortable = true,
  }: {
    col: string;
    label: string;
    sortable?: boolean;
  }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 ${
        sortable ? 'cursor-pointer hover:bg-slate-50' : ''
      }`}
      onClick={sortable ? () => toggleSort(col) : undefined}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortable && sortBy === col && (
          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-500">
        No expenses found. Upload a receipt to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <Th col="txn_date" label="Date" />
            <Th col="merchant_normalized" label="Merchant" />
            <Th col="amount_base" label={`Amount (${baseCurrency})`} />
            <Th col="category" label="Category" />
            <Th col="status" label="Status" sortable={false} />
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                {row.txn_date || '—'}
              </td>
              <td className="px-4 py-3 text-sm text-slate-900">
                {row.merchant_normalized || row.merchant_raw || '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                {row.amount_base != null
                  ? row.amount_base.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })
                  : '—'}
              </td>
              <td className="px-4 py-3 text-sm text-slate-900">
                {row.category || '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                <Link
                  href={`/expenses/${row.id}`}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-slate-50 px-4 py-2 text-sm text-slate-500">
        Showing {data.length} of {count} expenses
      </div>
    </div>
  );
}
