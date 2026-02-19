-- Expense AI Assistant - Initial Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  txn_date DATE,
  merchant_raw TEXT,
  merchant_normalized TEXT,
  amount_original NUMERIC(18,2),
  currency_original TEXT,
  amount_base NUMERIC(18,2),
  currency_base TEXT NOT NULL DEFAULT 'SGD',
  fx_rate_used NUMERIC(18,8),
  fx_source TEXT,
  category TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'extracted' CHECK (status IN ('extracted', 'needs_review', 'approved')),
  confidence REAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_txn_date ON expenses(txn_date);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_merchant ON expenses(merchant_normalized);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- Attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL DEFAULT 'receipts',
  path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  file_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attachments_expense_id ON attachments(expense_id);
CREATE INDEX idx_attachments_user_id ON attachments(user_id);

-- FX rates table (base/quote pairs per date)
CREATE TABLE fx_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_date DATE NOT NULL,
  base TEXT NOT NULL,
  quote TEXT NOT NULL,
  rate NUMERIC(18,8) NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(rate_date, base, quote, source)
);

CREATE INDEX idx_fx_rates_lookup ON fx_rates(rate_date, base, quote);
CREATE INDEX idx_fx_rates_date ON fx_rates(rate_date);

-- Optional: forecasts table for caching
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forecast_month DATE NOT NULL,
  amount_base NUMERIC(18,2) NOT NULL,
  lower_bound NUMERIC(18,2),
  upper_bound NUMERIC(18,2),
  method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, forecast_month)
);

CREATE INDEX idx_forecasts_user_month ON forecasts(user_id, forecast_month);

-- Updated_at trigger for expenses
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

-- Expenses RLS
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Attachments RLS
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attachments"
  ON attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attachments"
  ON attachments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (auth.uid() = user_id);

-- FX rates: readable by authenticated users (for conversion)
CREATE POLICY "Authenticated users can read fx_rates"
  ON fx_rates FOR SELECT
  TO authenticated
  USING (true);

-- FX rates: no insert/update for anon - use service role for sync
-- (Service role bypasses RLS)

-- Forecasts RLS
CREATE POLICY "Users can view own forecasts"
  ON forecasts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forecasts"
  ON forecasts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forecasts"
  ON forecasts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forecasts"
  ON forecasts FOR DELETE
  USING (auth.uid() = user_id);

