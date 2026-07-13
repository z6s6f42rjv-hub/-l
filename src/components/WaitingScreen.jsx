import Header from './shared/Header';

export default function WaitingScreen({ waitingFor, roomId }) {
  const inviteUrl = `${window.location.origin}/?room=${roomId}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header sub="相手の回答待ち" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', padding: '2rem 1.5rem' }}>
        <div style={{ fontSize: '2.5rem' }}>📱</div>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{waitingFor} の回答待ち…</div>
        <div style={{ fontSize: '.8rem', color: 'var(--gray)', textAlign: 'center', lineHeight: 1.8 }}>
          相手のスマホでこのURLを開いてもらってください
        </div>

        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '.8rem 1rem',
          fontSize: '.72rem', wordBreak: 'break-all', textAlign: 'center',
          lineHeight: 1.8, width: '100%', maxWidth: 360,
        }}>
          {inviteUrl}
        </div>

        <button
          className="btn btn-outline"
          style={{ fontSize: '.85rem', padding: '.7rem 1.5rem' }}
          onClick={() => {
            navigator.clipboard.writeText(inviteUrl).then(() => alert('コピーしました！'));
          }}
        >
          URLをコピー 📋
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27ae60', animation: 'pulse 1.5s infinite' }} />
          <div style={{ fontSize: '.7rem', color: 'var(--gray)' }}>回答が届いたら自動で進みます</div>
        </div>
      </div>
    </div>
  );
}
