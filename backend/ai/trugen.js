// TruGen AI API Wrapper
// Makes HTTP requests to the TruGen API endpoints using environment variables.

const TRUGEN_API_KEY = process.env.TRUGEN_API_KEY;
const TRUGEN_API_URL = process.env.TRUGEN_API_URL || 'https://api.trugen.ai/v1';
const TRUGEN_MODEL = process.env.TRUGEN_MODEL || 'trugen-1';

/**
 * Generate a response from TruGen AI
 * @param {string} prompt - The user's prompt
 * @param {Array} contextHistory - Previous conversation messages
 * @returns {Promise<string>} - The AI response
 */
const trugenGenerate = async (prompt, contextHistory = []) => {
  console.log(`[TruGen AI] Generating response for prompt: ${prompt.substring(0, 50)}...`);

  // Check if API key is configured
  if (!TRUGEN_API_KEY || TRUGEN_API_KEY === 'your_trugen_api_key_here') {
    console.warn('[TruGen AI] No API key configured, returning mock response');
    return mockResponse(prompt);
  }

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are Vishesh, an elite AI mentor specializing in software engineering, data structures, algorithms, and career guidance. You provide clear, actionable advice with a focus on practical learning.'
      },
      ...contextHistory.map(msg => ({
        role: msg.role || 'user',
        content: msg.content || msg
      })),
      { role: 'user', content: prompt }
    ];

    const response = await fetch(`${TRUGEN_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TRUGEN_API_KEY}`
      },
      body: JSON.stringify({
        model: TRUGEN_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TruGen AI] API error: ${response.status} - ${errorText}`);
      throw new Error(`TruGen API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in TruGen response');
    }

    console.log(`[TruGen AI] Response received (${content.length} chars)`);
    return content;

  } catch (error) {
    console.error(`[TruGen AI] Error: ${error.message}`);
    // Fallback to mock response on error
    return mockResponse(prompt);
  }
};

/**
 * Stream a response from TruGen AI
 * @param {string} prompt - The user's prompt
 * @param {Array} contextHistory - Previous conversation messages
 * @returns {ReadableStream} - Stream of response chunks
 */
const trugenStream = async (prompt, contextHistory = []) => {
  console.log(`[TruGen AI] Streaming response for prompt: ${prompt.substring(0, 50)}...`);

  if (!TRUGEN_API_KEY || TRUGEN_API_KEY === 'your_trugen_api_key_here') {
    console.warn('[TruGen AI] No API key configured, streaming not available');
    return null;
  }

  const messages = [
    {
      role: 'system',
      content: 'You are Vishesh, an elite AI mentor specializing in software engineering, data structures, algorithms, and career guidance.'
    },
    ...contextHistory.map(msg => ({
      role: msg.role || 'user',
      content: msg.content || msg
    })),
    { role: 'user', content: prompt }
  ];

  const response = await fetch(`${TRUGEN_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TRUGEN_API_KEY}`
    },
    body: JSON.stringify({
      model: TRUGEN_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`TruGen API error: ${response.status}`);
  }

  return response.body;
};

/**
 * Check if TruGen API is configured and available
 * @returns {Promise<boolean>}
 */
const checkTrugenStatus = async () => {
  if (!TRUGEN_API_KEY || TRUGEN_API_KEY === 'your_trugen_api_key_here') {
    return { available: false, reason: 'API key not configured' };
  }

  try {
    const response = await fetch(`${TRUGEN_API_URL}/models`, {
      headers: { 'Authorization': `Bearer ${TRUGEN_API_KEY}` }
    });
    return { available: response.ok, reason: response.ok ? 'Connected' : `HTTP ${response.status}` };
  } catch (error) {
    return { available: false, reason: error.message };
  }
};

/**
 * Mock response for development/fallback
 */
const mockResponse = (prompt) => {
  return `[TruGen Mock] I am Vishesh, your AI mentor. Regarding "${prompt.substring(0, 50)}..." - this is a mock response because the TruGen API key is not configured. Please add your TRUGEN_API_KEY to the .env file to enable real AI responses.`;
};

module.exports = {
  trugenGenerate,
  trugenStream,
  checkTrugenStatus,
  TRUGEN_API_URL,
  TRUGEN_MODEL
};
