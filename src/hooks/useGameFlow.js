import { useState, useRef, useCallback } from 'react';
import { JUDGES } from '../constants';
import { buildSystemPrompt, callAI } from '../api';
import { getOrCreateRoom, saveCase, updateCase, saveExchange, createPendingTurn, pollForAnswer } from '../lib/supabase';

function genCaseNum() {
  return `調停第${Math.floor(Math.random() * 900 + 100)}号`;
}

export function useGameFlow(setScreen, roomId, setWaitingFor) {
  const [messages, setMessages] = useState([]);
  const [courtAction, setCourtAction] = useState(null);
  const [stageLabel, setStageLabel] = useState('開始');
  const [roundDots, setRoundDots] = useState({ current: 0, max: 1 });
  const [passState, setPassState] = useState(null);
  const [inputState, setInputState] = useState(null);

  const gameRef = useRef({
    plaintiff: '', defendant: '', trouble: '', notes: '',
    mode: 'speed', diff: 'normal',
    caseNum: '', caseId: null,
    judgeEmoji: '🤝', judgeName: '',
    history: [],
    round: 0, maxRounds: 1,
    exchanges: [],
    appealCount: 0,
    verdict: null,
    lastAnalysis: '',
  });

  const G = gameRef.current;

  const appendMsg = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const showPassScreen = useCallback((role, note, cb) => {
    setPassState({ role, note, cb });
    setScreen('pass');
  }, [setScreen]);

  const showInputScreen = useCallback((role, questionText, labelText, choices, cb) => {
    // ルームがあり、相手（被告）の番なら別デバイス経由
    if (roomId && role === 'defendant') {
      const opponentName = G.defendant;
      setWaitingFor?.(opponentName);
      createPendingTurn(roomId, G.caseId, role, questionText, choices || [])
        .then(turn => {
          setScreen('waiting');
          const poll = setInterval(async () => {
            const answer = await pollForAnswer(turn.id);
            if (answer) {
              clearInterval(poll);
              setScreen('court');
              cb(answer);
            }
          }, 2500);
        })
        .catch(() => {
          // フォールバック：通常のInputScreen
          setInputState({ role, questionText, labelText, choices: choices || [], cb });
          setScreen('input');
        });
      return;
    }
    setInputState({ role, questionText, labelText, choices: choices || [], cb });
    setScreen('input');
  }, [setScreen, roomId, G, setWaitingFor]);

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

  // 質問に対する選択肢を生成
  const genChoices = useCallback(async (role, question) => {
    const name = role === 'plaintiff' ? G.plaintiff : G.defendant;
    const p = await ai(
      `調停員として、${name}が「${question}」に対して答えるとしたら、どんな気持ち・立場・考えが考えられるか、5つの選択肢を生成してください。短く（20字以内）、具体的に、バリエーション豊かに。`,
      '{"choices":["選択肢1","選択肢2","選択肢3","選択肢4","選択肢5"]}'
    );
    return p?.choices || [];
  }, [G, ai]);

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
      caseId: null, lastAnalysis: '',
    });
    const j = JUDGES[Math.floor(Math.random() * JUDGES.length)];
    G.judgeEmoji = j.emoji;
    G.judgeName = j.name;

    if (effectiveRoom) {
      try {
        await getOrCreateRoom(effectiveRoom);
        const c = await saveCase(effectiveRoom, {
          plaintiff: G.plaintiff, defendant: G.defendant,
          trouble: G.trouble, notes: G.notes, mode: G.mode, diff: G.diff,
        });
        G.caseId = c.id;
      } catch (e) { console.error('Supabase:', e); }
    }

    setMessages([]);
    setCourtAction(null);
    setStageLabel('開始');
    setRoundDots({ current: 0, max: G.maxRounds });
    setScreen('court');

    appendMsg({ type: 'case-card', plaintiff: G.plaintiff, defendant: G.defendant, trouble: G.trouble, notes: G.notes });
    appendMsg({ type: 'loading', id: 'open' });

    const p = await ai(
      'AI調停員として調停の開始を宣言してください。この場はお互いを責める場ではなく、それぞれの気持ちを聞いてもらえる場だということを伝えてください。（3文以内）',
      '{"speech":"調停員の開始の言葉"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'open')));
    if (p) appendMsg({ type: 'judge', text: p.speech || '調停を開始します。', judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    setCourtAction({ type: 'start-round' });
  }, [G, ai, appendMsg, setScreen, roomId]);

  const runNextRound = useCallback(async () => {
    G.round++;
    setStageLabel(`第${G.round}ターン`);
    setRoundDots({ current: G.round, max: G.maxRounds });
    setCourtAction(null);

    appendMsg({ type: 'loading', id: 'round' });
    const focusNote = G.lastAnalysis ? `前の分析：「${G.lastAnalysis}」。この点を踏まえること。` : '';
    const plan = await ai(
      `第${G.round}ターンを始めます。${focusNote}まず${G.plaintiff}（申立人）に質問してください。「なぜそう感じたのか」「本当に求めているものは何か」を引き出す共感的な質問を1つ。`,
      '{"plaintiff_question":"申立人への質問"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'round')));
    const pq = plan?.plaintiff_question || '今回のことについて、あなたがどう感じているか教えてください。';
    appendMsg({ type: 'judge', text: pq, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    appendMsg({ type: 'loading', id: 'choices-p' });
    const choicesP = await genChoices('plaintiff', pq);
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'choices-p')));

    showPassScreen('plaintiff', `${G.plaintiff}さんに質問があります。\n端末を渡してください。`, () => {
      showInputScreen('plaintiff', pq, '一番近いものを選んでください（補足もできます）', choicesP, async (ans) => {
        G.exchanges.push({ role: 'plaintiff', question: pq, answer: ans, round: G.round });
        if (G.caseId) saveExchange(G.caseId, { role: 'plaintiff', question: pq, answer: ans }).catch(() => {});
        setScreen('court');
        appendMsg({ type: 'sys', text: `${G.plaintiff}が回答しました` });
        appendMsg({ type: 'plaintiff', name: G.plaintiff, text: ans });
        await askDefendant(ans);
      });
    });
  }, [G, ai, genChoices, appendMsg, showPassScreen, showInputScreen, setScreen]);

  const askDefendant = useCallback(async (pAnswer) => {
    appendMsg({ type: 'loading', id: 'dq' });
    const p = await ai(
      `${G.plaintiff}は「${pAnswer}」と述べました。これを受けて、${G.defendant}（相手方）に質問してください。相手の発言を否定せず、${G.defendant}自身の気持ちや背景を引き出す共感的な質問を1つ。`,
      '{"defendant_question":"相手方への質問"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'dq')));
    const dq = p?.defendant_question || `${G.defendant}さん、この件についてどう感じていますか？`;
    appendMsg({ type: 'judge', text: dq, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    appendMsg({ type: 'loading', id: 'choices-d' });
    const choicesD = await genChoices('defendant', dq);
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'choices-d')));

    showPassScreen('defendant', `${G.defendant}さんに質問があります。\n端末を渡してください。`, () => {
      showInputScreen('defendant', dq, '一番近いものを選んでください（補足もできます）', choicesD, async (ans) => {
        G.exchanges.push({ role: 'defendant', question: dq, answer: ans, round: G.round });
        if (G.caseId) saveExchange(G.caseId, { role: 'defendant', question: dq, answer: ans }).catch(() => {});
        setScreen('court');
        appendMsg({ type: 'sys', text: `${G.defendant}が回答しました` });
        appendMsg({ type: 'defendant', name: G.defendant, text: ans });
        await afterRound();
      });
    });
  }, [G, ai, genChoices, appendMsg, showPassScreen, showInputScreen, setScreen]);

  const afterRound = useCallback(async () => {
    appendMsg({ type: 'loading', id: 'eval' });
    const p = await ai(
      '両者の発言を受けて、調停員として整理してください。①それぞれが感じていること・求めていること、②お互いに共通している部分、③まだ話し合えていない論点。その上で両者に向けた共感的なコメントをしてください。',
      '{"speech":"調停員のコメント（3文以内）","next_focus":"次に深掘りすべき論点（内部メモ）","needs_more":"まだ話し合うべきことがあればtrue"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'eval')));
    if (p) appendMsg({ type: 'judge', text: p.speech || '両者の気持ちを確認しました。', judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    G.lastAnalysis = p?.next_focus || '';

    if (G.round < G.maxRounds) {
      setCourtAction(p?.needs_more !== false
        ? { type: 'next-round', round: G.round + 1 }
        : { type: 'next-or-final', round: G.round + 1 });
    } else {
      setCourtAction({ type: 'go-lawyer' });
    }
  }, [G, ai, appendMsg]);

  const runLawyer = useCallback(async () => {
    setStageLabel('気持ちの整理');
    setCourtAction(null);
    appendMsg({ type: 'judge', text: '最終的な気持ちを伝える前に、それぞれが本当に伝えたいことを整理する時間を設けます。まずはあなたから。', judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    appendMsg({ type: 'loading', id: 'law-p' });
    const advP = await ai(
      `${G.plaintiff}の立場から、これまでの話し合いを踏まえて「本当に伝えたいこと」「相手に理解してほしいこと」「自分が変えられること」を整理してアドバイスしてください。`,
      '{"advice":"整理された気持ち（箇条書き3点、200字以内）","key_point":"最も大切な一言"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'law-p')));

    const choicesP = await genChoices('plaintiff', advP?.key_point || '最終的に伝えたいことは？');

    showPassScreen('plaintiff', `${G.plaintiff}さんへ。\n気持ちを整理する時間です。\n端末を渡してください。`, () => {
      showInputScreen('plaintiff', advP?.advice || '本当に伝えたいことは何ですか？', `ヒント: ${advP?.key_point || ''}`, choicesP, async (ans) => {
        G.exchanges.push({ role: 'plaintiff', question: '最終発言', answer: ans, round: 'final' });
        if (G.caseId) saveExchange(G.caseId, { role: 'plaintiff', question: '最終発言', answer: ans }).catch(() => {});
        setScreen('court');
        appendMsg({ type: 'plaintiff', name: G.plaintiff, text: ans });

        appendMsg({ type: 'loading', id: 'law-d' });
        const advD = await ai(
          `${G.plaintiff}の最終発言「${ans}」を踏まえ、${G.defendant}の立場から「本当に伝えたいこと」「相手に理解してほしいこと」「自分が変えられること」を整理してアドバイスしてください。`,
          '{"advice":"整理された気持ち（箇条書き3点、200字以内）","key_point":"最も大切な一言"}'
        );
        setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'law-d')));

        const choicesD = await genChoices('defendant', advD?.key_point || '最終的に伝えたいことは？');

        showPassScreen('defendant', `${G.defendant}さんへ。\n気持ちを整理する時間です。\n端末を渡してください。`, () => {
          showInputScreen('defendant', advD?.advice || '本当に伝えたいことは何ですか？', `ヒント: ${advD?.key_point || ''}`, choicesD, async (ans2) => {
            G.exchanges.push({ role: 'defendant', question: '最終発言', answer: ans2, round: 'final' });
            if (G.caseId) saveExchange(G.caseId, { role: 'defendant', question: '最終発言', answer: ans2 }).catch(() => {});
            setScreen('court');
            appendMsg({ type: 'defendant', name: G.defendant, text: ans2 });
            setCourtAction({ type: 'go-verdict' });
          });
        });
      });
    });
  }, [G, ai, genChoices, appendMsg, showPassScreen, showInputScreen, setScreen]);

  const runFinal = useCallback(async () => {
    setStageLabel('最終発言');
    setCourtAction(null);
    appendMsg({ type: 'judge', text: `最後にそれぞれの気持ちを伝えてもらいます。${G.plaintiff}さんからどうぞ。`, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });

    const choicesP = await genChoices('plaintiff', '今の気持ち・相手に伝えたいことは？');
    showPassScreen('plaintiff', `${G.plaintiff}さん、最後の発言の時間です。\n端末を渡してください。`, () => {
      showInputScreen('plaintiff', null, '最後に伝えたいことを選んでください', choicesP, async (ans) => {
        G.exchanges.push({ role: 'plaintiff', question: '最終発言', answer: ans, round: 'final' });
        setScreen('court');
        appendMsg({ type: 'plaintiff', name: G.plaintiff, text: ans });

        const choicesD = await genChoices('defendant', '今の気持ち・相手に伝えたいことは？');
        showPassScreen('defendant', `${G.defendant}さん、最後の発言の時間です。\n端末を渡してください。`, () => {
          showInputScreen('defendant', null, '最後に伝えたいことを選んでください', choicesD, async (ans2) => {
            G.exchanges.push({ role: 'defendant', question: '最終発言', answer: ans2, round: 'final' });
            setScreen('court');
            appendMsg({ type: 'defendant', name: G.defendant, text: ans2 });
            setCourtAction({ type: 'go-verdict' });
          });
        });
      });
    });
  }, [G, ai, genChoices, appendMsg, showPassScreen, showInputScreen, setScreen]);

  const runVerdict = useCallback(async () => {
    setStageLabel('調停案');
    setCourtAction(null);
    appendMsg({ type: 'judge', text: '両者の気持ちを十分に聞きました。調停案をまとめます。', judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });
    appendMsg({ type: 'loading', id: 'vd' });

    const exchangeDetail = G.exchanges.map((e, i) =>
      `[${i + 1}] ${e.role === 'plaintiff' ? G.plaintiff : G.defendant}への質問「${e.question}」→ 回答「${e.answer}」`
    ).join('\n');

    const p = await ai(
      `今回の相談内容：「${G.trouble}」\n\n全発言の詳細：\n${exchangeDetail}\n\n【重要な指示】\n・上記の発言内容を具体的に引用して分析すること。「〜さんは気持ちを伝えたかった」のような抽象的・汎用的な表現は絶対に使わない。\n・それぞれが実際に言った言葉・具体的なエピソードに基づいて気持ちを要約する。\n・調停案は「話し合いの機会を設ける」のような曖昧なものではなく、この2人の具体的な状況に合わせた行動レベルの提案にする（例：「毎週日曜の夜に家事の分担を話し合う15分を設ける」など）。\n・アドバイスも一般論ではなく、この2人のやり取りから見えた課題に特化した内容にする。`,
      '{"speech":"調停員の締めの言葉（2〜3文、具体的な内容に触れる）","plaintiff_feeling":"申立人が実際に言った内容を踏まえた気持ちの要約（具体的に）","defendant_feeling":"相手方が実際に言った内容を踏まえた気持ちの要約（具体的に）","common_ground":"やり取りから見えた共通点や根本にある気持ち","proposal":"この2人の具体的な状況に合わせた行動レベルの調停案（2〜3文）","advice":"このカップルの具体的なすれ違いパターンへのアドバイス（2文）","assessment":"どちらの主張がより理解できるか・なぜかの率直な評価（1〜2文）"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'vd')));

    const vd = p || {
      speech: '調停案をまとめました。',
      plaintiff_feeling: G.exchanges.find(e => e.role === 'plaintiff')?.answer || '発言内容を確認してください。',
      defendant_feeling: G.exchanges.find(e => e.role === 'defendant')?.answer || '発言内容を確認してください。',
      common_ground: 'やり取りの中に共通する思いが見えました。',
      proposal: '今回の具体的な状況をもとに、お互いが行動できる提案をまとめました。',
      advice: 'まずは今回話し合えたことを一歩前進と捉えてください。',
      assessment: '今回のやり取りを踏まえた見解です。',
    };
    G.verdict = vd;

    if (G.caseId) {
      updateCase(G.caseId, {
        verdict: vd.proposal,
        winner: 'mediation',
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
    setStageLabel(`再調停 第${G.appealCount}回`);
    setCourtAction(null);
    appendMsg({ type: 'loading', id: 'ap' });
    const p = await ai(
      `再調停の申し立てがありました（第${G.appealCount}回）。もう一度話し合いの場を設ける旨を伝えてください。`,
      '{"speech":"再調停開始の言葉（2文）"}'
    );
    setMessages((prev) => prev.filter((m) => !(m.type === 'loading' && m.id === 'ap')));
    if (p) appendMsg({ type: 'judge', text: p.speech, judgeEmoji: G.judgeEmoji, judgeName: G.judgeName });
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
