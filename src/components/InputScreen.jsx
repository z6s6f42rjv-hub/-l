import { useState } from 'react';
import Header from './shared/Header';

export default function InputScreen({ inputState, caseNum, onSubmit }) {
  const [text, setText] = useState('');

  if (!inputState) return null;
  const { role, questionText, labelText } = inputState;
  const isP = role === 'plaintiff';

  const handleSubmit = () => {
    if (!text.trim()) { alert('内容を入力してください'); return; }
    const val = text.trim();
    setText('');
    onSubmit(val);
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
          <div className="lbl">{labelText || '主張を入力してください'}</div>
          <textarea className="answer-ta" rows={5} value={text} onChange={e => setText(e.target.value)} placeholder="長くても短くても構いません。" />
          <div className="char-count">{text.length}文字</div>
        </div>
        <div className="btns one">
          <button className="btn" onClick={handleSubmit}>提出する</button>
        </div>
      </div>
    </div>
  );
}
