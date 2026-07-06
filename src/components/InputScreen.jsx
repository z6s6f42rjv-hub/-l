import { useState, useRef } from 'react';
import Header from './shared/Header';

export default function InputScreen({ inputState, caseNum, onSubmit }) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  if (!inputState) return null;
  const { role, questionText, labelText } = inputState;
  const isP = role === 'plaintiff';

  const handleSubmit = () => {
    if (!text.trim()) { alert('内容を入力してください'); return; }
    const val = text.trim();
    setText('');
    onSubmit(val);
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('このブラウザは音声入力に対応していません。Chromeをお試しください。'); return; }

    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }

    const r = new SR();
    r.lang = 'ja-JP';
    r.interimResults = false;
    r.continuous = false;
    recogRef.current = r;

    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText(prev => prev ? prev + '　' + transcript : transcript);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);

    r.start();
    setListening(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="screen-anim">
      <Header caseNum={caseNum} />
      <div className="input-body">
        <div className={`input-role-banner ${isP ? 'pc' : 'dc'}`}>
          <span className="input-role-emoji">🙋</span>
          <span>{inputState.name}（{isP ? '原告' : '被告'}）</span>
        </div>
        {questionText && (
          <div className="q-card">
            <div className="q-from">裁判長からの質問</div>
            <div className="q-text">{questionText}</div>
          </div>
        )}
        <div className="field">
          <div className="lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{labelText || '主張を入力してください'}</span>
            <button
              onClick={toggleVoice}
              style={{
                background: listening ? '#c0392b' : 'var(--surface)',
                border: `1.5px solid ${listening ? '#c0392b' : 'var(--border)'}`,
                borderRadius: 20,
                padding: '.25rem .7rem',
                fontSize: '.72rem',
                cursor: 'pointer',
                color: listening ? '#fff' : 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: '.3rem',
                transition: 'all .2s',
              }}
            >
              {listening ? '⏹ 停止' : '🎤 音声入力'}
            </button>
          </div>
          {listening && (
            <div style={{ fontSize: '.7rem', color: '#c0392b', marginBottom: '.3rem', animation: 'pulse 1s infinite' }}>
              ● 録音中…話してください
            </div>
          )}
          <textarea
            className="answer-ta"
            rows={5}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="話すか、直接入力してください。"
          />
          <div className="char-count">{text.length}文字</div>
        </div>
        <div className="btns one">
          <button className="btn" onClick={handleSubmit}>提出する</button>
        </div>
      </div>
    </div>
  );
}
