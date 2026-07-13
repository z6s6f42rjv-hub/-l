import { useState, useEffect } from 'react';
import { useGameFlow } from './hooks/useGameFlow';
import LandingScreen from './components/LandingScreen';
import WizardScreen from './components/wizard/WizardScreen';
import PassScreen from './components/PassScreen';
import InputScreen from './components/InputScreen';
import CourtScreen from './components/court/CourtScreen';
import StatsScreen from './components/StatsScreen';
import RolePickScreen from './components/RolePickScreen';
import RespondScreen from './components/RespondScreen';
import WaitingScreen from './components/WaitingScreen';

function getRoomFromURL() {
  return new URLSearchParams(window.location.search).get('room');
}

function getStorageKey(roomId, key) {
  return `ai_court_${key}_${roomId}`;
}

export default function App() {
  const urlRoom = getRoomFromURL();
  const [roomId, setRoomId] = useState(urlRoom || null);

  // このデバイスがホスト（設定した側）かどうか
  const isHost = roomId ? !!sessionStorage.getItem(getStorageKey(roomId, 'host')) : true;

  // このデバイスのロール（ゲスト用）
  const [myRole, setMyRole] = useState(() => {
    if (!urlRoom) return null;
    return sessionStorage.getItem(getStorageKey(urlRoom, 'role')) || null;
  });
  const [myName, setMyName] = useState(() => {
    if (!urlRoom) return null;
    return sessionStorage.getItem(getStorageKey(urlRoom, 'name')) || null;
  });

  const [screen, setScreen] = useState(() => {
    if (urlRoom && !sessionStorage.getItem(getStorageKey(urlRoom, 'host'))) {
      return 'guest';
    }
    return 'landing';
  });

  const [waitingFor, setWaitingFor] = useState('');

  const {
    messages, courtAction, stageLabel, roundDots,
    passState, inputState,
    runOpening, runNextRound, runFinal, runLawyer, runVerdict, runAppeal,
    getGameState,
  } = useGameFlow(setScreen, roomId, setWaitingFor);

  const G = getGameState();

  const passWithName = passState
    ? { ...passState, name: passState.role === 'plaintiff' ? G.plaintiff : G.defendant }
    : null;

  const inputWithName = inputState
    ? { ...inputState, name: inputState.role === 'plaintiff' ? G.plaintiff : G.defendant }
    : null;

  const handleStart = (room) => {
    setRoomId(room);
    // ホストとして記録
    sessionStorage.setItem(getStorageKey(room, 'host'), '1');
    sessionStorage.setItem(getStorageKey(room, 'role'), 'plaintiff');
    window.history.pushState({}, '', `/?room=${room}`);
    setScreen('wizard');
  };

  const handleRolePick = (role, caseData) => {
    setMyRole(role);
    const name = role === 'plaintiff'
      ? (caseData.plaintiff_name || caseData.plaintiff)
      : (caseData.defendant_name || caseData.defendant);
    setMyName(name);
    sessionStorage.setItem(getStorageKey(roomId, 'role'), role);
    sessionStorage.setItem(getStorageKey(roomId, 'name'), name);
    setScreen('respond');
  };

  // ゲストフロー
  if (screen === 'guest' || (!isHost && urlRoom)) {
    if (!myRole) {
      return <RolePickScreen roomId={roomId} onPick={handleRolePick} />;
    }
    return <RespondScreen roomId={roomId} myRole={myRole} myName={myName} />;
  }

  if (screen === 'respond') {
    return <RespondScreen roomId={roomId} myRole={myRole} myName={myName} />;
  }

  // ホストフロー
  if (screen === 'landing') return <LandingScreen onStart={handleStart} />;
  if (screen === 'wizard') return <WizardScreen onStart={(data) => runOpening(data, roomId)} roomId={roomId} />;
  if (screen === 'pass') return <PassScreen passState={passWithName} caseNum={G.caseNum} onReady={() => passState?.cb()} />;
  if (screen === 'input') return <InputScreen inputState={inputWithName} caseNum={G.caseNum} onSubmit={(val) => inputState?.cb(val)} />;
  if (screen === 'waiting') return <WaitingScreen waitingFor={waitingFor} roomId={roomId} trouble={G.trouble} />;
  if (screen === 'stats') return <StatsScreen roomId={roomId} onBack={() => setScreen('landing')} />;

  return (
    <CourtScreen
      messages={messages}
      courtAction={courtAction}
      stageLabel={stageLabel}
      roundDots={roundDots}
      caseNum={G.caseNum}
      onStartRound={runNextRound}
      onNextRound={runNextRound}
      onFinal={runFinal}
      onLawyer={runLawyer}
      onVerdict={runVerdict}
      onAppeal={runAppeal}
      onRestart={() => setScreen('landing')}
      onStats={() => setScreen('stats')}
      roomId={roomId}
      trouble={G.trouble}
      plaintiff={G.plaintiff}
      defendant={G.defendant}
    />
  );
}
