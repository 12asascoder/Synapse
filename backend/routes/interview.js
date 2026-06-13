const express = require('express');
const router = express.Router();
const { InterviewPrep, MockInterview, WeakTopic, DSAAttempt } = require('../models');
const { authenticate } = require('../middleware/auth');
const { trugenGenerate } = require('../ai/trugen');

// ─── Setup Interview ─────────────────────────────────────────────────────────

router.post('/setup', authenticate, async (req, res) => {
  try {
    const { company, role, interviewDate, resumeText, jdText } = req.body;
    if (!company || !interviewDate) {
      return res.status(400).json({ error: 'Company and interview date are required' });
    }

    const analysis = await analyzeResumeJD(resumeText, jdText, role, company);
    const dsaQuestions = await generateDSAQuestions(company);

    const prep = await InterviewPrep.create({
      userId: req.user.id,
      company,
      role: role || null,
      interviewDate: new Date(interviewDate),
      resumeText: resumeText || null,
      jdText: jdText || null,
      skillGapAnalysis: analysis.skillGap || null,
      timeline: analysis.timeline || [],
      dsaQuestions: dsaQuestions || [],
      weakTopics: [],
      status: 'active',
    });

    res.json(prep);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function analyzeResumeJD(resumeText, jdText, role, company) {
  const prompt = `You are an interview preparation expert. Analyze the following information and create a preparation plan.

${resumeText ? `RESUME:\n${resumeText}\n` : ''}
${jdText ? `JOB DESCRIPTION:\n${jdText}\n` : ''}
${role ? `ROLE: ${role}\n` : ''}
COMPANY: ${company}

Return a JSON object with:
1. "skillGap": an object with "matchedSkills" (array of strings), "missingSkills" (array of strings), "recommendedFocus" (array of strings), "gapScore" (0-100 number)
2. "timeline": an array of preparation plan items. Each item has: "day" (number), "title" (string), "focus" (string), "duration" (string), "type" (one of: "concept", "practice", "mock", "revision")

Base the timeline on the time until the interview. If no dates are specified, create a 7-day plan.
Only output valid JSON, no other text.`;

  try {
    const result = await trugenGenerate(prompt);
    const parsed = JSON.parse(result);
    return {
      skillGap: parsed.skillGap || { matchedSkills: [], missingSkills: [], recommendedFocus: [], gapScore: 50 },
      timeline: parsed.timeline || [],
    };
  } catch {
    return {
      skillGap: { matchedSkills: [], missingSkills: [], recommendedFocus: ['General preparation'], gapScore: 50 },
      timeline: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1, title: `Day ${i + 1}`, focus: 'General preparation',
        duration: '2 hours', type: i < 5 ? 'concept' : i === 5 ? 'mock' : 'revision',
      })),
    };
  }
}

