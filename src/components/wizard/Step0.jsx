const RELATIONS = [
  { value: 'parent-child', label: '親子', emoji: '👨‍👧', placeholders: ['お父さん / お母さん', '子供の名前'] },
  { value: 'siblings',     label: '兄弟姉妹', emoji: '👫', placeholders: ['お兄ちゃん / お姉ちゃん', '弟 / 妹'] },
  { value: 'couple',       label: 'カップル', emoji: '💑', placeholders: ['あなたの名前', '相手の名前'] },
  { value: 'friends',      label: '友達',   emoji: '🤝', placeholders: ['あなたの名前', '友達の名前'] },
  { value: 'coworkers',    label: '同僚',   emoji: '💼', placeholders: ['あなたの名前', '同僚の名前'] },
  { value: 'other',        label: 'その他', emoji: '⚖️', placeholders: ['例：たろう', '例：はなこ'] },
];

export default function Step0({ data, onChange, onNext }) {
  const rel = RELATIONS.find(r => r.value === data.relationship) || RELATIONS[5];
  const canNext = data.plaintiff.trim() && data.defendant.trim() && data.relationship;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ターゲット説明カード */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3358 0%, #4a1515 100%)',
        borderRadius: '8px', padding: '1.2rem 1.1rem', color: '#fff',
      }}>
        <div style={{ fontSize: '.6rem', letterSpacing: '.2em', opacity: .7, marginBottom: '.4rem' }}>こんな人におすすめ</div>
        <div style={{ fontSize: '.88rem', lineHeight: 1.75 }}>
          家族のもめ事・友達とのトラブル・<br />
          カップルのすれ違い…どんなことでもOK！<br />
          <span style={{ fontSize: '.72rem', opacity: .8 }}>AIの裁判長が公平に判決を下します。</span>
        </div>
      </div>

      {/* 関係性選択 */}
      <div className="field">
        <div className="lbl">あなたたちの関係は？</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem' }}>
          {RELATIONS.map(r => (
            <div
              key={r.value}
              onClick={() => onChange('relationship', r.value)}
              style={{
                border: `1.5px solid ${data.relationship === r.value ? 'var(--ink)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                padding: '.65rem .4rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: data.relationship === r.value ? 'var(--surface)' : 'var(--white)',
                boxShadow: data.relationship === r.value ? 'inset 0 0 0 1px var(--ink)' : 'none',
                transition: 'all .15s',
                userSelect: 'none',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: '.2rem' }}>{r.emoji}</div>
              <div style={{ fontSize: '.68rem', fontWeight: 700 }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 名前入力 */}
      {data.relationship && (
        <div>
          <div className="step-h" style={{ fontSize: '1rem', marginBottom: '.2rem' }}>
            {rel.emoji} {rel.label}のもめ事ですね！
          </div>
          <div className="step-sub">ニックネームでも構いません。</div>
          <div className="names-grid" style={{ marginTop: '.8rem' }}>
            <div className="field">
              <div className="lbl">訴える側 <span className="tag tag-p">原告</span></div>
              <input
                type="text"
                value={data.plaintiff}
                onChange={e => onChange('plaintiff', e.target.value)}
                placeholder={rel.placeholders[0]}
                maxLength={20}
              />
            </div>
            <div className="field">
              <div className="lbl">訴えられる側 <span className="tag tag-d">被告</span></div>
              <input
                type="text"
                value={data.defendant}
                onChange={e => onChange('defendant', e.target.value)}
                placeholder={rel.placeholders[1]}
                maxLength={20}
              />
            </div>
          </div>
        </div>
      )}

      <div className="btns one">
        <button className="btn" onClick={() => {
          if (!data.relationship) { alert('関係性を選んでください'); return; }
          if (!canNext) { alert('お名前を入力してください'); return; }
          onNext();
        }}>次へ　▶</button>
      </div>
    </div>
  );
}
