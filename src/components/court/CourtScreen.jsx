import { useEffect, useRef } from 'react';
import Header from '../shared/Header';
import RoundIndicator from './RoundIndicator';
import VerdictDisplay from './VerdictDisplay';
import { MsgJudge, MsgPlaintiff, MsgDefendant, MsgSys, MsgLoading, CaseCard } from './Message';

export default function CourtScreen({
  messages, courtAction, stageLabel, roundDots, caseNum,
  onStartRound, onNextRound, onFinal, onLawyer, onVerdict, onAppeal, onRestart, onStats, roomId,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, courtAction]);

  const renderMsg = (msg, i) => {
    switch (msg.type) {
      case 'case-card': return <CaseCard key={i} {...msg} />;
      case 'judge': return <MsgJudge key={i} {...msg} />;
      case 'plaintiff': return <MsgPlaintiff key={i} {...msg} />;
      case 'defendant': return <MsgDefendant key={i} {...msg} />;
      case 'sys': return <MsgSys key={i} {...msg} />;
      case 'loading': return <MsgLoading key={i} />;
      default: return null;
    }
  };

  const renderAction = () => {
    if (!courtAction) return null;
    switch (courtAction.type) {
      case 'start-round':
        return <button className="btn" onClick={onStartRound}>審理を開始する　▶</button>;
      case 'next-round':
        return <button className="btn" onClick={onNextRound}>第{courtAction.round}ターンへ進む　▶</button>;
      case 'next-or-final':
        return (
          <div className="btns two">
            <button className="btn btn-outline" onClick={onNextRound}>さらに審理する</button>
            <button className="btn" onClick={onFinal}>最終弁論へ　▶</button>
          </div>
        );
      case 'go-lawyer':
        return (
          <div className="btns two">
            <button className="btn btn-outline" onClick={onFinal}>そのまま最終弁論</button>
            <button className="btn" onClick={onLawyer}>🤖 AI弁護士に相談　▶</button>
          </div>
        );
      case 'go-final':
        return <button className="btn" onClick={onFinal}>最終弁論へ　▶</button>;
      case 'go-verdict':
        return <button className="btn" onClick={onVerdict}>判決を下す　▶</button>;
      case 'verdict':
        return (
          <VerdictDisplay
            verdict={courtAction.verdict}
            plaintiff={courtAction.plaintiff}
            defendant={courtAction.defendant}
            caseNum={courtAction.caseNum}
            appealCount={courtAction.appealCount}
            onAppeal={onAppeal}
            onRestart={onRestart}
            onStats={onStats}
            roomId={roomId}
          />
        );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="screen-anim">
      <Header sub={stageLabel} caseNum={caseNum} />
      <div className="page-wide">
        <div className="speech-wrap">
          {messages.map(renderMsg)}
        </div>
        <RoundIndicator current={roundDots.current} max={roundDots.max} />
        <div>{renderAction()}</div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
