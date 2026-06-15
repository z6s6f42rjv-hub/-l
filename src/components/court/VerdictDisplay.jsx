import { useState } from 'react';

export default function VerdictDisplay({ verdict, plaintiff, defendant, caseNum, appealCount, onAppeal, onRestart }) {
  const [shareVisible, setShareVisible] = useState(false);
  const isP = verdict.winner === 'plaintiff';
  const winName = isP ? plaintiff : defendant;
  const pS = parseInt(verdict.plaintiff_score) || 50;
  const dS = parseInt(verdict.defendant_score) || 50;

  const copyText = () => {
    const t = `【AI裁判所 判決】\n${caseNum}\n${plaintiff} vs ${defendant}\n判決：${winName} の勝訴\n（原告${pS}pt / 被告${dS}pt）\n命令：${verdict.order || '—'}\n#AI裁判所`;
    navigator.clipboard.writeText(t).then(() => alert('コピーしました'));
  };

  return (
    <div className="verdict-wrap">
      {shareVisible && (
        <div>
          <div className="share-card">
            <div className="share-ttl">AI 裁 判 所 ｜ 判 決 書</div>
            <div className="share-result">{winName} の勝訴</div>
            <div className="share-det">
              {plaintiff}（{pS}pt） vs {defendant}（{dS}pt）<br />
              件名：{verdict.trouble}<br />
              命令：{verdict.order || '—'}
            </div>
            <div className="share-foot">{caseNum}</div>
          </div>
          <button className="btn btn-sm btn-ghost" style={{ marginTop: '.4rem' }} onClick={copyText}>判決文をコピー</button>
        </div>
      )}
      <div className="verdict-card">
        <div className="verdict-hdr">◆ 判 決 ◆</div>
        <div className="verdict-body">
          <div className={`verdict-winner ${isP ? 'pw' : 'dw'}`}>{winName} の勝訴</div>
          <div className="scores-row">
            <div className="score-box">
              <div className="score-label">原告 説得力</div>
              <div className="score-num pc">{pS}<span className="score-sub"> pt</span></div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '.3rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pS}%`, background: 'var(--P)', borderRadius: '2px' }} />
              </div>
            </div>
            <div className="score-box">
              <div className="score-label">被告 説得力</div>
              <div className="score-num dc">{dS}<span className="score-sub"> pt</span></div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '.3rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dS}%`, background: 'var(--D)', borderRadius: '2px' }} />
              </div>
            </div>
          </div>
          <div className="v-row"><strong>判決理由　</strong>{verdict.reason}</div>
          <div className="v-row"><strong>裁判所命令　</strong>{verdict.order}</div>
          <div className="v-stamp">{caseNum} — AI裁判所</div>
        </div>
      </div>
      <div className="law-box">
        <div className="law-title">▶ 関連法律の解説</div>
        <div className="law-text">{verdict.law_note}</div>
      </div>
      <div style={{ fontSize: '.6rem', color: 'var(--gray)', textAlign: 'center' }}>控訴回数：{appealCount} / 3</div>
      <div className="btns two">
        {appealCount < 3
          ? <button className="btn btn-outline" onClick={onAppeal}>控　訴　する</button>
          : <button className="btn" disabled>控訴不可</button>
        }
        <button className="btn btn-gold" onClick={() => setShareVisible(v => !v)}>判決をシェア</button>
      </div>
      <button className="btn btn-ghost" style={{ borderColor: 'var(--border)' }} onClick={onRestart}>もう一度あらそう</button>
    </div>
  );
}
