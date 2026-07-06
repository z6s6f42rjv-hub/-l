import { useState, useRef, useCallback } from 'react';
import { JUDGES } from '../constants';
import { buildSystemPrompt, callAI } from '../api';
import { getOrCreateRoom, saveCase, updateCase, saveExchange } from '../lib/supabase';

function genCaseNum() {
  return `令和7年（ネ）第${Math.floor(Math.random() * 900 + 100)}号`;
}

export function useGameFlow(setScreen, roomId) {
  const [messages, setMessages] = useState([]);
  const [courtAction, setCourtAction] = useState(null);
  const [stageLabel, setStageLabel] = useState('開廷');
  const [roundDots, setRoundDots] = useState({ current: 0, max: 1 });
  const [passState, setPassState] = useState(null);
  const [inputState, setInputState] = useState(null);

  const gameRef = useRef({
    plaintiff: '', defendant: '', trouble: '', notes: '',
    mode: 'speed', diff: 'normal',
    caseNum: '', caseId: null,
    judgeEmoji: '👨‍⚖️', judgeName: '',
    history: [],
    round: 0, maxRounds: 1,
    exchanges: [],
    appealCount: 0,
    verdict: null,
  });

  const G = gameRef.current;

  const appendMsg = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const showPassScreen = useCallback((role, note, cb) => {
    setPassState({ role, note, cb });
    setScreen('pass');
  }, [setScreen]);

  const showInputScreen = useCallback((role, questionText, labelText, cb) => {
    setInputState({ role, questionText, labelText, cb });
    setScreen('input');
  }, [setScreen]);

  const ai = useCallback(async (instruction, format) => {
    const sys = buildSystemPrompt(G);
    try {
      const { parsed, text } = await callAI(sys, G.history, instruction, format);
      G.history.push({ role: 'user', content: JSON.stringify({ instruction, format }) });
      G.history.push({ role: 'assistant', content: text });
      return parsed;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [G]);

  const runOpening = useCallback(async (formData, room) => {
    const effectiveRoom = room || roomId;
    Object.assign(G, {
      plaintiff: formData.plaintiff,
      defendant: formData.defendant,
      trouble: formData.trouble,
      notes: formData.notes,
      mode: formData.mode,
      diff: formData.diff,
      maxRounds: formData.mode === 'full' ? 2 : 1,
      round: 0, appealCount: 0,
      history: [], exchanges: [], verdict: null,
      caseNum: genCaseNum(),
      caseId: null,
    });
    const j = JUDGES[Math.floor(Math.random() * JUDGES.length)];
    G.judgeEmoji = j.emoji;
    G.judgeName = j.name;

    // Supabaseにケース保存
    if (effectiveRoom) {
      try {
        await getOrCreateRoom(effectiveRoom);
        const c = await saveCase(effectiveRoom, {
          plaintiff: G.plaintiff,
          defendant: G.defendant,
          trouble: G.trouble,
          notes: G.notes,
          mode: G.mode,
          diff: G.diff,
        });
        G.caseId = c.id;
      } catch (e) {
        console.error('Supabase save error:', e);
      }
    }

    setMessages([]);
    setCourtAction(null);
    setStageLabel('開廷');
    setRoundDots({ current: 0, max: G.maxRounds });
    setScreen('court');

    appendMsg({ type: 'case-card', plaintiff: G.plaintiff, defendant: G.defendant, trouble: G.trouble, notes: G.notes });
    appendMsg({ type: 'loading', id: 'open' });

    const p = await ai(
      '裁判長として開廷を宣言し、事件の概要を確認してください。この場では両者が対等に意見を述べる機会があることを強調してください。（3文以内）',
      '{"speech":"裁判長の開廷の言葉"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'open')));
    if (p) appendMsg({ type: 'judge', text: p.speech || '開廷します。', judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    setCourtAction({ type: 'start-round' });
  }, [G, ai, appendMsg, setScreen, roomId]);

  const runNextRound = useCallback(async () => {
    G.round++;
    setStageLabel(`第${G.round}ターン`);
    setRoundDots({ current: G.round, max: G.maxRounds });
    setCourtAction(null);

    appendMsg({ type: 'loading', id: 'round' });
    const plan = await ai(
      `第${G.round}ターンの審理を開始します。まず原告「${G.plaintiff}」から話を聞きます。原告への最初の質問を生成してください。核心を突く質問を1つ。相手の気持ちや意図を掘り下げる質問が望ましい。`,
      '{"plaintiff_question":"原告への質問","note":"この質問の意図（内部メモ）"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'round')));
    const pq = plan?.plaintiff_question || '今回の件について、あなたの立場から説明してください。';
    appendMsg({ type: 'judge', text: pq, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    showPassScreen('plaintiff', `${G.plaintiff}（原告）さんへ質問があります。\n端末を渡してください。画面は見せないように。`, () => {
      showInputScreen('plaintiff', pq, '原告としての主張・回答を入力してください', async (ans) => {
        G.exchanges.push({ role: 'plaintiff', question: pq, answer: ans, round: G.round });
        if (G.caseId) saveExchange(G.caseId, { role: 'plaintiff', question: pq, answer: ans }).catch(() => {});
        setScreen('court');
        appendMsg({ type: 'sys', text: `${G.plaintiff}（原告）が回答を提出しました` });
        appendMsg({ type: 'plaintiff', name: G.plaintiff, text: ans });
        await askDefendant(ans);
      });
    });
  }, [G, ai, appendMsg, showPassScreen, showInputScreen, setScreen]);

  const askDefendant = useCallback(async (pAnswer) => {
    appendMsg({ type: 'loading', id: 'dq' });
    const p = await ai(
      `原告「${G.plaintiff}」は「${pAnswer}」と述べました。この回答を踏まえ、被告「${G.defendant}」に対する質問を1つ生成してください。単なる反論ではなく、被告の気持ちや背景を引き出す質問にしてください。`,
      '{"defendant_question":"被告への質問"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'dq')));
    const dq = p?.defendant_question || `${G.defendant}さん、この件についてどう説明しますか？`;
    appendMsg({ type: 'judge', text: dq, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    showPassScreen('defendant', `${G.defendant}（被告）さんへ質問があります。\n端末を渡してください。画面は見せないように。`, () => {
      showInputScreen('defendant', dq, '被告としての主張・回答を入力してください', async (ans) => {
        G.exchanges.push({ role: 'defendant', question: dq, answer: ans, round: G.round });
        if (G.caseId) saveExchange(G.caseId, { role: 'defendant', question: dq, answer: ans }).catch(() => {});
        setScreen('court');
        appendMsg({ type: 'sys', text: `${G.defendant}（被告）が回答を提出しました` });
        appendMsg({ type: 'defendant', name: G.defendant, text: ans });
        await afterRound();
      });
    });
  }, [G, ai, appendMsg, showPassScreen, showInputScreen, setScreen]);

  const afterRound = useCallback(async () => {
    appendMsg({ type: 'loading', id: 'eval' });
    const p = await ai(
      '両者の回答を受けて、裁判長として中立的な立場からコメントしてください。どちらかを一方的に責めず、両方の気持ちを汲みながら、お互いが理解し合えるようなコメントをしてください。',
      '{"speech":"裁判長のコメント（3文以内）","needs_more":"まだ不明な点があればtrue、なければfalse"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'eval')));
    if (p) appendMsg({ type: 'judge', text: p.speech || '両者の主張を確認しました。', judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    if (G.round < G.maxRounds) {
      if (p?.needs_more !== false) {
        setCourtAction({ type: 'next-round', round: G.round + 1 });
      } else {
        setCourtAction({ type: 'next-or-final', round: G.round + 1 });
      }
    } else {
      setCourtAction({ type: 'go-lawyer' });
    }
  }, [G, ai, appendMsg]);

  // AI弁護士フェーズ
  const runLawyer = useCallback(async () => {
    setStageLabel('AI弁護士');
    setCourtAction(null);
    appendMsg({ type: 'judge', text: '最終弁論の前に、それぞれにAI弁護士がアドバイスをします。まず原告からどうぞ。', judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    appendMsg({ type: 'loading', id: 'law-p' });
    const advP = await ai(
      `あなたは原告「${G.plaintiff}」の弁護士です。これまでの審理内容を踏まえ、最終弁論で原告が主張すべき最も重要なポイントを3つアドバイスしてください。相手への共感も忘れずに。`,
      '{"advice":"弁護士からのアドバイス（箇条書き3つ、計200字以内）","key_point":"最も重要な一言"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'law-p')));

    showPassScreen('plaintiff', `${G.plaintiff}（原告）さんへ。\nAI弁護士からのアドバイスがあります。\n端末を渡してください（被告は見ないでください）。`, () => {
      showInputScreen('plaintiff', advP?.advice || 'あなたの最も重要な気持ちを伝えてください。', `AI弁護士のアドバイス: ${advP?.key_point || ''}`, async (ans) => {
        G.exchanges.push({ role: 'plaintiff', question: '最終弁論（AI弁護士サポート）', answer: ans, round: 'final' });
        if (G.caseId) saveExchange(G.caseId, { role: 'plaintiff', question: '最終弁論', answer: ans }).catch(() => {});
        setScreen('court');
        appendMsg({ type: 'plaintiff', name: G.plaintiff, text: ans });

        // 被告AI弁護士
        appendMsg({ type: 'loading', id: 'law-d' });
        const advD = await ai(
          `あなたは被告「${G.defendant}」の弁護士です。これまでの審理と原告の最終弁論「${ans}」を踏まえ、最終弁論で被告が主張すべき最も重要なポイントを3つアドバイスしてください。相手への共感も忘れずに。`,
          '{"advice":"弁護士からのアドバイス（箇条書き3つ、計200字以内）","key_point":"最も重要な一言"}'
        );
        setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'law-d')));

        showPassScreen('defendant', `${G.defendant}（被告）さんへ。\nAI弁護士からのアドバイスがあります。\n端末を渡してください（原告は見ないでください）。`, () => {
          showInputScreen('defendant', advD?.advice || 'あなたの最も重要な気持ちを伝えてください。', `AI弁護士のアドバイス: ${advD?.key_point || ''}`, async (ans2) => {
            G.exchanges.push({ role: 'defendant', question: '最終弁論（AI弁護士サポート）', answer: ans2, round: 'final' });
            if (G.caseId) saveExchange(G.caseId, { role: 'defendant', question: '最終弁論', answer: ans2 }).catch(() => {});
            setScreen('court');
            appendMsg({ type: 'defendant', name: G.defendant, text: ans2 });
            setCourtAction({ type: 'go-verdict' });
          });
        });
      });
    });
  }, [G, ai, appendMsg, showPassScreen, showInputScreen, setScreen]);

  const runFinal = useCallback(async () => {
    setStageLabel('最終弁論');
    setCourtAction(null);
    appendMsg({ type: 'judge', text: `最終弁論に移ります。${G.plaintiff}（原告）から最後の主張を聞きます。`, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    showPassScreen('plaintiff', `${G.plaintiff}（原告）さん、最終弁論の時間です。\n端末を渡してください。`, () => {
      showInputScreen('plaintiff', null, '最後の主張を述べてください', async (ans) => {
        G.exchanges.push({ role: 'plaintiff', question: '最終弁論', answer: ans, round: 'final' });
        setScreen('court');
        appendMsg({ type: 'plaintiff', name: G.plaintiff, text: ans });
        appendMsg({ type: 'loading', id: 'df' });
        const p = await ai(
          `原告の最終弁論「${ans}」を踏まえ、被告への最終弁論を促す一言を述べてください。`,
          '{"speech":"裁判長のひとこと（1文）"}'
        );
        setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'df')));
        if (p) appendMsg({ type: 'judge', text: p.speech || `${G.defendant}（被告）の最終弁論を聞きます。`, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

        showPassScreen('defendant', `${G.defendant}（被告）さん、最終弁論の時間です。\n端末を渡してください。`, () => {
          showInputScreen('defendant', null, '最後の主張を述べてください', async (ans2) => {
            G.exchanges.push({ role: 'defendant', question: '最終弁論', answer: ans2, round: 'final' });
            setScreen('court');
            appendMsg({ type: 'defendant', name: G.defendant, text: ans2 });
            setCourtAction({ type: 'go-verdict' });
          });
        });
      });
    });
  }, [G, ai, appendMsg, showPassScreen, showInputScreen, setScreen]);

  const runVerdict = useCallback(async () => {
    setStageLabel('判決');
    setCourtAction(null);
    appendMsg({ type: 'judge', text: '全員起立。ただいまより判決を言い渡します。', judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });
    appendMsg({ type: 'loading', id: 'vd' });

    const summary = G.exchanges.map((e) => `${e.role === 'plaintiff' ? G.plaintiff : G.defendant}：「${e.answer}」`).join(' / ');
    const p = await ai(
      `全ての主張を総合評価し、判決を下してください。\n陳述の要約：${summary}\n\nカップル間のもめ事として、どちらが正当かだけでなく、お互いが今後どう関係を改善できるかも含めた建設的な判決にしてください。控訴${G.appealCount}回目。`,
      '{"speech":"判決の宣言（2〜3文）","winner":"plaintiff または defendant","reason":"判決理由（3〜4文）","plaintiff_score":60,"defendant_score":40,"order":"裁判所からの命令（1〜2文）","advice":"カップルへのアドバイス（2〜3文）","law_note":"関連する一般的な権利・義務の解説（2〜3文）"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'vd')));

    const vd = p || {
      speech: '判決を言い渡します。', winner: 'plaintiff',
      reason: '原告の主張がより正当と判断します。', plaintiff_score: 60, defendant_score: 40,
      order: `${G.defendant}は${G.plaintiff}に誠意ある謝罪を行うこと。`,
      advice: 'お互いの気持ちを話し合う時間を設けてください。',
      law_note: 'この件は相互理解と誠実なコミュニケーションが重要です。',
    };
    G.verdict = vd;

    if (G.caseId) {
      updateCase(G.caseId, {
        verdict: vd.reason,
        winner: vd.winner,
        finished_at: new Date().toISOString(),
      }).catch(() => {});
    }

    appendMsg({ type: 'judge', text: vd.speech, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });
    setCourtAction({
      type: 'verdict',
      verdict: vd,
      plaintiff: G.plaintiff,
      defendant: G.defendant,
      caseNum: G.caseNum,
      appealCount: G.appealCount,
    });
  }, [G, ai, appendMsg]);

  const runAppeal = useCallback(async () => {
    G.appealCount++;
    G.history = []; G.exchanges = []; G.round = 0;
    setStageLabel(`控訴審 第${G.appealCount}回`);
    setCourtAction(null);
    appendMsg({ type: 'loading', id: 'ap' });
    const p = await ai(
      `控訴が申し立てられました（第${G.appealCount}回）。控訴審の開始を宣言し、前回の判決に対して改めて審理する旨を伝えてください。`,
      '{"speech":"控訴審開始の宣言（2文）"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'ap')));
    if (p) appendMsg({ type: 'judge', text: p.speech || `第${G.appealCount}回控訴審を開始します。`, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });
    setCourtAction({ type: 'start-round' });
  }, [G, ai, appendMsg]);

  const getGameState = useCallback(() => ({ ...G }), [G]);

  return {
    messages, courtAction, stageLabel, roundDots,
    passState, inputState,
    setCourtAction,
    runOpening, runNextRound, runFinal, runLawyer, runVerdict, runAppeal,
    getGameState,
  };
}
