import ExpenseFilters from '@/components/ExpenseFilters';

export default function ExpensesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Expenses</h1>
      <ExpenseFilters />
    </div>
  );
}
