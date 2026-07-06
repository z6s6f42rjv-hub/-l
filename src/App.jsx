import { useState } from 'react';
import { useGameFlow } from './hooks/useGameFlow';
import LandingScreen from './components/LandingScreen';
import WizardScreen from './components/wizard/WizardScreen';
import PassScreen from './components/PassScreen';
import InputScreen from './components/InputScreen';
import CourtScreen from './components/court/CourtScreen';

export default function App() {
  const [screen, setScreen] = useState('landing');

  const {
    messages, courtAction, stageLabel, roundDots,
    passState, inputState,
    runOpening, runNextRound, runFinal, runVerdict, runAppeal,
    getGameState,
  } = useGameFlow(setScreen);

  const G = getGameState();

  const passWithName = passState
    ? { ...passState, name: passState.role === 'plaintiff' ? G.plaintiff : G.defendant }
    : null;

  const inputWithName = inputState
    ? { ...inputState, name: inputState.role === 'plaintiff' ? G.plaintiff : G.defendant }
    : null;

  if (screen === 'landing') {
    return <LandingScreen onStart={() => setScreen('wizard')} />;
  }
  if (screen === 'wizard') {
    return <WizardScreen onStart={runOpening} />;
  }
  if (screen === 'pass') {
    return <PassScreen passState={passWithName} caseNum={G.caseNum} onReady={() => passState?.cb()} />;
  }
  if (screen === 'input') {
    return <InputScreen inputState={inputWithName} caseNum={G.caseNum} onSubmit={(val) => inputState?.cb(val)} />;
  }
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
      onVerdict={runVerdict}
      onAppeal={runAppeal}
      onRestart={() => setScreen('landing')}
    />
  );
}
