export function buildSystemPrompt(gameState) {
  const { plaintiff, defendant, trouble, notes, diff, exchanges } = gameState;
  const dn =
    diff === 'kids'
      ? '平易な言葉で話す。難しい法律用語は避ける。'
      : diff === 'pro'
      ? '民法・刑法の条文番号を適宜引用し、正式な法廷語で話す。'
      : '日常的な言葉を基本とする。法律用語は必要に応じて使う。';
  const ex = (exchanges || [])
    .map(
      (e, i) =>
        `[${i + 1}] ${e.role === 'plaintiff' ? plaintiff : defendant}（${
          e.role === 'plaintiff' ? '原告' : '被告'
        }）への質問：「${e.question || '（冒頭陳述）'}」→ 回答：「${e.answer}」`
    )
    .join('\n');
  return `あなたは公正なAI裁判長です。事件の全貌を明らかにしながら審理を進めてください。\n\n事件：${plaintiff}が${defendant}を訴えた。内容：「${trouble}」。補足：「${
    notes || 'なし'
  }」\n\nこれまでの陳述：\n${ex || '（まだなし）'}\n\n言葉のスタイル：${dn}\n方針：真面目で公正な裁判長として振る舞う。ユーモアは最小限。断定より事実確認を優先する。\n返答はJSONのみ。`;
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
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || '').join('');
  return { parsed: JSON.parse(text.replace(/```json|```/g, '').trim()), text };
}
