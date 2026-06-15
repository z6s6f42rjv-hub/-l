export default function Header({ sub, caseNum, onBack }) {
  return (
    <div className="hdr">
      <div className="hdr-left">
        {onBack && <button className="hdr-back" onClick={onBack}>◀ 戻る</button>}
      </div>
      <div className="hdr-center">
        <div className="hdr-title">AI 裁 判 所</div>
        {sub && <div className="hdr-sub">{sub}</div>}
      </div>
      <div className="hdr-right">
        {caseNum && <div className="case-badge">{caseNum}</div>}
      </div>
    </div>
  );
}
