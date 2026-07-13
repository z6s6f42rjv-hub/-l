import { useState, useEffect, useRef } from 'react';
import { getMyTurn, answerTurn } from '../lib/supabase';
import Header from './shared/Header';

export default function RespondScreen({ roomId, myRole, myName }) {
  const [turn, setTurn] = useState(null);
  const [selected, setSelected] = useState(null);
  const [supplement, setSupplement] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    const poll = async () => {
      const t = await getMyTurn(roomId, myRole);
      if (t) { setTurn(t); setSelected(null); setSupplement(''); setSubmitted(false); }
    };
    poll();
    pollingRef.current = setInterval(poll, 2500);
    return () => clearInterval(pollingRef.current);
  }, [roomId, myRole]);

  const handleSubmit = async () => {
    if (!selected && !supplement.trim()) { alert('選択肢を選ぶか、気持ちを入力してください'); return; }
    const val = selected && supplement.trim()
      ? `${selected}（補足：${supplement.trim()}）`
      : selected || supplement.trim();
    await answerTurn(turn.id, val);
    setSubmitted(true);
    setTurn(null);
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Chromeをお試しください'); return; }
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

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '2.5rem' }}>✅</div>
      <div style={{ fontWeight: 700 }}>送信しました</div>
      <div style={{ fontSize: '.8rem', color: 'var(--gray)' }}>次の質問が来るまで待ってください…</div>
    </div>
  );

  if (!turn) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '2.5rem' }}>⏳</div>
      <div style={{ fontWeight: 700 }}>{myName} として参加中</div>
      <div style={{ fontSize: '.8rem', color: 'var(--gray)', textAlign: 'center', lineHeight: 1.7 }}>
        あなたの番になったら<br />ここに質問が表示されます
      </div>
      <div style={{ marginTop: '1rem', width: 8, height: 8, borderRadius: '50%', background: '#27ae60', animation: 'pulse 1.5s infinite' }} />
    </div>
  );

  const choices = turn.choices || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="screen-anim">
      <Header sub="あなたの番です" />
      <div className="input-body">
        <div className={`input-role-banner ${myRole === 'plaintiff' ? 'pc' : 'dc'}`}>
          <span className="input-role-emoji">🙋</span>
          <span>{myName}（{myRole === 'plaintiff' ? '申立人' : '相手方'}）</span>
        </div>

        <div className="q-card">
          <div className="q-from">調停員からの質問</div>
          <div className="q-text">{turn.question}</div>
        </div>

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
                    borderRadius: 'var(--radius)', padding: '.65rem .9rem',
                    cursor: 'pointer',
                    background: selected === c ? 'var(--surface)' : 'var(--white)',
                    boxShadow: selected === c ? 'inset 0 0 0 1px var(--ink)' : 'none',
                    fontSize: '.82rem', lineHeight: 1.5,
                    transition: 'all .15s', userSelect: 'none',
                    display: 'flex', alignItems: 'center', gap: '.5rem',
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
              }}
            >
              {listening ? '⏹ 停止' : '🎤 音声'}
            </button>
          </div>
          {listening && <div style={{ fontSize: '.7rem', color: '#c0392b', marginBottom: '.3rem' }}>● 録音中…</div>}
          <textarea
            className="answer-ta"
            rows={3}
            value={supplement}
            onChange={e => setSupplement(e.target.value)}
            placeholder="選択肢に補足したいことがあれば…"
          />
        </div>

        <div className="btns one">
          <button className="btn" onClick={handleSubmit}>送信する　▶</button>
        </div>
      </div>
    </div>
  );
}
