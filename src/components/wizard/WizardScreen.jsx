import { useState } from 'react';
import Header from '../shared/Header';
import WizBar from './WizBar';
import Step0 from './Step0';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

const INIT = { plaintiff: '', defendant: '', trouble: '', notes: '', mode: 'speed', diff: 'normal' };

export default function WizardScreen({ onStart }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INIT);

  const change = (key, val) => setData(d => ({ ...d, [key]: val }));
  const next = () => { setStep(s => s + 1); window.scrollTo(0, 0); };
  const prev = () => { setStep(s => s - 1); window.scrollTo(0, 0); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="screen-anim">
      <Header sub="ARTIFICIAL INTELLIGENCE COURT" />
      <WizBar step={step} />
      <div className="page">
        {step === 0 && <Step0 data={data} onChange={change} onNext={next} />}
        {step === 1 && <Step1 data={data} onChange={change} onNext={next} onPrev={prev} />}
        {step === 2 && <Step2 data={data} onChange={change} onNext={next} onPrev={prev} />}
        {step === 3 && <Step3 data={data} onStart={() => onStart(data)} onPrev={prev} />}
      </div>
    </div>
  );
}
