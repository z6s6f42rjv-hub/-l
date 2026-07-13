import { useState } from 'react';

export default function VerdictDisplay({ verdict, plaintiff, defendant, caseNum, appealCount, onAppeal, onRestart, onStats, roomId }) {
  const [shareVisible, setShareVisible] = useState(false);

  const copyText = () => {
    const t = `【AI調停所 調停案】\n${caseNum}\n${plaintiff} & ${defendant}\n\n調停案：${verdict.proposal || '—'}\n\nアドバイス：${verdict.advice || '—'}\n#AI調停所`;
    navigator.clipboard.writeText(t).then(() => alert('コピーしました'));
  };

  return (
    <div className="verdict-wrap">
      {shareVisible && (
        <div>
          <div className="share-card">
            <div className="share-ttl">AI 調 停 所 ｜ 調 停 案</div>
            <div className="share-result">調停成立</div>
            <div className="share-det">
              {plaintiff} & {defendant}<br />
              {verdict.proposal}
            </div>
            <div className="share-foot">{caseNum}</div>
          </div>
          <button className="btn btn-sm btn-ghost" style={{ marginTop: '.4rem' }} onClick={copyText}>調停案をコピー</button>
        </div>
      )}

      <div className="verdict-card">
        <div className="verdict-hdr">◆ 調 停 案 ◆</div>
        <div className="verdict-body">
          <div className="verdict-winner" style={{ fontSize: '1rem', color: 'var(--ink)' }}>調停成立 🤝</div>

          {/* 両者の気持ち */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', margin: '.8rem 0' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 6, padding: '.6rem .8rem', borderLeft: '3px solid var(--P)' }}>
              <div style={{ fontSize: '.6rem', fontWeight: 700, marginBottom: '.2rem', opacity: .7 }}>{plaintiff}の気持ち</div>
              <div style={{ fontSize: '.78rem', lineHeight: 1.6 }}>{verdict.plaintiff_feeling}</div>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: 6, padding: '.6rem .8rem', borderLeft: '3px solid var(--D)' }}>
              <div style={{ fontSize: '.6rem', fontWeight: 700, marginBottom: '.2rem', opacity: .7 }}>{defendant}の気持ち</div>
              <div style={{ fontSize: '.78rem', lineHeight: 1.6 }}>{verdict.defendant_feeling}</div>
            </div>
          </div>

          {verdict.common_ground && (
            <div className="v-row" style={{ background: 'rgba(0,0,0,.03)', borderRadius: 4, padding: '.4rem .6rem' }}>
              <strong>共通していたこと　</strong>{verdict.common_ground}
            </div>
          )}
          {verdict.assessment && (
            <div className="v-row" style={{ background: 'rgba(180,140,60,.08)', borderRadius: 4, padding: '.4rem .6rem', borderLeft: '3px solid var(--gold)' }}>
              <strong>⚖️ 調停員の見解　</strong>{verdict.assessment}
            </div>
          )}
          <div className="v-row"><strong>調停案　</strong>{verdict.proposal}</div>
          <div className="v-row"><strong>💑 アドバイス　</strong>{verdict.advice}</div>
          <div className="v-stamp">{caseNum} — AI調停所</div>
        </div>
      </div>

      <div style={{ fontSize: '.6rem', color: 'var(--gray)', textAlign: 'center' }}>再調停回数：{appealCount} / 3</div>
      <div className="btns two">
        {appealCount < 3
          ? <button className="btn btn-outline" onClick={onAppeal}>再調停する</button>
          : <button className="btn" disabled>再調停不可</button>
        }
        <button className="btn btn-gold" onClick={() => setShareVisible(v => !v)}>調停案をシェア</button>
      </div>
      <div className="btns two">
        <button className="btn btn-ghost" style={{ borderColor: 'var(--border)' }} onClick={onRestart}>もう一度話し合う</button>
        {roomId && onStats && <button className="btn btn-outline" onClick={onStats}>📊 記録を見る</button>}
      </div>
    </div>
  );
}
