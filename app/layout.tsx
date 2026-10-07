import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Expense AI Assistant',
  description: 'Upload receipts, track expenses, and forecast spending',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased`}>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          Crafted and Owned by Niray IT Solutions
        </footer>
      </body>
    </html>
  );
}
