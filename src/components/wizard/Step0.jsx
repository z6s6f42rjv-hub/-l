export default function Step0({ data, onChange, onNext }) {
  const canNext = data.plaintiff.trim() && data.defendant.trim();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
      <div>
        <div className="step-h">誰が誰を訴えますか？</div>
        <div className="step-sub">ニックネームでも構いません。</div>
      </div>
      <div className="names-grid">
        <div className="field">
          <div className="lbl">原告 <span className="tag tag-p">訴える側</span></div>
          <input type="text" value={data.plaintiff} onChange={e => onChange('plaintiff', e.target.value)} placeholder="例：たろう" maxLength={20} />
        </div>
        <div className="field">
          <div className="lbl">被告 <span className="tag tag-d">訴えられる側</span></div>
          <input type="text" value={data.defendant} onChange={e => onChange('defendant', e.target.value)} placeholder="例：はなこ" maxLength={20} />
        </div>
      </div>
      <div className="btns one">
        <button className="btn" onClick={() => { if (!canNext) { alert('原告名と被告名を入力してください'); return; } onNext(); }}>次へ　▶</button>
      </div>
    </div>
  );
}
