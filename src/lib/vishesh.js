/**
 * Vishesh AI Engine — 100% Local Ollama Integration
 * Streams tokens directly from Ollama with zero external API calls.
 * All inference runs on-device via http://localhost:11434
 * 
 * TODO(security): In production, enforce CORS policy and origin validation
 * on the Ollama server side.
 */

const OLLAMA_BASE = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2'; // Best balance of speed & quality locally

/** System prompt that defines Vishesh's persona */
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

/**
 * Stream a response from Vishesh (Ollama) with token-by-token delivery.
 * @param {string} userMessage - The user's input
 * @param {Array} history - Previous messages [{role, content}]
 * @param {string} context - Optional context (bootcamp, topic, etc.)
 * @param {function} onToken - Called with each streamed token
 * @param {function} onDone - Called when streaming completes
 * @param {function} onError - Called on error
 * @param {AbortController} abortController - For cancellation
 */
export async function streamVisheshResponse({
  userMessage,
  history = [],
  context = '',
  onToken,
  onDone,
  onError,
  abortController,
  model = DEFAULT_MODEL,
}) {
  const systemPrompt = context
    ? `${VISHESH_SYSTEM_PROMPT}\n\nCurrent context: ${context}`
    : VISHESH_SYSTEM_PROMPT;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-20), // Keep last 20 messages for context window efficiency
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 1024,
        },
      }),
      signal: abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';

    // Read stream chunks as they arrive — zero buffering delay
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            const token = parsed.message.content;
            fullResponse += token;
            onToken?.(token, fullResponse);
          }
          if (parsed.done) {
            onDone?.(fullResponse);
            return;
          }
        } catch {
          // Skip malformed JSON lines — don't log raw content for security
        }
      }
    }

    onDone?.(fullResponse);
  } catch (err) {
    if (err.name === 'AbortError') {
      // User cancelled — not an error
      return;
    }
    // Generic error message to user; full error logged for dev only
    console.error('[Vishesh] Ollama connection failed');
    onError?.('Vishesh is currently offline. Ensure Ollama is running locally on port 11434.');
  }
}

/**
 * Non-streaming single response (for assessments, scoring, etc.)
 */
export async function askVishesh({ prompt, context = '', model = DEFAULT_MODEL }) {
  const systemPrompt = context
    ? `${VISHESH_SYSTEM_PROMPT}\n\nContext: ${context}`
    : VISHESH_SYSTEM_PROMPT;

  try {
    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: { temperature: 0.3, num_predict: 512 },
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
    const data = await response.json();
    return data.message?.content ?? '';
  } catch {
    console.error('[Vishesh] Single query failed');
    return null;
  }
}

/**
 * Check if Ollama is running locally and model is available.
 * Returns { online: bool, model: string, models: [] }
 */
export async function checkOllamaStatus() {
  try {
    const [tagsRes] = await Promise.all([
      fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) }),
    ]);

    if (!tagsRes.ok) return { online: false, model: null, models: [] };

    const data = await tagsRes.json();
    const models = (data.models || []).map((m) => m.name);
    const preferredModel = models.find((m) => m.includes('llama3')) ||
      models.find((m) => m.includes('mistral')) ||
      models.find((m) => m.includes('phi')) ||
      models[0] || null;

    return { online: true, model: preferredModel, models };
  } catch {
    return { online: false, model: null, models: [] };
  }
}

/**
 * Generate MCQ assessment questions via Vishesh locally
 */
export async function generateAssessmentQuestions({ topic, difficulty = 'intermediate', count = 5 }) {
  const prompt = `Generate ${count} multiple choice questions about "${topic}" at ${difficulty} level.

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": [
      { "id": "A", "text": "Option A text" },
      { "id": "B", "text": "Option B text" },
      { "id": "C", "text": "Option C text" },
      { "id": "D", "text": "Option D text" }
    ],
    "correct": "B",
    "explanation": "Why B is correct"
  }
]

Questions should be technical, precise, and test deep understanding. No markdown, only raw JSON.`;

  const result = await askVishesh({ prompt, context: `Assessment generation for ${topic}` });
  
  try {
    const jsonMatch = result?.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    console.error('[Vishesh] Failed to parse assessment JSON');
  }

  // Fallback questions if parsing fails
  return getDefaultQuestions(topic);
}

function getDefaultQuestions(topic) {
  return [
    {
      id: 1,
      question: `What is the foundational principle behind ${topic}?`,
      options: [
        { id: 'A', text: 'Abstraction and encapsulation of complex systems' },
        { id: 'B', text: 'Direct manipulation of raw hardware resources' },
        { id: 'C', text: 'Sequential processing without state management' },
        { id: 'D', text: 'Static compilation without runtime optimization' },
      ],
      correct: 'A',
      explanation: 'Abstraction is the core principle that enables building complex systems from simpler components.',
    },
    {
      id: 2,
      question: `In a high-performance ${topic} system, what optimization strategy minimizes computational drift?`,
      options: [
        { id: 'A', text: 'Implementing a deterministic sharding protocol' },
        { id: 'B', text: 'Applying recurrent feedback loops to intermediate layers' },
        { id: 'C', text: 'Increasing global processing rate while suppressing outliers' },
        { id: 'D', text: 'Reducing node activation thresholds uniformly' },
      ],
      correct: 'B',
      explanation: 'Recurrent feedback loops allow adaptive correction in real-time processing pipelines.',
    },
  ];
}

/**
 * Generate lesson content for a specific topic
 */
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

export { DEFAULT_MODEL, OLLAMA_BASE };
