const STEPS = ['当事者', 'もめ事', '設定', '確認'];

export default function WizBar({ step }) {
  return (
    <div className="wiz-bar">
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div className={`wdot ${i === step ? 'active' : i < step ? 'done' : ''}`}>
            {i < step ? '✓' : i + 1}
          </div>
          <div className={`wlbl ${i === step ? 'active' : ''}`}>{label}</div>
          {i < STEPS.length - 1 && <div className={`wline ${i < step ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );
}
