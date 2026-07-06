import { useState, useRef } from 'react';
import Header from './shared/Header';

export default function InputScreen({ inputState, caseNum, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const [supplement, setSupplement] = useState('');
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  if (!inputState) return null;
  const { role, questionText, labelText, choices = [], cb } = inputState;
  const isP = role === 'plaintiff';

  const handleSubmit = () => {
    if (!selected && !supplement.trim()) {
      alert('選択肢を選ぶか、気持ちを入力してください');
      return;
    }
    const val = selected && supplement.trim()
      ? `${selected}（補足：${supplement.trim()}）`
      : selected || supplement.trim();
    setSelected(null);
    setSupplement('');
    const submitFn = cb || onSubmit;
    submitFn(val);
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('このブラウザは音声入力に対応していません。Chromeをお試しください。'); return; }
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = 'ja-JP';
    r.interimResults = false;
    r.onresult = (e) => setSupplement(prev => prev ? prev + '　' + e.results[0][0].transcript : e.results[0][0].transcript);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="screen-anim">
      <Header caseNum={caseNum} />
      <div className="input-body">
        <div className={`input-role-banner ${isP ? 'pc' : 'dc'}`}>
          <span className="input-role-emoji">🙋</span>
          <span>{inputState.name}（{isP ? '申立人' : '相手方'}）</span>
        </div>

        {questionText && (
          <div className="q-card">
            <div className="q-from">調停員からの質問</div>
            <div className="q-text">{questionText}</div>
          </div>
        )}

        {/* 選択肢 */}
        {choices.length > 0 && (
          <div className="field">
            <div className="lbl">一番近いものを選んでください</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
              {choices.map((c, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(selected === c ? null : c)}
                  style={{
                    border: `1.5px solid ${selected === c ? 'var(--ink)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '.65rem .9rem',
                    cursor: 'pointer',
                    background: selected === c ? 'var(--surface)' : 'var(--white)',
                    boxShadow: selected === c ? 'inset 0 0 0 1px var(--ink)' : 'none',
                    fontSize: '.82rem',
                    lineHeight: 1.5,
                    transition: 'all .15s',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${selected === c ? 'var(--ink)' : 'var(--border)'}`,
                    background: selected === c ? 'var(--ink)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected === c && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--white)' }} />}
                  </span>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 補足入力 */}
        <div className="field">
          <div className="lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>補足・詳しい気持ち（任意）</span>
            <button
              onClick={toggleVoice}
              style={{
                background: listening ? '#c0392b' : 'var(--surface)',
                border: `1.5px solid ${listening ? '#c0392b' : 'var(--border)'}`,
                borderRadius: 20, padding: '.2rem .6rem',
                fontSize: '.68rem', cursor: 'pointer',
                color: listening ? '#fff' : 'var(--ink)',
                transition: 'all .2s',
              }}
            >
              {listening ? '⏹ 停止' : '🎤 音声'}
            </button>
          </div>
          {listening && (
            <div style={{ fontSize: '.7rem', color: '#c0392b', marginBottom: '.3rem' }}>
              ● 録音中…
            </div>
          )}
          <textarea
            className="answer-ta"
            rows={3}
            value={supplement}
            onChange={e => setSupplement(e.target.value)}
            placeholder={choices.length > 0 ? '選択肢に補足したいことがあれば…' : '気持ちを自由に入力してください'}
          />
        </div>

        <div className="btns one">
          <button className="btn" onClick={handleSubmit}>
            {selected ? '送信する　▶' : supplement.trim() ? '送信する　▶' : '選んで送信する　▶'}
          </button>
        </div>
      </div>
    </div>
  );
}
