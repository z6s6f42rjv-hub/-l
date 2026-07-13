import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rjwfngkylbegmdnnryej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_x-4h3f6d-O19BCIzeT-oNw_LDrOqgyS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getOrCreateRoom(roomId) {
  const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).single();
  if (error && error.code === 'PGRST116') {
    const { data: created } = await supabase.from('rooms').insert({ id: roomId }).select().single();
    return created;
  }
  return data;
}

export async function saveCase(roomId, caseData) {
  const { data, error } = await supabase
    .from('cases')
    .insert({
      room_id: roomId,
      plaintiff_name: caseData.plaintiff,
      defendant_name: caseData.defendant,
      trouble_text: caseData.trouble,
      ...caseData,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLatestCase(roomId) {
  const { data } = await supabase
    .from('cases')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
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

// 相手デバイス用：質問を保存して回答を待つ
export async function createPendingTurn(roomId, caseId, role, question, choices) {
  // 古い未回答ターンを削除
  await supabase.from('pending_turns').delete().eq('room_id', roomId).is('answer', null);
  const { data, error } = await supabase
    .from('pending_turns')
    .insert({ room_id: roomId, case_id: caseId, role, question, choices: choices || [] })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 相手デバイス用：自分の番の質問を取得
export async function getMyTurn(roomId, role) {
  const { data } = await supabase
    .from('pending_turns')
    .select('*')
    .eq('room_id', roomId)
    .eq('role', role)
    .is('answer', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data;
}

// 相手デバイス用：回答を送信
export async function answerTurn(turnId, answer) {
  const { error } = await supabase
    .from('pending_turns')
    .update({ answer, answered_at: new Date().toISOString() })
    .eq('id', turnId);
  if (error) throw error;
}

// Person A側：回答が来るまでポーリング
export async function pollForAnswer(turnId) {
  const { data } = await supabase
    .from('pending_turns')
    .select('answer')
    .eq('id', turnId)
    .single();
  return data?.answer || null;
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
