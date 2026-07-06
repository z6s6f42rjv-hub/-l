import { useEffect, useState } from 'react';
import { getRoomStats } from '../lib/supabase';
import Header from './shared/Header';

export default function StatsScreen({ roomId, onBack }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) { setLoading(false); return; }
    getRoomStats(roomId).then(data => {
      setCases(data);
      setLoading(false);
    });
  }, [roomId]);

  const wins = { plaintiff: 0, defendant: 0 };
  cases.forEach(c => { if (c.winner) wins[c.winner] = (wins[c.winner] || 0) + 1; });

  const names = cases.length > 0
    ? { plaintiff: cases[0].plaintiff, defendant: cases[0].defendant }
    : { plaintiff: '原告', defendant: '被告' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header sub="FIGHT LOG & STATS" />

      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '1.5rem 1.2rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <button
          onClick={onBack}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: '.8rem', color: 'var(--gray)', cursor: 'pointer', padding: 0 }}
        >
          ← 戻る
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '.3rem' }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>喧嘩ログ・統計</div>
          {roomId && <div style={{ fontSize: '.65rem', color: 'var(--gray)', marginTop: '.2rem' }}>ルーム: {roomId}</div>}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '.85rem' }}>読み込み中...</div>
        ) : cases.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '.85rem', lineHeight: 1.8 }}>
            まだ裁判の記録がありません。<br />最初の裁判をやってみよう！
          </div>
        ) : (
          <>
            {/* 勝敗統計 */}
            <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.2rem', background: 'var(--white)' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', marginBottom: '.8rem' }}>⚖️ 通算勝敗</div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900 }}>{wins.plaintiff || 0}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--gray)' }}>{names.plaintiff}の勝ち</div>
                </div>
                <div style={{ fontSize: '1.2rem', color: 'var(--border)' }}>vs</div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900 }}>{wins.defendant || 0}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--gray)' }}>{names.defendant}の勝ち</div>
                </div>
              </div>
              <div style={{ marginTop: '.8rem', fontSize: '.7rem', color: 'var(--gray)', textAlign: 'center' }}>
                合計 {cases.length} 件の裁判
              </div>
            </div>

            {/* 裁判ログ */}
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', marginBottom: '.6rem' }}>📋 裁判記録</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {cases.map((c, i) => (
                  <div key={c.id} style={{
                    border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                    padding: '.9rem 1rem', background: 'var(--white)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.4rem' }}>
                      <div style={{ fontSize: '.75rem', fontWeight: 700 }}>#{cases.length - i}</div>
                      <div style={{ fontSize: '.62rem', color: 'var(--gray)' }}>
                        {new Date(c.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    <div style={{ fontSize: '.78rem', lineHeight: 1.6, marginBottom: '.4rem' }}>
                      「{c.trouble}」
                    </div>
                    {c.winner && (
                      <div style={{
                        display: 'inline-block', fontSize: '.65rem', fontWeight: 700,
                        background: 'var(--ink)', color: 'var(--white)',
                        padding: '.2rem .5rem', borderRadius: 4,
                      }}>
                        {c.winner === 'plaintiff' ? c.plaintiff : c.defendant} の勝ち
                      </div>
                    )}
                    {c.verdict && (
                      <div style={{ fontSize: '.68rem', color: 'var(--gray)', marginTop: '.4rem', lineHeight: 1.6 }}>
                        {c.verdict.slice(0, 80)}{c.verdict.length > 80 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
