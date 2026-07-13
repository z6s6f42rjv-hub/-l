import { useState, useEffect } from 'react';
import { getLatestCase } from '../lib/supabase';
import Header from './shared/Header';

export default function RolePickScreen({ roomId, onPick }) {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const poll = async () => {
      const c = await getLatestCase(roomId);
      if (c) { setCaseData(c); setLoading(false); }
      else setTimeout(poll, 2000);
    };
    poll();
  }, [roomId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '2rem' }}>⏳</div>
      <div style={{ fontSize: '.85rem', color: 'var(--gray)' }}>相手が準備中です…</div>
      <div style={{ fontSize: '.7rem', color: 'var(--gray)' }}>このページを開いたまま待ってください</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header sub="招待で参加" />
      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '2rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>👋</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '.4rem' }}>あなたはどちらですか？</div>
          <div style={{ fontSize: '.75rem', color: 'var(--gray)', lineHeight: 1.7 }}>
            「{caseData.trouble_text || caseData.trouble}」<br />についての話し合いです
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
          <button
            className="btn"
            style={{ padding: '1.1rem', fontSize: '.95rem' }}
            onClick={() => onPick('plaintiff', caseData)}
          >
            {caseData.plaintiff_name || caseData.plaintiff} として参加
          </button>
          <button
            className="btn btn-outline"
            style={{ padding: '1.1rem', fontSize: '.95rem' }}
            onClick={() => onPick('defendant', caseData)}
          >
            {caseData.defendant_name || caseData.defendant} として参加
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '.65rem', color: 'var(--gray)', lineHeight: 1.7 }}>
          ルームID: {roomId}
        </div>
      </div>
    </div>
  );
}