async function generateDSAQuestions(company) {
  const prompt = `List the top 15 Data Structures & Algorithms questions commonly asked in interviews at ${company}. 

Return a JSON array of objects with:
- "title" (string): question name
- "topic" (string): one of "Arrays", "Strings", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Recursion", "Sorting", "Searching", "Stack", "Queue", "Heap", "Hash Table"
- "difficulty" (string): "Easy", "Medium", or "Hard"
- "frequency" (string): "Most Asked", "Frequently Asked", or "Occasionally Asked"
- "description" (string): brief description of what the question asks

Only output valid JSON array, no other text.`;

  try {
    const result = await trugenGenerate(prompt);
    const parsed = JSON.parse(result);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── Get Prep ────────────────────────────────────────────────────────────────

router.get('/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const preps = await InterviewPrep.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(preps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/active/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const prep = await InterviewPrep.findOne({
      where: { userId: req.params.userId, status: 'active' },
      order: [['createdAt', 'DESC']],
    });
    res.json(prep || { noActivePrep: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Mock Interview ──────────────────────────────────────────────────────────

router.post('/mock/start', authenticate, async (req, res) => {
  try {
    const { prepId, round } = req.body;
    const prep = await InterviewPrep.findOne({ where: { id: prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep not found' });

    const prompt = `You are conducting a ${round || 'technical'} interview for ${prep.company} for the role of ${prep.role || 'Software Engineer'}.
${prep.jdText ? `Job Description: ${prep.jdText}\n` : ''}
Generate 5 interview questions as a JSON array. Each question object has:
- "id" (string unique id)
- "question" (string)
- "category" (string): "technical", "behavioral", "system-design", "problem-solving"
- "difficulty" (string): "easy", "medium", "hard"
- "expectedTopics" (array of strings)

Only output valid JSON array, no other text.`;

    let questions = [];
    try {
      const result = await trugenGenerate(prompt);
      questions = JSON.parse(result);
    } catch {
      questions = Array.from({ length: 5 }, (_, i) => ({
        id: `q-${Date.now()}-${i}`,
        question: `Tell me about a challenging ${round || 'technical'} problem you solved recently.`,
        category: round || 'technical',
        difficulty: 'medium',
        expectedTopics: ['problem-solving'],
      }));
    }

    const session = await MockInterview.create({
      userId: req.user.id,
      interviewPrepId: prepId,
      company: prep.company,
      round: round || 'technical',
      questions,
      responses: [],
      topicScores: {},
      overallScore: 0,
      status: 'in_progress',
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mock/respond', authenticate, async (req, res) => {
  try {
    const { sessionId, questionId, question, answer } = req.body;
    if (!answer || answer.length < 10) {
      return res.status(400).json({ error: 'Answer must be at least 10 characters' });
    }

    const session = await MockInterview.findOne({ where: { id: sessionId, userId: req.user.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const prompt = `Evaluate this interview answer. Be strict and honest.

Question: ${question}
Answer: ${answer}

Return a JSON object with:
- "score" (number 0-100)
- "strengths" (array of strings)
- "weaknesses" (array of strings)
- "suggestedImprovements" (array of strings)
- "topics" (array of strings - topics covered in the answer)

Only output valid JSON, no other text.`;

    let evaluation = { score: 70, strengths: ['Attempted answer'], weaknesses: [], suggestedImprovements: [], topics: [] };
    try {
      const result = await trugenGenerate(prompt);
      evaluation = JSON.parse(result);
    } catch {}

    const responseEntry = {
      questionId: questionId || `q-${Date.now()}`,
      question,
      answer,
      score: evaluation.score || 0,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      suggestedImprovements: evaluation.suggestedImprovements || [],
      topics: evaluation.topics || [],
      submittedAt: new Date().toISOString(),
    };

    const responses = [...(session.responses || []), responseEntry];
    const scores = responses.filter(r => r.score != null).map(r => r.score);
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const topicScores = { ...(session.topicScores || {}) };
    (evaluation.topics || []).forEach(topic => {
      if (!topicScores[topic]) topicScores[topic] = [];
      topicScores[topic].push(evaluation.score || 0);
    });

    await session.update({ responses, overallScore, topicScores });

    res.json({
      feedback: {
        score: evaluation.score || 0,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        suggestedImprovements: evaluation.suggestedImprovements || [],
      },
      sessionProgress: {
        answered: responses.length,
        total: session.questions.length,
        overallScore,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mock/complete', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await MockInterview.findOne({ where: { id: sessionId, userId: req.user.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    await session.update({ status: 'completed' });

    const weakAreas = [];
    const topicScores = session.topicScores || {};
    Object.entries(topicScores).forEach(([topic, scores]) => {
      const avg = Array.isArray(scores) && scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      if (avg < 70) {
        weakAreas.push({ topic, score: avg });
      }
    });

    const prep = await InterviewPrep.findOne({ where: { id: session.interviewPrepId } });
    if (prep) {
      const existingWeak = [...(prep.weakTopics || [])];
      weakAreas.forEach(wa => {
        const idx = existingWeak.findIndex(e => e.topic === wa.topic);
        if (idx >= 0) {
          existingWeak[idx].score = Math.round((existingWeak[idx].score + wa.score) / 2);
        } else {
          existingWeak.push(wa);
        }
      });
      await prep.update({ weakTopics: existingWeak });
    }

    weakAreas.forEach(async (wa) => {
      await WeakTopic.findOrCreate({
        where: { userId: req.user.id, interviewPrepId: session.interviewPrepId, topic: wa.topic },
        defaults: { score: wa.score, attempts: 1, mastered: false, source: 'mock-interview' },
      });
    });

    res.json({ status: 'completed', overallScore: session.overallScore, weakAreas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Post-Interview Analysis ─────────────────────────────────────────────────

router.post('/:prepId/complete', authenticate, async (req, res) => {
  try {
    const { feedback } = req.body;
    const prep = await InterviewPrep.findOne({ where: { id: req.params.prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep not found' });

    const prompt = `The user just completed a real interview at ${prep.company}. They provided this feedback:
${feedback ? JSON.stringify(feedback) : 'No specific feedback provided.'}

Analyze their performance and return a JSON object with:
- "summary" (string): brief analysis of overall performance
- "weakTopics" (array of { topic: string, score: number, recommendation: string })
- "strongTopics" (array of { topic: string, score: number })
- "recommendedFocus" (array of strings)

Only output valid JSON, no other text.`;

    let analysis = { summary: '', weakTopics: [], strongTopics: [], recommendedFocus: [] };
    try {
      const result = await trugenGenerate(prompt);
      analysis = JSON.parse(result);
    } catch {}

    const weakTopics = [...(prep.weakTopics || [])];
    (analysis.weakTopics || []).forEach(wt => {
      const idx = weakTopics.findIndex(e => e.topic === wt.topic);
      if (idx >= 0) weakTopics[idx] = wt;
      else weakTopics.push(wt);
    });

    await prep.update({ weakTopics, status: 'completed', completedAt: new Date() });

    res.json({ analysis, weakTopics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Targeted Re-Interview ───────────────────────────────────────────────────

router.post('/:prepId/weak-reinterview', authenticate, async (req, res) => {
  try {
    const { topics } = req.body;
    const prep = await InterviewPrep.findOne({ where: { id: req.params.prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep not found' });

    const targetTopics = topics || (prep.weakTopics || []).filter(w => !w.mastered).map(w => w.topic);

    if (targetTopics.length === 0) {
      return res.status(400).json({ error: 'No weak topics to focus on. All topics mastered!' });
    }

    const prompt = `Generate 5 interview questions focusing specifically on these topics: ${targetTopics.join(', ')}.

Company: ${prep.company}
Role: ${prep.role || 'Software Engineer'}

Return a JSON array of question objects. Each has:
- "id" (string)
- "question" (string)
- "category" (string)
- "difficulty" (string)
- "expectedTopics" (array of strings, must include at least one of the target topics)

Only output valid JSON array, no other text.`;

    let questions = [];
    try {
      const result = await trugenGenerate(prompt);
      questions = JSON.parse(result);
    } catch {
      questions = targetTopics.slice(0, 5).map((t, i) => ({
        id: `weak-${Date.now()}-${i}`, question: `Explain ${t} in detail with an example.`,
        category: 'technical', difficulty: 'medium', expectedTopics: [t],
      }));
    }

    const session = await MockInterview.create({
      userId: req.user.id,
      interviewPrepId: prep.id,
      company: prep.company,
      round: 'targeted',
      questions,
      responses: [],
      topicScores: {},
      overallScore: 0,
      status: 'in_progress',
    });

    res.json({ session, targetTopics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Mock History ────────────────────────────────────────────────────────────

router.get('/mock/history/:prepId', authenticate, async (req, res) => {
  try {
    const sessions = await MockInterview.findAll({
      where: { userId: req.user.id, interviewPrepId: req.params.prepId },
      order: [['createdAt', 'DESC']],
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DSA Questions ───────────────────────────────────────────────────────────

router.get('/:prepId/dsa-questions', authenticate, async (req, res) => {
  try {
    const prep = await InterviewPrep.findOne({ where: { id: req.params.prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep not found' });

    if (!prep.dsaQuestions || prep.dsaQuestions.length === 0) {
      const dsaQuestions = await generateDSAQuestions(prep.company);
      await prep.update({ dsaQuestions });
      return res.json(dsaQuestions);
    }

    const attempts = await DSAAttempt.findAll({
      where: { userId: req.user.id, company: prep.company },
    });

    const questionsWithStatus = (prep.dsaQuestions || []).map(q => {
      const attempt = attempts.find(a => a.questionTitle === q.title);
      return { ...q, solved: attempt?.solved || false, attemptId: attempt?.id || null };
    });

    res.json(questionsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/dsa/attempt', authenticate, async (req, res) => {
  try {
    const { company, questionTitle, topic, difficulty, frequency, solved, timeTaken, notes } = req.body;
    if (!company || !questionTitle) {
      return res.status(400).json({ error: 'Company and question title are required' });
    }

    const [attempt, created] = await DSAAttempt.findOrCreate({
      where: { userId: req.user.id, company, questionTitle },
      defaults: {
        topic: topic || 'general',
        difficulty: difficulty || 'medium',
        frequency: frequency || 'common',
        solved: solved || false,
        timeTaken: timeTaken || null,
        notes: notes || null,
      },
    });

    if (!created) {
      await attempt.update({ solved: solved !== undefined ? solved : attempt.solved, timeTaken: timeTaken || attempt.timeTaken, notes: notes || attempt.notes });
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dsa/progress/:company', authenticate, async (req, res) => {
  try {
    const attempts = await DSAAttempt.findAll({
      where: { userId: req.user.id, company: req.params.company },
    });

    const total = attempts.length;
    const solved = attempts.filter(a => a.solved).length;

    const byTopic = {};
    attempts.forEach(a => {
      if (!byTopic[a.topic]) byTopic[a.topic] = { total: 0, solved: 0 };
      byTopic[a.topic].total++;
      if (a.solved) byTopic[a.topic].solved++;
    });

    res.json({ total, solved, byTopic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Weak Topics ─────────────────────────────────────────────────────────────

router.get('/:prepId/weak-topics', authenticate, async (req, res) => {
  try {
    const prep = await InterviewPrep.findOne({ where: { id: req.params.prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep not found' });
    res.json(prep.weakTopics || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/weak-topics/master', authenticate, async (req, res) => {
  try {
    const { prepId, topic } = req.body;
    const prep = await InterviewPrep.findOne({ where: { id: prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep not found' });

    const weakTopics = [...(prep.weakTopics || [])];
    const idx = weakTopics.findIndex(w => w.topic === topic);
    if (idx >= 0) weakTopics[idx].mastered = true;
    await prep.update({ weakTopics });

    await WeakTopic.update({ mastered: true }, {
      where: { userId: req.user.id, interviewPrepId: prepId, topic },
    });

    res.json({ success: true, weakTopics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
