const API_KEY = process.env.TRUGEN_API_KEY || process.env.AI_API_KEY;
const API_URL = process.env.TRUGEN_API_URL || process.env.AI_API_URL || 'https://api.openai.com/v1';
const MODEL = process.env.TRUGEN_MODEL || process.env.AI_MODEL || 'gpt-4o-mini';
const FALLBACK_MODE = process.env.AI_FALLBACK === 'true' || !API_KEY;

const SYSTEM_PROMPT =
  'You are Vishesh, an elite AI mentor specializing in software engineering, data structures, algorithms, and career guidance. Respond concisely and accurately.';

function buildMessages(prompt, contextHistory) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(contextHistory || []).map((m) => ({
      role: m.role || 'user',
      content: m.content || String(m),
    })),
    { role: 'user', content: prompt },
  ];
}

async function aiFetch(body) {
  if (!API_KEY && !FALLBACK_MODE) {
    throw new Error('AI_API_KEY (or TRUGEN_API_KEY) not configured. Set AI_FALLBACK=true for local mode.');
  }
  const response = await fetch(`${API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`AI API error ${response.status}: ${text || response.statusText}`);
  }
  return response;
}

/* ------------------------------------------------------------------ */
/*  Local fallback — generates context-aware responses without an API */
/* ------------------------------------------------------------------ */
function localGenerate(prompt, contextHistory = []) {
  const ctx = contextHistory.find((m) => m.role === 'system')?.content || '';
  const bootcamp = ctx.match(/(\w+\s?\w*)\s*[—-]?\s*Day/i)?.[1] || 'your program';
  const day = ctx.match(/Day\s+(\d+)/i)?.[1] || '';
  const userMsg = [...contextHistory, { content: prompt }].filter((m) => m.role === 'user').pop()?.content || prompt;

  if (/introduce|hello|hi\b|who are/i.test(userMsg)) {
    return `I am Vishesh — your AI Growth Intelligence mentor for ${bootcamp}${day ? ` (Day ${day})` : ''}. I'm here to guide you through concepts, debug your code, and prepare you for real-world engineering challenges. What would you like to work on today?`;
  }
  if (/\bexplain\b|\bwhat is\b|\bhow does\b|\bdefine\b/i.test(userMsg)) {
    return `That's a great question about ${bootcamp}${day ? ` Day ${day}` : ''}. The core idea here is to break down the problem systematically:

1. First, understand the fundamental concept and its purpose in real-world systems.
2. Then, examine how it connects to the broader architecture you're building.
3. Finally, apply it through practical examples.

Could you share more about what specifically you'd like to explore? I can dive deeper into theory, provide code examples, or walk through a hands-on exercise.`;
  }
  if (/\bcode\b|implement|write|syntax|function|error|bug|debug/i.test(userMsg)) {
    return `Let me help you with the implementation. Here's my analysis:

**Key considerations:**
- Focus on clean, maintainable code that follows best practices
- Think about edge cases and error handling early
- Consider the trade-offs between different approaches

Here's a template to get you started:

\`\`\`
// Approach: Start with a clear structure, then refine
function solve(input) {
  // 1. Validate inputs
  // 2. Process the core logic
  // 3. Return the result
}
\`\`\`

Try implementing this and share your progress — I'll review and provide specific feedback.`;
  }
  return `I understand you're working on ${bootcamp}${day ? ` Day ${day}` : ''}. Here's my guidance:

1. **Foundation** — Make sure you've understood the core principles before diving into implementation.
2. **Practice** — Apply what you've learned through the exercises provided in your curriculum.
3. **Reflect** — Review your solutions and think about optimization opportunities.

What specific aspect would you like me to elaborate on?`;
}

/* ------------------------------------------------------------------ */
/*  Exported functions                                                */
/* ------------------------------------------------------------------ */
const trugenGenerate = async (prompt, contextHistory = []) => {
  if (FALLBACK_MODE) return localGenerate(prompt, contextHistory);

  const messages = buildMessages(prompt, contextHistory);
  try {
    const res = await aiFetch({ model: MODEL, messages, temperature: 0.7, max_tokens: 1024 });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI provider');
    return content;
  } catch (err) {
    if (process.env.AI_FALLBACK_ON_ERROR === 'true') return localGenerate(prompt, contextHistory);
    throw err;
  }
};

const trugenStream = async (prompt, contextHistory = []) => {
  if (FALLBACK_MODE) return null;

  try {
    const messages = buildMessages(prompt, contextHistory);
    const res = await aiFetch({ model: MODEL, messages, temperature: 0.7, max_tokens: 1024, stream: true });
    return res.body;
  } catch (err) {
    if (process.env.AI_FALLBACK_ON_ERROR === 'true') return null;
    throw err;
  }
};

module.exports = { trugenGenerate, trugenStream, API_URL, MODEL };
