import { supabase } from '../lib/supabase';

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function upsertProfile(userId, { full_name, role, timezone }) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, full_name, role, timezone, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select()
    .single();
  return { data, error };
}
