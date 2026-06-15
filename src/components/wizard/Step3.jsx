export default function Step3({ data, onStart, onPrev }) {
  const modeLabel = data.mode === 'speed' ? '⚡ スピード' : '⚖ じっくり';
  const diffLabel = data.diff === 'kids' ? 'こども' : data.diff === 'pro' ? '法廷モード' : 'ふつう';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
      <div>
        <div className="step-h">内容を確認してください</div>
        <div className="step-sub">問題なければ開廷します。</div>
      </div>
      <div className="confirm">
        <div className="confirm-hdr">◆ 訴状の概要 ◆</div>
        <div className="confirm-rows">
          <div className="crow"><div className="ckey">原　告</div><div className="cval">{data.plaintiff}</div></div>
          <div className="crow"><div className="ckey">被　告</div><div className="cval">{data.defendant}</div></div>
          <div className="crow"><div className="ckey">もめ事</div><div className="cval">{data.trouble}</div></div>
          {data.notes && <div className="crow"><div className="ckey">補　足</div><div className="cval">{data.notes}</div></div>}
          <div className="crow"><div className="ckey">審　理</div><div className="cval">{modeLabel}</div></div>
          <div className="crow"><div className="ckey">難易度</div><div className="cval">{diffLabel}</div></div>
        </div>
      </div>
      <div className="btns two">
        <button className="btn btn-ghost" onClick={onPrev}>◀　戻る</button>
        <button className="btn btn-gold" onClick={onStart}>開　廷　する</button>
      </div>
    </div>
  );
}
