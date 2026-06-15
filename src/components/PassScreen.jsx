import Header from './shared/Header';

export default function PassScreen({ passState, caseNum, onReady }) {
  if (!passState) return null;
  const { role, note } = passState;
  const isP = role === 'plaintiff';
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="screen-anim">
      <Header caseNum={caseNum} />
      <div className="pass-body">
        <div className="pass-emoji">🙋</div>
        <div className="pass-divider" />
        <div className={`pass-name ${isP ? 'pc' : 'dc'}`}>{passState.name}さん</div>
        <div className="pass-note">{note}</div>
        <div className="pass-divider" />
        <button className="btn pass-btn" onClick={onReady}>準備ができたら押す</button>
      </div>
    </div>
  );
}
