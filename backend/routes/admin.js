const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  AssessmentQuestion, Assessment,
  User, Progress, CommunityDiscussion, Achievement, UserAchievement,
} = require('../models');
const { Op } = require('sequelize');

// All routes require SUPER_ADMIN
router.use(authenticate, requireAdmin);

// ─── Assessment Questions ────────────────────────────────────────────────────

router.get('/assessments/questions', async (req, res) => {
  try {
    const questions = await AssessmentQuestion.findAll({ order: [['createdAt', 'DESC']] });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.post('/assessments/questions', async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation, topic, difficulty } = req.body;
    if (!question || !options || correctAnswer === undefined) {
      return res.status(400).json({ error: 'question, options, and correctAnswer are required' });
    }
    const q = await AssessmentQuestion.create({
      question, options, correctAnswer: parseInt(correctAnswer),
      explanation: explanation || '', topic: topic || 'general',
      difficulty: difficulty || 'medium',
    });
    res.status(201).json(q);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

router.put('/assessments/questions/:id', async (req, res) => {
  try {
    const q = await AssessmentQuestion.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    const allowed = ['question', 'options', 'correctAnswer', 'explanation', 'topic', 'difficulty'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await q.update(updates);
    res.json(q);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

router.delete('/assessments/questions/:id', async (req, res) => {
  try {
    const q = await AssessmentQuestion.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    await q.destroy();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

router.get('/assessments/submissions', async (req, res) => {
  try {
    const submissions = await Assessment.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    const userIds = [...new Set(submissions.map(s => s.userId))];
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'name', 'email'],
    });
    const userMap = {};
    users.forEach(u => { userMap[u.id] = { name: u.name, email: u.email }; });
    const enriched = submissions.map(s => ({
      ...s.toJSON(),
      userName: userMap[s.userId]?.name || 'Unknown',
      userEmail: userMap[s.userId]?.email || '',
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ─── Community Moderation ────────────────────────────────────────────────────

router.get('/community/discussions', async (req, res) => {
  try {
    const discussions = await CommunityDiscussion.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'tier'] }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

router.delete('/community/discussions/:id', async (req, res) => {
  try {
    const discussion = await CommunityDiscussion.findByPk(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    await discussion.destroy();
    res.json({ message: 'Discussion deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete discussion' });
  }
});

// ─── Extended Analytics ──────────────────────────────────────────────────────

router.get('/analytics/detailed', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: { updatedAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });
    const totalAssessments = await Assessment.count({ where: { completed: true } });
    const totalQuestions = await AssessmentQuestion.count();
    const totalDiscussions = await CommunityDiscussion.count();

    const allProgress = await Progress.findAll({ attributes: ['growthScore', 'currentDay'] });
    const avgGrowthScore = allProgress.length
      ? Math.round(allProgress.reduce((s, p) => s + p.growthScore, 0) / allProgress.length)
      : 0;

    const scoreRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    allProgress.forEach(p => {
      const s = p.growthScore;
      if (s <= 20) scoreRanges['0-20']++;
      else if (s <= 40) scoreRanges['21-40']++;
      else if (s <= 60) scoreRanges['41-60']++;
      else if (s <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    res.json({
      totalUsers, activeUsers, totalAssessments, totalQuestions,
      totalDiscussions, avgGrowthScore, graduates: 0,
      scoreDistribution: scoreRanges,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
