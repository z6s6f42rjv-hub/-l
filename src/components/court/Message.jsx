export function MsgJudge({ text, judgeEmoji, judgeName }) {
  return (
    <div className="msg-judge">
      <div className="msg-judge-emoji">{judgeEmoji}</div>
      <div className="msg-judge-who">{judgeName} 裁判長</div>
      <div className="msg-judge-text">{text}</div>
    </div>
  );
}

export function MsgPlaintiff({ name, text }) {
  return (
    <div className="msg-p">
      <div className="msg-avatar pc">🙋</div>
      <div className="msg-body">
        <div className="msg-who pc">{name}（申立人）</div>
        <div className="msg-bubble pc">{text}</div>
      </div>
    </div>
  );
}

export function MsgDefendant({ name, text }) {
  return (
    <div className="msg-d">
      <div className="msg-avatar dc">🙋</div>
      <div className="msg-body">
        <div className="msg-who dc">{name}（相手方）</div>
        <div className="msg-bubble dc">{text}</div>
      </div>
    </div>
  );
}

export function MsgSys({ text }) {
  return (
    <div className="msg-p">
      <div className="msg-body">
        <div className="msg-bubble sys">{text}</div>
      </div>
    </div>
  );
}

export function MsgLoading({ judgeEmoji }) {
  return (
    <div className="msg-judge">
      <div className="msg-judge-emoji">{judgeEmoji || '👨‍⚖️'}</div>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  );
}

export function CaseCard({ plaintiff, defendant, trouble, notes }) {
  return (
    <div className="case-card">
      <div className="case-card-title">◆ 事件の概要 ◆</div>
      <div className="case-card-body">
        <strong>{plaintiff}</strong>（原告）対 <strong>{defendant}</strong>（被告）<br />
        内容：{trouble}
        {notes && <><br />補足：{notes}</>}
      </div>
    </div>
  );
}
