import { supabase } from '../lib/supabase';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Blocked', 'On Hold', 'Completed', 'Cancelled'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export { STATUS_OPTIONS, PRIORITY_OPTIONS };

export async function fetchProjects(userId, filters = {}) {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.tag) query = query.contains('tags', [filters.tag]);
  if (filters.overdue) {
    const today = new Date().toISOString().split('T')[0];
    query = query
      .lt('target_date', today)
      .not('status', 'in', '(Completed,Cancelled)');
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function fetchProject(userId, projectId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();
  return { data, error };
}

export async function createProject(userId, project) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: project.name,
      description: project.description ?? null,
      status: project.status ?? 'Not Started',
      priority: project.priority ?? 'Medium',
      progress: project.progress ?? 0,
      start_date: project.start_date || null,
      target_date: project.target_date || null,
      tags: project.tags ?? [],
      owner_label: project.owner_label ?? null,
    })
    .select()
    .single();
  return { data, error };
}

export async function updateProject(userId, projectId, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single();
  return { data, error };
}

export async function deleteProject(userId, projectId) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);
  return { error };
}

export function isOverdue(project) {
  if (!project.target_date || ['Completed', 'Cancelled'].includes(project.status)) return false;
  return project.target_date < new Date().toISOString().split('T')[0];
}
