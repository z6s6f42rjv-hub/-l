const MODES = [
  { value: 'speed', icon: '⚡', name: 'スピード', desc: '各1往復で即判決' },
  { value: 'full', icon: '⚖', name: 'じっくり', desc: '各2往復で深く審議' },
];
const DIFFS = [
  { value: 'kids', label: 'こども' },
  { value: 'normal', label: 'ふつう' },
  { value: 'pro', label: '法廷モード' },
];

export default function Step2({ data, onChange, onNext, onPrev }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
      <div><div className="step-h">審理の設定をしてください</div></div>
      <div className="field">
        <div className="lbl">審理の深さ</div>
        <div className="mode-grid">
          {MODES.map(m => (
            <label key={m.value} className={`mode-card ${data.mode === m.value ? 'selected' : ''}`} onClick={() => onChange('mode', m.value)}>
              <div className="mode-icon">{m.icon}</div>
              <div className="mode-name">{m.name}</div>
              <div className="mode-desc">{m.desc}</div>
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <div className="lbl">難易度</div>
        <div className="dpills">
          {DIFFS.map(d => (
            <div key={d.value} className={`dpill ${data.diff === d.value ? 'on' : ''}`} onClick={() => onChange('diff', d.value)}>{d.label}</div>
          ))}
        </div>
      </div>
      <div className="btns two">
        <button className="btn btn-ghost" onClick={onPrev}>◀　戻る</button>
        <button className="btn" onClick={onNext}>次へ　▶</button>
      </div>
    </div>
  );
}
