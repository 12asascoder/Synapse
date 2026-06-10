const express = require('express');
const router = express.Router();
const { trugenGenerate, trugenStream } = require('../ai/trugen');

router.post('/message', async (req, res) => {
  try {
    const { message, contextHistory = [] } = req.body;
    const response = await trugenGenerate(message, contextHistory);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stream', async (req, res) => {
  try {
    const { prompt, contextHistory = [] } = req.body;
    const stream = await trugenStream(prompt, contextHistory);
    if (!stream) {
      const response = await trugenGenerate(prompt, contextHistory);
      return res.json({ response });
    }
    const reader = stream.getReader();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const decoder = new TextDecoder();
    let buffer = '';

    const handleSSELine = (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed === 'data: [DONE]') {
        res.write('data: [DONE]\n\n');
        return;
      }
      if (!trimmed.startsWith('data: ')) return;
      const json = trimmed.slice(6);
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || parsed.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      } catch {
        // skip malformed JSON
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        handleSSELine(line);
      }
    }
    // Process remaining buffer
    if (buffer.trim()) handleSSELine(buffer);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
