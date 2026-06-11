const { trugenGenerate } = require('./trugen');

const SYSTEM_PROMPT = `You are an expert interview answer evaluator. Evaluate STAR answers rigorously and provide actionable feedback.

Scoring rubric:
- Structure (followed STAR format): 30pts
- Specificity (concrete details, not generic): 25pts
- Relevance (addresses the question directly): 20pts
- Impact (quantified results, business value): 15pts
- Conciseness (appropriate length, no rambling): 10pts

Output JSON only. Be honest — if the answer is weak, say so and explain why.`;

function localEvaluate(question, answer) {
  const wordCount = answer.split(/\s+/).length;
  const hasQuantifiedResult = /\d+/.test(answer);
  const hasStructure = /(situation|task|action|result)/i.test(answer);
  let score = 0;

  if (hasStructure) score += 20;
  else score += 5;
  if (hasQuantifiedResult) score += 12;
  else score += 3;
  if (wordCount > 50 && wordCount < 500) score += 20;
  else if (wordCount >= 500) score += 10;
  else score += 5;
  score += Math.min(25, Math.round((wordCount / 300) * 25));
  if (answer.length > 20) score += 15;
  score = Math.min(100, score);

  const strengths = [];
  const weaknesses = [];
  if (hasStructure) strengths.push('Follows STAR framework');
  else weaknesses.push('Does not clearly follow STAR format');
  if (hasQuantifiedResult) strengths.push('Includes quantified results');
  else weaknesses.push('Lacks quantified results — add metrics');
  if (wordCount > 100) strengths.push('Appropriate level of detail');
  else weaknesses.push('Answer is too brief, add more context');
  if (strengths.length === 0) strengths.push('Addresses the question');
  if (weaknesses.length === 0) weaknesses.push('Could add more specific technical details');

  return {
    success: true,
    score,
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    suggestedImprovements: weaknesses.map(w => `Improve: ${w.toLowerCase()}`),
    modelAnswer: 'A strong STAR answer clearly defines the Situation and Task, details the specific Actions you took, and quantifies the Result with metrics. Focus on your personal contribution and what you learned.',
  };
}

async function evaluateAnswer(question, answer) {
  try {
    const prompt = `Evaluate this STAR answer for the given question.

Question: ${question}
Answer: ${answer}

Score 0-100 on: Structure (30pts), Specificity (25pts), Relevance (20pts), Impact (15pts), Conciseness (10pts).

Return JSON with: score, strengths (2-3), weaknesses (2-3), suggestedImprovements, modelAnswer.`;
    const result = await trugenGenerate(SYSTEM_PROMPT + '\n\n' + prompt);
    try {
      return JSON.parse(result);
    } catch {
      return localEvaluate(question, answer);
    }
  } catch {
    return localEvaluate(question, answer);
  }
}

module.exports = { evaluateAnswer };
