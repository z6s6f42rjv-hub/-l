import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rjwfngkylbegmdnnryej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_x-4h3f6d-O19BCIzeT-oNw_LDrOqgyS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getOrCreateRoom(roomId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();
  if (error && error.code === 'PGRST116') {
    const { data: created } = await supabase
      .from('rooms')
      .insert({ id: roomId })
      .select()
      .single();
    return created;
  }
  return data;
}

export async function saveCase(roomId, caseData) {
  const { data, error } = await supabase
    .from('cases')
    .insert({ room_id: roomId, ...caseData })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCase(caseId, updates) {
  const { error } = await supabase.from('cases').update(updates).eq('id', caseId);
  if (error) throw error;
}

export async function saveExchange(caseId, exchange) {
  const { error } = await supabase.from('exchanges').insert({ case_id: caseId, ...exchange });
  if (error) throw error;
}

export async function getRoomStats(roomId) {
  const { data: cases } = await supabase
    .from('cases')
    .select('*, exchanges(*)')
    .eq('room_id', roomId)
    .not('finished_at', 'is', null)
    .order('created_at', { ascending: false });
  return cases || [];
}
