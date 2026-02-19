import { z } from 'zod';

export const expenseStatusSchema = z.enum(['extracted', 'needs_review', 'approved']);

export const createExpenseSchema = z.object({
  txn_date: z.string().optional().nullable(),
  merchant_raw: z.string().optional().nullable(),
  merchant_normalized: z.string().optional().nullable(),
  amount_original: z.number().optional().nullable(),
  currency_original: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: expenseStatusSchema.optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseFilterSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  category: z.string().optional(),
  merchant: z.string().optional(),
  status: expenseStatusSchema.optional(),
  limit: z.coerce.number().min(1).max(500).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
  sort_by: z.enum(['txn_date', 'created_at', 'amount_base', 'merchant_normalized']).optional().default('txn_date'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseFilterInput = z.infer<typeof expenseFilterSchema>;
