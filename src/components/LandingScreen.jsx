const TARGETS = [
  { emoji: '👨‍👩‍👧', label: '親子', desc: 'ゲームの時間、お手伝い、門限…' },
  { emoji: '👫', label: '兄弟・姉妹', desc: 'リモコン争い、おやつの分け方…' },
  { emoji: '💑', label: '夫婦・カップル', desc: '家事分担、お金の使い方…' },
  { emoji: '👥', label: '友達', desc: 'ドタキャン、貸し借り、一言多い…' },
];

const EXAMPLES = [
  '「宿題終わってないのにゲームしてた」',
  '「勝手にポテチ食べた」',
  '「洗い物いつも私だけ」',
  '「ドタキャンされた」',
];

export default function LandingScreen({ onStart }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      {/* ヘッダー */}
      <div className="hdr">
        <div className="hdr-left" />
        <div className="hdr-center">
          <div className="hdr-title">AI 裁 判 所</div>
          <div className="hdr-sub">ARTIFICIAL INTELLIGENCE COURT</div>
        </div>
        <div className="hdr-right" />
      </div>

      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '2rem 1.2rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>

        {/* キャッチコピー */}
        <div style={{ textAlign: 'center', paddingTop: '.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.6rem' }}>⚖️</div>
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 900, lineHeight: 1.6, letterSpacing: '.04em' }}>
            家族・友達との<br />もめ事、AIに裁いてもらおう
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--gray)', marginTop: '.6rem', lineHeight: 1.7 }}>
            言った言わない、もう終わりにしませんか。
          </div>
        </div>

        {/* こんな人に */}
        <div>
          <div className="lbl" style={{ justifyContent: 'center', marginBottom: '.7rem' }}>こんなもめ事ありませんか？</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
            {TARGETS.map(t => (
              <div key={t.label} style={{
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                background: 'var(--white)', padding: '.8rem .9rem',
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '.25rem' }}>{t.emoji}</div>
                <div style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: '.15rem' }}>{t.label}</div>
                <div style={{ fontSize: '.65rem', color: 'var(--gray)', lineHeight: 1.55 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 実例 */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '.9rem 1rem', border: '1px solid var(--border)' }}>
          <div className="lbl" style={{ marginBottom: '.6rem' }}>実際にあった訴状</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
            {EXAMPLES.map((ex, i) => (
              <div key={i} style={{ fontSize: '.76rem', color: 'var(--ink)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--gold)', marginRight: '.3rem' }}>◆</span>{ex}
              </div>
            ))}
          </div>
        </div>

        {/* 使い方 */}
        <div>
          <div className="lbl" style={{ marginBottom: '.6rem' }}>使い方（3ステップ）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {[
              { step: '01', text: '原告・被告の名前ともめ事を入力' },
              { step: '02', text: 'それぞれスマホで自分の言い分を入力' },
              { step: '03', text: 'AIが公正に審理して判決を下す' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--ink)',
                  color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.58rem', fontWeight: 700, flexShrink: 0,
                }}>{s.step}</div>
                <div style={{ fontSize: '.8rem', lineHeight: 1.6 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          <button className="btn btn-gold" style={{ fontSize: '1rem', padding: '1rem', letterSpacing: '.18em' }} onClick={onStart}>
            開　廷　する　⚖️
          </button>
          <div style={{ textAlign: 'center', fontSize: '.62rem', color: 'var(--gray)', lineHeight: 1.7 }}>
            ※ このアプリはエンターテインメント目的です。<br />実際の法的効力はありません。
          </div>
        </div>

      </div>
    </div>
  );
}
