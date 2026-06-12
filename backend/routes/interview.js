const express = require('express');
const router = express.Router();
const { InterviewPrep, User, UserProfile } = require('../models');
const { authenticate } = require('../middleware/auth');
const { analyzeJD } = require('../ai/jdAnalyzer');
const { generateQuestions } = require('../ai/starGenerator');
const { evaluateAnswer } = require('../ai/answerEvaluator');
const { generatePassport } = require('../services/passportGenerator');

router.get('/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.id != req.params.userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const prep = await InterviewPrep.findOne({
      where: { userId: req.params.userId, status: ['active', 'completed'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(prep || { noActivePrep: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-jd', authenticate, async (req, res) => {
  try {
    const { jdText } = req.body;
    if (!jdText || jdText.length < 50) {
      return res.status(400).json({ error: 'JD text must be at least 50 characters' });
    }

    const profile = await UserProfile.findOne({ where: { userId: req.user.id } });
    const analysis = await analyzeJD(jdText, profile);

    if (!analysis.success) {
      return res.status(422).json({ error: 'JD analysis failed', detail: 'Could not parse job description' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/plan', authenticate, async (req, res) => {
  try {
    const { jdText, jdAnalysis, targetRole, targetCompany, deadline, mode } = req.body;
    if (!jdText) return res.status(400).json({ error: 'jdText is required' });

    const profile = await UserProfile.findOne({ where: { userId: req.user.id } });
    const analysis = jdAnalysis || await analyzeJD(jdText, profile);
    const prepMode = mode || (deadline ? 'crash' : 'structured');
    const questions = await generateQuestions(analysis, profile || { targetRole, targetCompany }, prepMode);

    const expiresAt = deadline ? new Date(new Date(deadline).getTime() + 24 * 60 * 60 * 1000) : null;

    await InterviewPrep.update({ status: 'archived' }, { where: { userId: req.user.id, status: 'active' } });

    const prep = await InterviewPrep.create({
      userId: req.user.id,
      jdText,
      jdParsed: analysis.data || null,
      jdSummary: analysis.data?.recommendedFocus?.slice(0, 3).join(', ') || targetRole || 'Interview Prep',
      mode: prepMode,
      starQuestions: questions.starQuestions || [],
      oveQuestions: questions.oveQuestions || [],
      answers: [],
      readinessScore: 100 - (analysis.data?.gapScore || 50),
      prepProgress: { questionsAnswered: 0, avgScore: 0, weakAreas: [], sessionsCompleted: 0 },
      status: 'active',
      expiresAt,
    });

    res.json(prep);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/answer', authenticate, async (req, res) => {
  try {
    const { prepId, questionId, question, answer, type } = req.body;
    if (!prepId || !answer || answer.length < 10) {
      return res.status(400).json({ error: 'Answer must be at least 10 characters' });
    }

    const prep = await InterviewPrep.findOne({ where: { id: prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep session not found' });
    if (prep.status !== 'active') return res.status(400).json({ error: 'Prep session is not active' });

    const evaluation = await evaluateAnswer(question || questionId, answer);

    const answerEntry = {
      questionId: questionId || `Q-${Date.now()}`,
      question: question || '',
      answer,
      type: type || 'star',
      score: evaluation.score || 0,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      suggestedImprovements: evaluation.suggestedImprovements || [],
      submittedAt: new Date().toISOString(),
    };

    const answers = [...(prep.answers || []), answerEntry];
    const scores = answers.filter(a => a.score != null).map(a => a.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    await prep.update({
      answers,
      readinessScore: avgScore,
      prepProgress: {
        questionsAnswered: answers.length,
        avgScore,
        weakAreas: evaluation.weaknesses || [],
        sessionsCompleted: prep.prepProgress?.sessionsCompleted || 0,
      },
    });

    res.json({ answer: answerEntry, prepProgress: prep.prepProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/complete', authenticate, async (req, res) => {
  try {
    const { prepId } = req.body;
    const prep = await InterviewPrep.findOne({ where: { id: prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep session not found' });

    const passportResult = await generatePassport(prep);
    if (!passportResult.success) {
      return res.status(500).json({ error: 'Failed to generate passport' });
    }

    await prep.update({
      status: 'completed',
      passport: passportResult.passport,
    });

    res.json({ status: 'completed', passport: passportResult.passport });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/passport/:prepId', authenticate, async (req, res) => {
  try {
    const prep = await InterviewPrep.findOne({
      where: { id: req.params.prepId, userId: req.user.id },
    });
    if (!prep) return res.status(404).json({ error: 'Prep session not found' });
    if (!prep.passport) return res.status(404).json({ error: 'Passport not yet generated' });

    res.json(prep.passport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:prepId/extend', authenticate, async (req, res) => {
  try {
    const prep = await InterviewPrep.findOne({ where: { id: req.params.prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep session not found' });
    if (prep.status !== 'expired') return res.status(400).json({ error: 'Only expired sessions can be extended' });

    const newDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prep.update({ status: 'active', expiresAt: newDeadline });
    res.json(prep);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mock/start', authenticate, async (req, res) => {
  try {
    const { prepId } = req.body;
    const prep = await InterviewPrep.findOne({ where: { id: prepId, userId: req.user.id } });
    if (!prep) return res.status(404).json({ error: 'Prep session not found' });
    if (prep.status !== 'active') return res.status(400).json({ error: 'Prep session is not active' });

    const allQs = [...(prep.starQuestions || []), ...(prep.oveQuestions || [])];
    const answered = new Set((prep.answers || []).map(a => a.questionId));
    const unanswered = allQs.filter(q => !answered.has(q.id));

    if (unanswered.length === 0) {
      return res.status(400).json({ error: 'All questions answered. Complete prep to finish.' });
    }

    const session = {
      id: `mock-${Date.now()}`,
      startedAt: new Date().toISOString(),
      currentIndex: 0,
      questions: unanswered.sort(() => Math.random() - 0.5).slice(0, 5),
      responses: [],
      status: 'in_progress',
    };

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mock/respond', authenticate, async (req, res) => {
  try {
    const { prepId, question, answer, questionId } = req.body;
    if (!answer || answer.length < 10) {
      return res.status(400).json({ error: 'Answer must be at least 10 characters' });
    }

    const evaluation = await evaluateAnswer(question, answer);

    const prep = await InterviewPrep.findOne({ where: { id: prepId, userId: req.user.id } });
    if (prep) {
      const answerEntry = {
        questionId: questionId || `Q-${Date.now()}`,
        question,
        answer,
        type: 'mock',
        score: evaluation.score || 0,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        suggestedImprovements: evaluation.suggestedImprovements || [],
        submittedAt: new Date().toISOString(),
      };
      const answers = [...(prep.answers || []), answerEntry];
      const scores = answers.filter(a => a.score != null).map(a => a.score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      await prep.update({
        answers,
        readinessScore: avgScore,
        prepProgress: {
          questionsAnswered: answers.length,
          avgScore,
          weakAreas: evaluation.weaknesses || [],
          sessionsCompleted: (prep.prepProgress?.sessionsCompleted || 0) + 1,
        },
      });
    }

    res.json({
      feedback: {
        score: evaluation.score || 0,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        suggestedImprovements: evaluation.suggestedImprovements || [],
      },
      nextPrompt: "Great effort! Let's move to the next question. Take a deep breath and apply the feedback you just received.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId/analytics', authenticate, async (req, res) => {
  try {
    if (req.user.id != req.params.userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const allPreps = await InterviewPrep.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'ASC']],
    });

    const preps = allPreps.filter(p => p.answers && p.answers.length > 0);
    const allAnswers = preps.flatMap(p => p.answers || []);
    const scores = allAnswers.filter(a => a.score != null).map(a => a.score);

    const byCategory = {};
    allAnswers.forEach(a => {
      const cat = a.type || 'star';
      if (!byCategory[cat]) byCategory[cat] = [];
      if (a.score != null) byCategory[cat].push(a.score);
    });

    const categoryAverages = {};
    Object.entries(byCategory).forEach(([cat, catScores]) => {
      categoryAverages[cat] = catScores.length > 0
        ? Math.round(catScores.reduce((a, b) => a + b, 0) / catScores.length)
        : 0;
    });

    const strengthCounts = {};
    const weaknessCounts = {};
    allAnswers.forEach(a => {
      (a.strengths || []).forEach(s => { strengthCounts[s] = (strengthCounts[s] || 0) + 1; });
      (a.weaknesses || []).forEach(w => { weaknessCounts[w] = (weaknessCounts[w] || 0) + 1; });
    });

    const progressOverTime = preps.map(p => ({
      date: p.createdAt,
      avgScore: p.prepProgress?.avgScore || 0,
      answered: p.prepProgress?.questionsAnswered || 0,
    }));

    res.json({
      totalSessions: preps.length,
      totalAnswers: allAnswers.length,
      overallAvgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      categoryAverages,
      topStrengths: Object.entries(strengthCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ name: k, count: v })),
      topWeaknesses: Object.entries(weaknessCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ name: k, count: v })),
      progressOverTime,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
