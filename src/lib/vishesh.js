const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VISHESH_SYSTEM_PROMPT = `You are Vishesh — the AI Growth Intelligence of Synapse. You are not a chatbot.

You are:
- A world-class mentor and teacher with deep expertise in your domain
- A rigorous evaluator who gives precise, honest feedback
- An AI interviewer who assesses communication and technical skills
- A growth coach and accountability partner
- A curriculum architect who adapts learning in real time

Your communication style:
- Direct, precise, and intellectually stimulating
- You use technical terminology accurately
- You challenge the learner to think deeper
- You celebrate progress and identify gaps honestly
- You never give vague or generic responses
- You adapt your depth based on the learner's level

Always respond in a structured, pedagogically sound way. When teaching, use:
1. Concept explanation
2. Real-world analogy
3. Example or code snippet when relevant

CRITICAL INSTRUCTION: Do NOT ask the user for permission to continue to the next topic (e.g., do NOT ask "Would you like to learn more?"). Seamlessly continue teaching and interacting with the user without asking them to confirm.

You are the core of the Synapse platform. Every interaction must reinforce growth.`;

export async function streamVisheshResponse({
  userMessage,
  history = [],
  context = '',
  onToken,
  onDone,
  onError,
  abortController,
}) {
  const systemPrompt = context
    ? `${VISHESH_SYSTEM_PROMPT}\n\nCurrent context: ${context}`
    : VISHESH_SYSTEM_PROMPT;

  const contextHistory = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-20),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage, contextHistory }),
      signal: abortController?.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          onDone?.(fullResponse);
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullResponse += parsed.content;
            onToken?.(parsed.content, fullResponse);
          }
        } catch {
          // skip malformed lines
        }
      }
    }

    onDone?.(fullResponse);
  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error('[Vishesh] API error', err);
    onError?.(err.message || 'Failed to connect to Vishesh AI.');
  }
}

export async function askVishesh({ prompt, context = '' }) {
  const systemPrompt = context
    ? `${VISHESH_SYSTEM_PROMPT}\n\nContext: ${context}`
    : VISHESH_SYSTEM_PROMPT;

  try {
    const response = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, contextHistory: [{ role: 'system', content: systemPrompt }] }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    return data.response ?? null;
  } catch {
    console.error('[Vishesh] Single query failed');
    return null;
  }
}

export async function generateLessonIntro({ bootcamp, topic, day }) {
  const prompt = `You are teaching Day ${day} of the ${bootcamp} bootcamp. The topic is: ${topic}.

Write a compelling lesson introduction (3-4 paragraphs) that:
1. Hooks the learner with why this topic matters in the real world
2. Explains what they will learn today specifically
3. Connects it to their career goals in ${bootcamp}
4. Sets an exciting learning objective

Be direct, engaging, and technically precise. Write as Vishesh.`;

  return askVishesh({ prompt, context: `${bootcamp} - Day ${day} - ${topic}` });
}
