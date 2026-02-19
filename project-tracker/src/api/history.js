import { supabase } from '../lib/supabase';

export async function fetchHistory(userId, projectId) {
  const { data, error } = await supabase
    .from('history_entries')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  return { data: data || [], error };
}

// Note: status_change and progress_update are handled by DB trigger.
// Frontend only inserts: note, field_edit
export async function addHistoryEntry(userId, projectId, { type, from_value, to_value, note }) {
  const { data, error } = await supabase
    .from('history_entries')
    .insert({
      user_id: userId,
      project_id: projectId,
      type,
      from_value: from_value ?? null,
      to_value: to_value ?? null,
      note: note ?? null,
    })
    .select()
    .single();
  return { data, error };
}
