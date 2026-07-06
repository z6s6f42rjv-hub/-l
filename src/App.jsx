import { useState, useEffect } from 'react';
import { useGameFlow } from './hooks/useGameFlow';
import LandingScreen from './components/LandingScreen';
import WizardScreen from './components/wizard/WizardScreen';
import PassScreen from './components/PassScreen';
import InputScreen from './components/InputScreen';
import CourtScreen from './components/court/CourtScreen';
import StatsScreen from './components/StatsScreen';

function getRoomFromURL() {
  return new URLSearchParams(window.location.search).get('room');
}

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [roomId, setRoomId] = useState(() => getRoomFromURL() || null);

  useEffect(() => {
    if (roomId && screen === 'landing') {
      setScreen('wizard');
    }
  }, []);

  const {
    messages, courtAction, stageLabel, roundDots,
    passState, inputState,
    runOpening, runNextRound, runFinal, runLawyer, runVerdict, runAppeal,
    getGameState,
  } = useGameFlow(setScreen, roomId);

  const G = getGameState();

  const passWithName = passState
    ? { ...passState, name: passState.role === 'plaintiff' ? G.plaintiff : G.defendant }
    : null;

  const inputWithName = inputState
    ? { ...inputState, name: inputState.role === 'plaintiff' ? G.plaintiff : G.defendant }
    : null;

  const handleStart = (room) => {
    setRoomId(room);
    setScreen('wizard');
  };

  if (screen === 'landing') return <LandingScreen onStart={handleStart} initialRoom={roomId} />;
  if (screen === 'wizard') return <WizardScreen onStart={(data) => runOpening(data, roomId)} roomId={roomId} />;
  if (screen === 'pass') return <PassScreen passState={passWithName} caseNum={G.caseNum} onReady={() => passState?.cb()} />;
  if (screen === 'input') return <InputScreen inputState={inputWithName} caseNum={G.caseNum} onSubmit={(val) => inputState?.cb(val)} />;
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
    />
  );
}
