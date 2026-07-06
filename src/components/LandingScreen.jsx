import { useState } from 'react';
import { getOrCreateRoom } from '../lib/supabase';

function genRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

export default function LandingScreen({ onStart, initialRoom }) {
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    const id = genRoomId();
    await getOrCreateRoom(id);
    const url = `${window.location.origin}/?room=${id}`;
    window.history.pushState({}, '', `/?room=${id}`);
    onStart(id);
    setLoading(false);
  };

  const joinRoom = async () => {
    const code = joinCode.trim().toLowerCase();
    if (!code) return;
    setLoading(true);
    await getOrCreateRoom(code);
    window.history.pushState({}, '', `/?room=${code}`);
    onStart(code);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <div className="hdr">
        <div className="hdr-left" />
        <div className="hdr-center">
          <div className="hdr-title">AI 裁 判 所</div>
          <div className="hdr-sub">COUPLE'S COURT</div>
        </div>
        <div className="hdr-right" />
      </div>

      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '2rem 1.2rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>

        {/* キャッチコピー */}
        <div style={{ textAlign: 'center', paddingTop: '.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.6rem' }}>💑</div>
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', fontWeight: 900, lineHeight: 1.6, letterSpacing: '.04em' }}>
            カップルのもめ事、<br />AIに公平に裁いてもらおう
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--gray)', marginTop: '.6rem', lineHeight: 1.7 }}>
            言った言わない、もう終わりにしませんか。<br />
            別々のスマホで、それぞれの言い分を入力。
          </div>
        </div>

        {/* 特徴 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
          {[
            { emoji: '📱', title: '別々のスマホで', desc: '招待URLで相手を呼ぼう' },
            { emoji: '🤖', title: 'AI弁護士', desc: '弁論前にアドバイスをもらえる' },
            { emoji: '⚖️', title: '公正な判決', desc: 'AI裁判長が客観的に判断' },
            { emoji: '📊', title: '喧嘩ログ', desc: 'パターン分析・統計が見れる' },
          ].map(f => (
            <div key={f.title} style={{
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
              background: 'var(--white)', padding: '.8rem .9rem',
            }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '.2rem' }}>{f.emoji}</div>
              <div style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: '.1rem' }}>{f.title}</div>
              <div style={{ fontSize: '.64rem', color: 'var(--gray)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* メインCTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
          <button
            className="btn btn-gold"
            style={{ fontSize: '1rem', padding: '1rem', letterSpacing: '.12em' }}
            onClick={createRoom}
            disabled={loading}
          >
            {loading ? '準備中...' : '新しい裁判を始める　⚖️'}
          </button>

          {!showJoin ? (
            <button
              style={{
                background: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                padding: '.75rem', fontSize: '.85rem', cursor: 'pointer', color: 'var(--ink)',
              }}
              onClick={() => setShowJoin(true)}
            >
              招待URLで参加する　→
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <input
                type="text"
                placeholder="ルームコード（例：abc123）"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                style={{ flex: 1 }}
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
              />
              <button className="btn" style={{ padding: '.75rem 1rem', fontSize: '.85rem' }} onClick={joinRoom} disabled={loading}>
                参加
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: '.62rem', color: 'var(--gray)', lineHeight: 1.7 }}>
            ※ エンターテインメント目的です。実際の法的効力はありません。
          </div>
        </div>

      </div>
    </div>
  );
}
