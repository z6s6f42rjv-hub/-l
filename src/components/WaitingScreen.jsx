import { useState } from 'react';
import Header from './shared/Header';

export default function WaitingScreen({ waitingFor, roomId, trouble }) {
  const [memo, setMemo] = useState('');
  const inviteUrl = `${window.location.origin}/?room=${roomId}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header sub="相手の回答待ち" />

      {trouble && (
        <div style={{
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '.45rem 1rem', fontSize: '.68rem', color: 'var(--gray)',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--ink)' }}>議題　</span>「{trouble}」
        </div>
      )}

      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>📱</div>
          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{waitingFor} の回答待ち…</div>
          <div style={{ fontSize: '.72rem', color: 'var(--gray)', marginTop: '.3rem' }}>
            回答が届いたら自動で進みます
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27ae60', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>

        {/* 招待URL */}
        <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '.9rem 1rem', background: 'var(--white)' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, marginBottom: '.4rem', color: 'var(--gray)', letterSpacing: '.08em' }}>招待URL</div>
          <div style={{ fontSize: '.7rem', wordBreak: 'break-all', lineHeight: 1.7, color: 'var(--ink)', marginBottom: '.6rem' }}>{inviteUrl}</div>
          <button
            onClick={() => navigator.clipboard.writeText(inviteUrl).then(() => alert('コピーしました！'))}
            style={{
              background: 'var(--surface)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '.4rem .8rem',
              fontSize: '.72rem', cursor: 'pointer', width: '100%',
            }}
          >
            URLをコピー 📋
          </button>
        </div>

        {/* 待機中メモ */}
        <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '.9rem 1rem', background: 'var(--white)' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, marginBottom: '.4rem', color: 'var(--gray)', letterSpacing: '.08em' }}>✏️ 待機中メモ（自分だけ見えます）</div>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="相手が答えている間に、言いたいことや反論をメモしておこう…"
            style={{
              width: '100%', border: '1px solid var(--border)', borderRadius: 6,
              padding: '.6rem .7rem', fontSize: '.78rem', lineHeight: 1.7,
              resize: 'vertical', minHeight: 80, boxSizing: 'border-box',
              background: 'var(--surface)', fontFamily: 'inherit',
            }}
          />
          {memo && (
            <div style={{ fontSize: '.62rem', color: 'var(--gray)', marginTop: '.3rem', textAlign: 'right' }}>
              {memo.length}文字
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
