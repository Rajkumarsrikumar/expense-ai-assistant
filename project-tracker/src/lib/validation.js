import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Blocked', 'On Hold', 'Completed', 'Cancelled']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  progress: z.number().min(0).max(100),
  start_date: z.string().optional().nullable(),
  target_date: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  owner_label: z.string().optional().nullable(),
});

export const profileSchema = z.object({
  full_name: z.string().optional(),
  role: z.string().optional(),
  timezone: z.string().optional(),
});
