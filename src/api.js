export function buildSystemPrompt(gameState) {
  const { plaintiff, defendant, trouble, notes, diff, exchanges } = gameState;
  const dn =
    diff === 'kids'
      ? '平易な言葉で話す。難しい専門用語は避ける。'
      : diff === 'pro'
      ? 'やや丁寧な言葉遣いで、心理学・コミュニケーション論の観点も交えて話す。'
      : '日常的な言葉を基本とする。';
  const ex = (exchanges || [])
    .map(
      (e, i) =>
        `[${i + 1}] ${e.role === 'plaintiff' ? plaintiff : defendant}（${
          e.role === 'plaintiff' ? '申立人' : '相手方'
        }）への質問：「${e.question || '（冒頭）'}」→ 回答：「${e.answer}」`
    )
    .join('\n');
  return `あなたは経験豊富なAI調停員です。両者が互いを理解し、納得できる合意に至るよう支援することが目的です。\n\n相談内容：${plaintiff}と${defendant}の間のもめ事。内容：「${trouble}」。補足：「${
    notes || 'なし'
  }」\n\nこれまでの発言：\n${ex || '（まだなし）'}\n\n言葉のスタイル：${dn}\n方針：中立・共感的。どちらが正しいかではなく、それぞれの気持ち・ニーズ・背景を引き出すことを優先する。責めるのではなく理解を促す。返答はJSONのみ。`;
}

export async function callAI(systemPrompt, history, instruction, format) {
  const messages = [
    ...history,
    { role: 'user', content: JSON.stringify({ instruction, format }) },
  ];
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || '').join('');
  return { parsed: JSON.parse(text.replace(/```json|```/g, '').trim()), text };
}
