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
  const bootcamp = 'your program';
  const day = ctx.match(/Day:\s*(\d+)/i)?.[1] || '';
  
  // Try to grab topic from the new context string format (Topic: X |) or the intro prompt (The topic is: X.)
  const topicMatch = ctx.match(/Topic:\s*(.*?)\s*\|/i) || ctx.match(/The topic is:\s*(.*?)\./i);
  const topic = topicMatch ? topicMatch[1] : 'this subject';

  const aiMessages = contextHistory.filter((m) => m.role === 'assistant' || m.role === 'model' || m.role === 'vishesh');
  const alreadyGreeted = aiMessages.some(m => m.content && m.content.includes("How are you doing today"));

  // If this is the initial lesson generation intro prompt from the frontend
  if (prompt.includes('Write a compelling lesson introduction') || (!alreadyGreeted && /hello|hi\b|hey|start/i.test(prompt))) {
    return `Hello! I am Vishesh. How are you doing today?`;
  }

  // If we already greeted them, we transition straight into the lesson
  if (alreadyGreeted && aiMessages.length <= 2) {
    return `Cool! So coming to the lesson on ${topic}... The whole thing gets divided into a 30-day segment to make you perfect and proficient in ${topic}.\n\nLet's get started. What do you already know about this topic?`;
  }

  // General fallback for ongoing conversation
  return `That makes sense. Since our goal over these 30 days is to make you an expert in ${topic}, let's break this down further.\n\nCould you try explaining your approach, or would you like me to provide a concrete example?`;
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
