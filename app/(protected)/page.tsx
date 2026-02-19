import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const features = [
  {
    href: '/dashboard',
    title: 'Dashboard',
    description: 'View spending overview, charts, and insights',
    icon: '📊',
  },
  {
    href: '/upload',
    title: 'Upload Receipts',
    description: 'Upload receipts for AI-powered extraction',
    icon: '📤',
  },
  {
    href: '/expenses',
    title: 'Expenses',
    description: 'Browse and manage your expense records',
    icon: '📋',
  },
  {
    href: '/forecast',
    title: 'Forecast',
    description: 'See spending forecasts and trends',
    icon: '📈',
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const displayName = user?.email?.split('@')[0];
  const greeting = displayName ? `Welcome back, ${displayName}` : 'Welcome';

  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          {greeting}
        </h1>
        <p className="text-slate-600">
          Your expense tracking hub. Choose where to go next.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
          >
            <span className="mb-3 block text-3xl">{item.icon}</span>
            <h2 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-primary-600">
              {item.title}
            </h2>
            <p className="text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
