export default function Step1({ data, onChange, onNext, onPrev }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
      <div>
        <div className="step-h">何がもめ事ですか？</div>
        <div className="step-sub">1行で要約してください。詳細は備考に。</div>
      </div>
      <div className="field">
        <div className="lbl">もめ事の内容</div>
        <input type="text" value={data.trouble} onChange={e => onChange('trouble', e.target.value)} placeholder="例：ポテチを勝手に食べた" maxLength={60} />
      </div>
      <div className="field">
        <div className="lbl">補足・状況 <span className="tag tag-opt">任意</span></div>
        <textarea value={data.notes} onChange={e => onChange('notes', e.target.value)} rows={3} placeholder="経緯や状況など…" />
      </div>
      <div className="btns two">
        <button className="btn btn-ghost" onClick={onPrev}>◀　戻る</button>
        <button className="btn" onClick={() => { if (!data.trouble.trim()) { alert('もめ事の内容を入力してください'); return; } onNext(); }}>次へ　▶</button>
      </div>
    </div>
  );
}
